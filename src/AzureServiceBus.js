"use strict";

const debug = require("debug")("azureServiceBus");
const debugTracking = require("debug")("azureServiceBus.tracking");
const events = require("events");
const azure = require("azure"); // see: http://azure.github.io/azure-sdk-for-node/azure-sb/latest/servicebusservice.js.html

/*
Class wrapper around Azure Service Bus Topic/Subscription API.
Usage:

let bus = require("./azureServiceBus.js");
let subscription = new bus.AzureSubscription(SERVICEBUS_CONNECTION, TOPICNAME, SUBSCRIPTIONNAME);

subscription.on(YOURMSGLABEL, (msg) => {
	// Your code to handle the message
});
subscription.createIfNotExists({}, (error) =>{
	if (error) return console.log(error);

	subscription.startReceiving();
});
*/

// OBSOLETE!!! Use Amqp version...
class AzureSubscription {
	constructor(azureBusUrl, topic, subscription) {
		const retryOperations = new azure.ExponentialRetryPolicyFilter();

		this._waitOnceListeners = new Set();

		this.receiving = false;
		this.topic = topic;
		this.subscription = subscription;
		this.receiveWithPeekLock = false;
		this._eventEmitter = new events.EventEmitter();
		this.serviceBusService = azure
			.createServiceBusService(azureBusUrl)
			.withFilter(retryOperations);
	}

	_receiveMessage(receiveTimeout){
		receiveTimeout = receiveTimeout || 60000;
		if (receiveTimeout < 1000) receiveTimeout = 1000;

		let receiveOptions = { isPeekLock: this.receiveWithPeekLock, timeoutIntervalInS : receiveTimeout / 1000};

		return new Promise((resolve, reject) => {

			this.serviceBusService
			.receiveSubscriptionMessage(this.topic, this.subscription, receiveOptions, (error, receivedMessage) => {
				if (error) {
					if (error == "No messages to receive")
						return resolve(null);
					else
						return reject(error);
				}

				if (!receivedMessage || !receivedMessage.body)
					return resolve(null);

				try {
					// Parse body
					//	try to read the body (and check if is serialized with .NET, int this case remove extra characters)
					// http://www.bfcamara.com/post/84113031238/send-a-message-to-an-azure-service-bus-queue-with
					//  "@\u0006string\b3http://schemas.microsoft.com/2003/10/Serialization/?\u000b{ \"a\": \"1\"}"
					let matches = receivedMessage.body.match(/({.*})/);
					if (matches || matches.length >= 1) {
						receivedMessage.body = JSON.parse(matches[0]);
						receivedMessage.body = this._normalizeBody(receivedMessage.body);
					}
				} catch (e) {
					return reject(e);
				}

				resolve(receivedMessage);
			});

		});
	}

	_deleteMessage(message){
		return new Promise((resolve, reject) => {
			this.serviceBusService
			.deleteMessage(message, (error) => {
				if (error) return reject(error);

				return resolve(null);
			});
		});
	}

	_receivingLoop(receiveInterval, receiveTimeout){
		this._receiveMessage(receiveTimeout)
		.then((msg) => {
			if (msg && msg.brokerProperties && msg.brokerProperties.Label) {
				this._emit(msg.brokerProperties.Label, msg.body);

				if (this.receiveWithPeekLock) {
					this._deleteMessage(msg)
					.catch((e) => this._emit("error", e));
				}
			}
			else if (msg) {
				debug("Invalid message format", msg);
			}
		})
		.catch((e) => {
			this._emit("error", e);
		})
		.then(() => {
			if (!this.receiving) return;

			setTimeout(() => this._receivingLoop(receiveInterval, receiveTimeout), receiveInterval);
		});
	}

	// options: {DefaultMessageTimeToLive : "PT10S",AutoDeleteOnIdle : "PT5M"}
	//	note: PT10S=10seconds, PT5M=5minutes
	createIfNotExists(options) {
		options = options || {};

		debug(`Checking subscription ${this.topic}/${this.subscription} ...`);

		return this.exists()
		.then((exists) => {
			if (exists){
				debug(`Subscription ${this.topic}/${this.subscription} already exists.`);
				return;
			}

			return new Promise((resolve, reject) => {
				this.serviceBusService
				.createSubscription(this.topic, this.subscription, options, (error) => {
					if (error) return reject(error);

					debug(`Subscription ${this.topic}/${this.subscription} created.`);
					resolve();
				});
			});

		});
	}

	exists(){
		return new Promise((resolve, reject) => {
			this.serviceBusService
			.getSubscription(this.topic, this.subscription, (error) => {
				if (error) {
					if (error.statusCode === 404)
						return resolve(false);

					return reject(error);
				}

				resolve(true);
			});
		});
	}

	on(msgLabel, listener){
		this._eventEmitter.on(msgLabel, listener);
	}

	_normalizeBody(body){
		// azure use PascalCase, I prefer camelCase
		return toCamel(body);
	}

	_emit(name, body){
		debug(name, body);
		if (name == "CommandSuccessNotification")
			debugTracking(`... ${body.commandId} OK`);
		if (name == "CommandFailedNotification")
			debugTracking(`... ${body.commandId} FAIL`);

		this._eventEmitter.emit(name, body);

		let listeners = this._waitOnceListeners;
		for (let item of listeners) {
			if (item.resolvePredicate && item.resolvePredicate(name, body)){
				item.resolve(body);
				listeners.delete(item);
			}
			else if (item.rejectPredicate && item.rejectPredicate(name, body)){
				item.reject(body);
				listeners.delete(item);
			}
		}
	}

	startReceiving(receiveInterval, receiveTimeout){
		receiveInterval = receiveInterval || 1;

		if (this.receiving) return;

		debug(`Start receiving messages... ${receiveInterval} ${receiveTimeout} `);
		this.receiving = true;

		this._receivingLoop(receiveInterval, receiveTimeout);

		return Promise.resolve(true);
	}

	stopReceiving(){
		this.receiving = false;
		debug("Stop receiving messages.");
	}

	waitOnce(resolvePredicate, rejectPredicate){
		return new Promise((resolve, reject) => {
			this._waitOnceListeners.add({
				resolvePredicate: resolvePredicate,
				rejectPredicate: rejectPredicate,
				resolve: resolve,
				reject: reject
			});
		});
	}
}

function toCamel(o) {
	var build, key, destKey, value;

	if (o instanceof Array) {
		build = [];
		for (key in o) {
			value = o[key];

			if (typeof value === "object") {
				value = toCamel(value);
			}
			build.push(value);
		}
	} else {
		build = {};
		for (key in o) {
			if (o.hasOwnProperty(key)) {
				destKey = (key.charAt(0).toLowerCase() + key.slice(1) || key).toString();
				value = o[key];
				if (value !== null && typeof value === "object") {
					value = toCamel(value);
				}

				build[destKey] = value;
			}
		}
	}
	return build;
}

module.exports.AzureSubscription = AzureSubscription;
