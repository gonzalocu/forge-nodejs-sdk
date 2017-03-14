import * as shortid from "shortid";

import * as Debug from "debug";
const debug = Debug("forgesdk.ForgeNotificationBus");

import {RabbitMqNotificationBus, IRabbitMqNotificationBusOptions} from "./serviceBus/rabbitMq/RabbitMqNotificationBus";
import {AzureNotificationBus, IAzureNotificationBusOptions} from "./serviceBus/azure/AzureNotificationBus";
import {INotificationBus, EventPredicate, INotificationBusOptions} from "./serviceBus/notificationBusTypes";

import {withTimeout} from "./utils";

export interface IForgeNotificationBusOptions
	extends INotificationBusOptions, IRabbitMqNotificationBusOptions, IAzureNotificationBusOptions {

	defaultWaitOnceTimeout?: number;
}

export class ForgeNotificationBus {
	readonly _options: IForgeNotificationBusOptions;
	readonly bus: INotificationBus;
	readonly defaultWaitOnceTimeout: number;

	constructor(options: IForgeNotificationBusOptions) {
		options = Object.assign({}, options);
		options.notificationBusName = options.notificationBusName || "forge-ntf";

		this._options = options;

		if (options.url.startsWith("amqp")) {
			options.queueName = options.queueName || "forge-ntf-sdk-" + shortid.generate();
			this.bus = new RabbitMqNotificationBus(options);
		} else {
			options.subscriptionName = options.subscriptionName	|| "sdk-" + shortid.generate();
			this.bus = new AzureNotificationBus(options);
		}
	}

	startReceiving(): Promise<any> {
		return this.bus.startReceiving();
	}

	on(eventName: string, listener: Function): void {
		return this.bus.on(eventName, listener);
	}

	stopReceiving(): Promise<any> {
		return this.bus.stopReceiving();
	}

	waitOnce(resolvePredicate: EventPredicate, rejectPredicate?: EventPredicate, waitTimeout?: number) {
		const msWaitTimeout = waitTimeout
			|| this._options.defaultWaitOnceTimeout
			|| 120000;

		const myPromise = this.bus.waitOnce(resolvePredicate, rejectPredicate);

		return withTimeout(myPromise, msWaitTimeout);
	}

	waitCommand(cmdId: string, successNotificationName: string, failedNotificationName: string, waitTimeout?: number) {
		successNotificationName = successNotificationName || "CommandSuccessNotification";
		failedNotificationName = failedNotificationName || "CommandFailedNotification";

		if (!cmdId) {
			throw new Error("cmdId not defined");
		}

		debug(`Waiting for command ${cmdId}...`);

		const isSuccessCommand = (name, msg) => {
			if (name !== successNotificationName) {
				return false;
			}

			if (msg.commandId === cmdId && !msg.sagaInfo) {
				return true;
			}

			if (msg.sagaInfo &&
				msg.sagaInfo.originatorId === cmdId &&
				msg.sagaInfo.status === 2) {
				return true;
			}

			return false;
		};
		const isFailedCommand = (name, msg) => {
			if (name !== failedNotificationName) {
				return false;
			}

			if (msg.commandId === cmdId) {
				return true;
			}

			if (msg.sagaInfo &&
				msg.sagaInfo.originatorId === cmdId) {
				return true;
			}

			return false;
		};

		return this.waitOnce(isSuccessCommand, isFailedCommand, waitTimeout)
		.then((msg) => {
			debug(`Command ${cmdId} success.`);
			return msg;
		})
		.catch((e) => {
			const errorMsg = e.message || e.reason;
			debug(`Command ${cmdId} failed, ${errorMsg}.`, e);
			throw new Error(errorMsg);
		});
	}
}
