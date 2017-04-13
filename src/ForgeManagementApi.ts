import {ForgeNotificationBus} from "./ForgeNotificationBus";
import * as ForgeCommands from "./ForgeCommands";

import * as Debug from "debug";
const debug = Debug("forgesdk.ForgeManagementApi");
const debugTracking = require("debug")("forgesdk.ForgeManagementApi.tracking");

const request = require("request");
const uuid = require("uuid");
const urlJoin = require("url-join");

export class ForgeManagementApi {
	KEY: string;
	FORGE_URL: string;
	notificationBus: ForgeNotificationBus | undefined;

	constructor(options: { authKey: string, url: string } ){
		this.KEY = options.authKey;
		this.FORGE_URL = options.url;
		this.notificationBus = undefined;
	}

	post(cmd: ForgeCommands.CommandBase | ForgeCommands.CommandBase[], waitTimeout?: number) {
		if (Array.isArray(cmd))	{
			return this.post(new ForgeCommands.Batch({commands: cmd}));
		}

		if (!cmd.bodyObject) throw new Error("cmd.bodyObject not defined");

		const options = {
			method: "POST",
			url: urlJoin(this.FORGE_URL, "api/command"),
			headers: {
				"Authorization": `GUIShellApp key=${this.KEY}`,
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body : cmd,
			json : true
		};

		let waiterPromise;
		if (this.notificationBus)
			waiterPromise = this.notificationBus.waitCommand(cmd.bodyObject.commandId, undefined, undefined, waitTimeout);
		else
			waiterPromise = Promise.resolve(true);

		debug("Sending command...", cmd);
		debugTracking(`${cmd.name} ${cmd.bodyObject.commandId} ...`);

		var postPromise = new Promise((resolve, reject) => {
			request(options, (error, response, body) => {
				if (error) return reject(error);
				if (response.statusCode !== 204) {
					return reject(new Error(response.statusCode + ":" + body));
				}

				return resolve(cmd.bodyObject);
			});
		});

		return Promise.all([postPromise, waiterPromise])
		.then((values) => values[0]);
	}

	autoWaitCommandNotification(notificationBus: ForgeNotificationBus){
		this.notificationBus = notificationBus;
	}

	get(path: string, questyStringObject?: any): Promise<any> {
		const options = {
			url: urlJoin(this.FORGE_URL, path),
			qs: questyStringObject,
			headers: {
				Authorization: "GUIShellApp key=" + this.KEY,
				Accept: "application/json"
			}
		};

		debug("Requesting " + options.url);

		var promise = new Promise((resolve, reject) => {
			request(options, (error, response, body) => {
				if (error) return reject(error);
				debug("Response status " + response.statusCode);
				if (response.statusCode !== 200) return reject(new Error(response.statusCode));

				resolve(JSON.parse(body));
			});
		});
		return promise;
	}

	// DEPRECATED use getCommits
	// get all events inside a bucket (vsm, wcm)
	//  you can give all events from a given checkpoint (optional)
	//  and skip or limit returned events
	//  options: {from, skip, limit}
	getEvents(bucketId: string, options){
		let safeFromCheckpoint = parseInt(options.from);
		let safeToCheckpoint;

		if (options.skip){
			safeFromCheckpoint += parseInt(options.skip);
		}

		if (options.limit){
			safeToCheckpoint = safeFromCheckpoint + parseInt(options.limit);
		}

		let newOptions: any = { fromCheckpoint: safeFromCheckpoint };

		if (safeToCheckpoint){
			newOptions.toCheckpoint = safeToCheckpoint;
		}

		return this.getCommits(bucketId, newOptions);
	}

	// get all events inside a bucket (vsm, wcm)
	//  you can give all events from a given checkpoint (optional)
	//  to a given checkpoint (optional)
	//  options: {fromCheckpoint, toCheckpoint}
	getCommits(bucketId: string, options){
		return this.get(`api/eventstore/commits/${bucketId}`, options);
	}

	// get all events for a given aggregate inside a bucket (vsm, wcm)
	//  you can filter by minimum or maximum revision (optional)
	//  options: {minRevision, maxRevision}
	getEventsByAggregateId(bucketId: string, aggregateId, options){
		return this.get(`api/eventstore/events/${bucketId}/${aggregateId}`, options);
	}

	getStories (version: string, options){
		// for compatibility with old version
		if (typeof options === "string")
			options = {terms:options};

		return this.get(`deltatre.forge.wcm/api/stories/${version}`, options);
	}
	getStory (version: string, translationId){
		return this.get(`deltatre.forge.wcm/api/stories/${version}/${translationId}`);
	}
	getStoryByCultureSlug (version: string, culture: string, slug: string){
		return this.get(`deltatre.forge.wcm/api/stories/${version}/culture/${culture}/slug/${slug}`);
	}

	getPhotos (version: string, options){
		// for compatibility with old version
		if (typeof options === "string")
			options = {terms:options};

		return this.get(`deltatre.forge.wcm/api/photos/${version}`, options);
	}
	getPhoto (version: string, translationId){
		return this.get(`deltatre.forge.wcm/api/photos/${version}/${translationId}`);
	}
	getPhotoByCultureSlug (version: string, culture: string, slug: string){
		return this.get(`deltatre.forge.wcm/api/photos/${version}/culture/${culture}/slug/${slug}`);
	}
	getPhotoTranslations (version: string, entityId){
		return this.get(`deltatre.forge.wcm/api/photos/${version}/entity/${entityId}`);
	}

	getTags (version: string, options){
		// for compatibility with old version
		if (typeof options === "string")
			options = {terms:options};

		return this.get(`deltatre.forge.wcm/api/tags/${version}`, options);
	}
	getTag (version: string, translationId){
		return this.get(`deltatre.forge.wcm/api/tags/${version}/${translationId}`);
	}
	getTagByCultureSlug (version: string, culture: string, slug: string){
		return this.get(`deltatre.forge.wcm/api/tags/${version}/culture/${culture}/slug/${slug}`);
	}
	getTagTranslations (version: string, entityId){
		return this.get(`deltatre.forge.wcm/api/tags/${version}/entity/${entityId}`);
	}

	getDocuments (version: string, options){
		// for compatibility with old version
		if (typeof options === "string")
			options = {terms:options};

		return this.get(`deltatre.forge.wcm/api/documents/${version}`, options);
	}
	getDocument (version: string, translationId){
		return this.get(`deltatre.forge.wcm/api/documents/${version}/${translationId}`);
	}
	getDocumentByCultureSlug (version: string, culture: string, slug: string){
		return this.get(`deltatre.forge.wcm/api/documents/${version}/culture/${culture}/slug/${slug}`);
	}
	getDocumentTranslations (version: string, entityId){
		return this.get(`deltatre.forge.wcm/api/documents/${version}/entity/${entityId}`);
	}

	getSelections (version: string, options){
		// for compatibility with old version
		if (typeof options === "string")
			options = {terms:options};

		return this.get(`deltatre.forge.wcm/api/selections/${version}`, options);
	}
	getSelection (version: string, translationId){
		return this.get(`deltatre.forge.wcm/api/selections/${version}/${translationId}`);
	}
	getSelectionByCultureSlug (version: string, culture: string, slug: string){
		return this.get(`deltatre.forge.wcm/api/selections/${version}/culture/${culture}/slug/${slug}`);
	}
	getSelectionTranslations (version: string, entityId){
		return this.get(`deltatre.forge.wcm/api/selections/${version}/entity/${entityId}`);
	}


	getAlbum (version: string, translationId){
		return this.get(`deltatre.forge.wcm/api/albums/${version}/${translationId}`);
	}
	getAlbumByCultureSlug (version: string, culture: string, slug: string) {
		return this.get(`deltatre.forge.wcm/api/albums/${version}/culture/${culture}/slug/${slug}`);
	}
	getAlbumTranslations (version: string, entityId){
		return this.get(`deltatre.forge.wcm/api/albums/${version}/entity/${entityId}`);
	}
	getAlbums (version: string, options){
		// for compatibility with old version
		if (typeof options === "string")
			options = {terms:options};

		return this.get(`deltatre.forge.wcm/api/albums/${version}`, options);
	}


	getCustomEntity (entityCode: string, version: string, translationId){
		return this.get(`deltatre.forge.wcm/api/customentities/${entityCode}/${version}/${translationId}`);
	}
	getCustomEntityTranslations (entityCode: string, version: string, entityId){
		return this.get(`deltatre.forge.wcm/api/customentities/${entityCode}/${version}/entity/${entityId}`);
	}
	getCustomEntityBySlug (entityCode: string, version: string, culture: string, slug: string){
		return this.get(`deltatre.forge.wcm/api/customentities/${entityCode}/${version}/culture/${culture}/slug/${slug}`);
	}
	getCustomEntities (entityCode: string, version: string, options){
		// for compatibility with old version
		if (typeof options === "string")
			options = {terms:options};

		return this.get(`deltatre.forge.wcm/api/customentities/${entityCode}/${version}`, options);
	}


	getCheckpoints (bucketId: string){
		return this.get(`api/checkpoints/list/${bucketId}`);
	}

	getPage (pageId){
		return this.get(`deltatre.forge.vsm/api/pages/${pageId}`);
	}

	uuid() {
		return uuid.v4();
	}

	randomSlug() {
		return uuid.v4().toLowerCase();
	}
}
