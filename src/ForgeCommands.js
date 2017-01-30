"use strict";

const uuid = require("uuid");

class CommandBase{
	constructor(name, cmd){
		cmd.commandId = cmd.commandId || uuid.v4();

		this.name = name;
		this.bodyObject = cmd;
	}

	id(){
		return this.bodyObject.commandId;
	}
}

class Batch extends CommandBase {
	// {commands}
	constructor(cmd){
		if (!cmd.commands) throw new Error("Invalid commands");

		super("BatchCommand", cmd);
	}
}

// WCM

class CreateStory extends CommandBase {
	// {storyId, translationId, translationInfo}
	constructor(cmd){
		cmd.storyId = cmd.storyId || uuid.v4();
		cmd.translationId = cmd.translationId || uuid.v4();
		if (!cmd.translationInfo) throw new Error("Invalid translationInfo");
		cmd.translationInfo.platform = cmd.translationInfo.platform || "default";

		super("CreateStoryCommand", cmd);
	}
}

class CreatePhoto extends CommandBase {
	// {photoId, translationId, storagePath, originalFileName}
	constructor(cmd){
		cmd.photoId = cmd.photoId || uuid.v4();
		cmd.translationId = cmd.translationId || uuid.v4();

		super("CreatePhotoCommand", cmd);
	}
}

class CreateDocument extends CommandBase {
	// {documentId, translationId, storagePath, originalFileName}
	constructor(cmd){
		cmd.documentId = cmd.documentId || uuid.v4();
		cmd.translationId = cmd.translationId || uuid.v4();

		super("CreateDocumentCommand", cmd);
	}
}

class CreateCustomEntity extends CommandBase {
	//{entityId, translationId, entityCode}
	constructor(cmd){
		cmd.entityId = cmd.entityId || uuid.v4();
		cmd.translationId = cmd.translationId || uuid.v4();
		super("CreateCustomEntityCommand", cmd);
	}
}

class CreateTag extends CommandBase {
	// {tagId, translationId, title, [slug]}
	constructor(cmd){
		cmd.tagId = cmd.tagId || uuid.v4();
		cmd.translationId = cmd.translationId || uuid.v4();
		super("CreateTagCommand", cmd);
	}
}

class CreateExternalTag extends CommandBase {
	// {tagId, translationId, title, [slug], dataSourceId, dataSourceName}
	constructor(cmd){
		cmd.tagId = cmd.tagId || uuid.v4();
		cmd.translationId = cmd.translationId || uuid.v4();
		super("CreateExternalTagCommand", cmd);
	}
}

class CreateCustomEntityTag extends CommandBase {
	// {tagId, translationId, title, [slug], entityTranslationId, entityCode}
	constructor(cmd){
		cmd.tagId = cmd.tagId || uuid.v4();
		cmd.translationId = cmd.translationId || uuid.v4();
		super("CreateCustomEntityTagCommand", cmd);
	}
}

class CreateAlbum extends CommandBase {
	// {albumId, translationId}
	constructor(cmd){
		cmd = cmd || {};
		cmd.albumId = cmd.albumId || uuid.v4();
		cmd.translationId = cmd.translationId || uuid.v4();

		super("CreateAlbumCommand", cmd);
	}
}

class CreateSelection extends CommandBase {
	// {selectionId, translationId}
	constructor(cmd){
		cmd = cmd || {};
		cmd.selectionId = cmd.selectionId || uuid.v4();
		cmd.translationId = cmd.translationId || uuid.v4();

		super("CreateSelectionCommand", cmd);
	}
}

class SetTitle extends CommandBase {
	// {aggregateId, aggregateType, translationId, title}
	constructor(cmd){
		super("SetTitleCommand", cmd);
	}
}

class SetSlug extends CommandBase {
	// {aggregateId, aggregateType, translationId, slug}
	constructor(cmd){
		super("SetSlugCommand", cmd);
	}
}

class SetDescription extends CommandBase {
	// {aggregateId, aggregateType, translationId, description (markdown)}
	constructor(cmd){
		super("SetDescriptionCommand", cmd);
	}
}

class SetContentDate extends CommandBase {
	// {aggregateId, aggregateType, translationId, contentDate (string as json date)}
	constructor(cmd){
		super("SetContentDateCommand", cmd);
	}
}

class SetThumbnail extends CommandBase {
	// {aggregateId, aggregateType, photoId}
	constructor(cmd){
		super("SetThumbnailCommand", cmd);
	}
}

class UnsetThumbnail extends CommandBase {
	// {aggregateId, aggregateType}
	constructor(cmd){
		super("UnsetThumbnailCommand", cmd);
	}
}

class SetContext extends CommandBase {
	// {aggregateId, aggregateType, relatedItem}
	constructor(cmd){
		super("SetContextCommand", cmd);
	}
}

class UnsetContext extends CommandBase {
	// {aggregateId, aggregateType}
	constructor(cmd){
		super("UnsetContextCommand", cmd);
	}
}

class AddAlbumItems extends CommandBase {
	//{albumId, items {id, elementType, element { entityId } } , position}
	constructor(cmd){
		cmd.position = cmd.position || 9999;
		super("AddAlbumItemsCommand", cmd);
	}
}

class AddSelectionItems extends CommandBase {
	//{selectionId, items {id, elementType, element { entityId } } , position}
	constructor(cmd){
		cmd.position = cmd.position || 9999;
		super("AddSelectionItemsCommand", cmd);
	}
}

class DeleteAlbumItems extends CommandBase {
	//{albumId, albumItemIds}
	constructor(cmd){
		super("DeleteAlbumItemsCommand", cmd);
	}
}

class MoveAlbumItem extends CommandBase {
	//{albumId, albumItemId, position}
	constructor(cmd){
		super("MoveAlbumItemCommand", cmd);
	}
}

class Publish extends CommandBase {
	//{aggregateId, aggregateType, translationId}
	constructor(cmd){
		super("PublishCommand", cmd);
	}
}

class Unpublish extends CommandBase {
	//{aggregateId, aggregateType, translationId}
	constructor(cmd){
		super("UnpublishCommand", cmd);
	}
}

class Archive extends CommandBase {
	//{aggregateId, aggregateType, translationId}
	constructor(cmd){
		super("ArchiveCommand", cmd);
	}
}

class AddStoryPart extends CommandBase {
	// cmd: {storyId, translationId, position, storyPart: {partType, partBody, partId} }
	constructor(cmd){
		cmd.storyPart.partBodyJson = JSON.stringify(cmd.storyPart.partBody);
		delete cmd.storyPart.partBody;
		cmd.storyPart.partId = cmd.storyPart.partId || uuid.v4();
		super("AddStoryPartCommand", cmd);
	}
}

class SetStoryHeadline extends CommandBase {
	// cmd: {storyId, translationId, headline}
	constructor(cmd){
		super("SetStoryHeadlineCommand", cmd);
	}
}

class SetExtendedFields extends CommandBase {
	// cmd: {aggregateId, aggregateType, translationId, values}
	constructor(cmd){
		super("SetExtendedFieldsCommand", cmd);
	}
}

class SetFeatured extends CommandBase {
	// cmd: {aggregateId, aggregateType, featured}
	constructor(cmd){
		super("SetFeaturedCommand", cmd);
	}
}

class SetFile extends CommandBase {
	// cmd: {aggregateId, aggregateType, translationId, storagePath, originalFileName}
	constructor(cmd){
		super("SetFileCommand", cmd);
	}
}

class SetStoryPartExtendedFields extends CommandBase {
	// cmd: {storyId, translationId, partId, values }
	constructor(cmd){
		super("SetStoryPartExtendedFieldsCommand", cmd);
	}
}

class AddEntityRelation extends CommandBase {
	// cmd: { aggregateId, aggregateType, relatedItem { entityType, entityId } }
	constructor(cmd){
		super("AddEntityRelationCommand", cmd);
	}
}

class MoveEntityRelation extends CommandBase {
	// cmd: { aggregateId, aggregateType, relatedItem { entityType, entityId }, position }
	constructor(cmd){
		super("MoveEntityRelationCommand", cmd);
	}
}

class SetPhotoCropArea extends CommandBase {
	// cmd: { photoId, format, formatProperty { crop { x, y, height, width } } }
	constructor(cmd) {
		super("SetPhotoCropAreaCommand", cmd);
	}
}

class UnsetPhotoCropArea extends CommandBase {
	// cmd: { aggregateId, format }
	constructor(cmd) {
		super("UnsetPhotoCropAreaCommand", cmd);
	}
}

class SetPhotoGravity extends CommandBase {
	// cmd: { photoId, crop { x, y, height, width } }
	constructor(cmd) {
		super("SetPhotoGravityCommand", cmd);
	}
}

class UnsetPhotoGravity extends CommandBase {
	// cmd: { aggregateId }
	constructor(cmd) {
		super("UnsetPhotoGravityCommand", cmd);
	}
}

class ExtractPhotoMetadata extends CommandBase {
	// cmd: { aggregateId }
	constructor(cmd) {
		super("ExtractPhotoMetadataCommand", cmd);
	}
}

class AddTranslation extends CommandBase {
	// cmd: { aggregateId, aggregateType, translationId, translationInfo, [cloneFromTranslationId] }
	constructor(cmd) {
		cmd.translationId = cmd.translationId || uuid.v4();
		if (!cmd.translationInfo) throw new Error("Invalid translationInfo");
		cmd.translationInfo.platform = cmd.translationInfo.platform || "default";

		super("AddTranslationCommand", cmd);
	}
}

class RemoveTranslation extends CommandBase {
	// cmd: { aggregateId, aggregateType, translationId }
	constructor(cmd) {
		super("RemoveTranslationCommand", cmd);
	}
}

class SetTranslationVisibility extends CommandBase {
	// cmd: { aggregateId, aggregateType, translationId, visibility }
	constructor(cmd) {
		if (!cmd.visibility) throw new Error("Invalid visibility");

		super("SetTranslationVisibilityCommand", cmd);
	}
}

class ImportFeeds extends CommandBase {
	// cmd: { items : [ {id, sourceName}, {id, sourceName}, ... ] }
	constructor(cmd) {
		super("ImportFeedsCommand", cmd);
	}
}

class UploadPhoto extends CommandBase {
	// cmd: { photoId, translationId, sourceUrl, [title], [slug] }
	constructor(cmd) {
		super("UploadPhotoCommand", cmd);
	}
}

class UploadDocument extends CommandBase {
	// cmd: { documentId, translationId, sourceUrl, [title], [slug] }
	constructor(cmd) {
		super("UploadDocumentCommand", cmd);
	}
}

// VSM

class AddSitePage extends CommandBase {
	// cmd: {path}
	//  notification: SitePageAddedNotification {itemId}
	constructor(cmd){
		super("AddSitePageCommand", cmd);
	}
}

class AddSiteMenu extends CommandBase {
	// cmd: {path}
	//  notification: SiteMenuAddedNotification {itemId, fullPath}
	constructor(cmd){
		super("AddSiteMenuCommand", cmd);
	}
}

class AddMenuItem extends CommandBase {
	// cmd: {menuId, itemId, [properties, parentId, position]}
	constructor(cmd){
		super("AddMenuItemCommand", cmd);
	}
}

class AddVariablesToMenu extends CommandBase {
	// cmd: {itemId, variables}
	constructor(cmd){
		super("AddVariablesToMenuCommand", cmd);
	}
}

class PublishMenu extends CommandBase {
	// cmd: {itemId}
	constructor(cmd){
		super("PublishMenuCommand", cmd);
	}
}

class PublishPage extends CommandBase {
	// cmd: {itemId}
	constructor(cmd){
		super("PublishPageCommand", cmd);
	}
}

class PublishDirectory extends CommandBase {
	// cmd: {itemId}
	constructor(cmd){
		super("PublishDirectoryCommand", cmd);
	}
}

class ChangePageTemplate extends CommandBase {
	// cmd: {pageId, template{ id, namespace } }
	//  notification: PageTemplateChanged {instanceId}
	constructor(cmd){
		super("ChangePageTemplateCommand", cmd);
	}
}

class RemoveSitePage extends CommandBase {
	// cmd: {pageId }
	constructor(cmd){
		super("RemoveSitePageCommand", cmd);
	}
}

class RemoveSiteMenu extends CommandBase {
	// cmd: {menuId }
	constructor(cmd){
		super("RemoveSiteMenuCommand", cmd);
	}
}

class RemoveSiteDirectory extends CommandBase {
	// cmd: {directoryId }
	constructor(cmd){
		super("RemoveSiteDirectoryCommand", cmd);
	}
}

class AddLayoutToSlot extends CommandBase {
	// cmd: {pageId, parentInstanceId, slot, layoutKey {id, namespace} }
	//  notification: ModuleAddedToSlot {instanceId}
	constructor(cmd){
		super("AddLayoutToSlotCommand", cmd);
	}
}

class AddModuleToSlot extends CommandBase {
	// cmd: {pageId, parentInstanceId, slot, moduleKey {id, namespace} }
	//  notification: ModuleAddedToSlot {instanceId}
	constructor(cmd){
		super("AddModuleToSlotCommand", cmd);
	}
}

class AddVariablesToPage extends CommandBase {
	// cmd: {commandId, itemId, variables [{key, variableType(KeyValue/DataItem/DataList/Script/StyleSheet), jsonBody}] }
	constructor(cmd){
		super("AddVariablesToPageCommand", cmd);
	}
}

class AddVariablesToDirectory extends CommandBase {
	// cmd: {commandId, itemId, variables [{key, variableType(KeyValue/DataItem/DataList/Script/StyleSheet), jsonBody}] }
	constructor(cmd){
		super("AddVariablesToDirectoryCommand", cmd);
	}
}

class DeletePageVariables extends CommandBase {
	// cmd: {commandId, itemId, variableKeys[] }
	constructor(cmd){
		super("DeletePageVariablesCommand", cmd);
	}
}

class DeleteDirectoryVariables extends CommandBase {
	// cmd: {commandId, itemId, variableKeys[] }
	constructor(cmd){
		super("DeleteDirectoryVariablesCommand", cmd);
	}
}

class DeleteMenuVariables extends CommandBase {
	// cmd: {commandId, itemId, variableKeys[] }
	constructor(cmd){
		super("DeleteMenuVariablesCommand", cmd);
	}
}

class SetLayoutProperties extends CommandBase {
	// cmd: {commandId, pageId, layoutInstanceId, layoutKey?, properties {key, value}}
	constructor(cmd){
		super("SetLayoutPropertiesCommand", cmd);
	}
}

class SetModuleProperties extends CommandBase {
	// cmd: {commandId, pageId, moduleInstanceId, properties {key, value}}
	constructor(cmd){
		super("SetModulePropertiesCommand", cmd);
	}
}

class RemoveLinkRuleFromPage extends CommandBase {
	// cmd: {commandId, linkRuleId}
	constructor(cmd){
		super("RemoveLinkRuleFromPageCommand", cmd);
	}
}

class CreateLinkRuleForPage extends CommandBase {
	// cmd: {commandId, pageId, entityType, priority, properties {key, value}}
	constructor(cmd){
		super("CreateLinkRuleForPageCommand", cmd);
	}
}

class GenerateDiff extends CommandBase {
	// cmd: {aggregateId, aggregateType, leftRevision, rightRevision? }
	constructor(cmd){
		super("GenerateDiffCommand", cmd);
	}
}

class Rollback extends CommandBase {
	// cmd: {aggregateId, aggregateType, aggregateRevision }
	constructor(cmd){
		super("RollbackCommand", cmd);
	}
}

class CreateCheckpoint extends CommandBase {
	// cmd: { checkpointId, label, bucketId }
	constructor(cmd){
		super("CreateCheckpointCommand", cmd);
	}
}

class DeleteCheckpoint extends CommandBase {
	// cmd: { checkpointId }
	constructor(cmd){
		super("DeleteCheckpointCommand", cmd);
	}
}

class RestoreCheckpoint extends CommandBase {
	// cmd: { checkpointId }
	constructor(cmd){
		super("RestoreCheckpointCommand", cmd);
	}
}

class ImportNode extends CommandBase {
	// cmd: { importId, targetPath, node { structureNode : SiteNodeTradeContract, memento : MementoContract, mode : ImportMode}, pagesWithLinkRules }
	constructor(cmd){
		super("ImportNodeCommand", cmd);
	}
}

class ExportNode extends CommandBase {
	// cmd: { path, exportId, description }
	constructor(cmd){
		super("ExportNodeCommand", cmd);
	}
}


module.exports = {
	CommandBase : CommandBase,
	Batch : Batch,
	// WCM
	CreateStory : CreateStory,
	CreatePhoto : CreatePhoto,
	CreateAlbum : CreateAlbum,
	CreateTag : CreateTag,
	CreateExternalTag : CreateExternalTag,
	CreateCustomEntityTag : CreateCustomEntityTag,
	CreateSelection : CreateSelection,
	CreateCustomEntity : CreateCustomEntity,
	CreateDocument : CreateDocument,
	SetStoryHeadline : SetStoryHeadline,
	SetTitle : SetTitle,
	SetSlug : SetSlug,
	SetDescription : SetDescription,
	SetContentDate : SetContentDate,
	SetThumbnail : SetThumbnail,
	UnsetThumbnail : UnsetThumbnail,
	SetContext : SetContext,
	UnsetContext : UnsetContext,
	AddAlbumItems : AddAlbumItems,
	AddSelectionItems : AddSelectionItems,
	DeleteAlbumItems : DeleteAlbumItems,
	MoveAlbumItem : MoveAlbumItem,
	Archive : Archive,
	Publish : Publish,
	Unpublish : Unpublish,
	AddStoryPart : AddStoryPart,
	SetExtendedFields : SetExtendedFields,
	SetStoryPartExtendedFields : SetStoryPartExtendedFields,
	AddEntityRelation : AddEntityRelation,
	MoveEntityRelation: MoveEntityRelation,
	SetPhotoCropArea : SetPhotoCropArea,
	UnsetPhotoCropArea : UnsetPhotoCropArea,
	SetPhotoGravity: SetPhotoGravity,
	UnsetPhotoGravity : UnsetPhotoGravity,
	ExtractPhotoMetadata : ExtractPhotoMetadata,
	SetFile : SetFile,
	SetFeatured : SetFeatured,
	AddTranslation : AddTranslation,
	RemoveTranslation : RemoveTranslation,
	SetTranslationVisibility : SetTranslationVisibility,
	ImportFeeds : ImportFeeds,
	UploadPhoto : UploadPhoto,
	UploadDocument : UploadDocument,
	// VSM
	AddSitePage : AddSitePage,
	ChangePageTemplate : ChangePageTemplate,
	AddModuleToSlot : AddModuleToSlot,
	AddLayoutToSlot : AddLayoutToSlot,
	AddVariablesToPage : AddVariablesToPage,
	AddVariablesToDirectory : AddVariablesToDirectory,
	RemoveSitePage : RemoveSitePage,
	RemoveSiteMenu : RemoveSiteMenu,
	RemoveSiteDirectory : RemoveSiteDirectory,
	SetLayoutProperties : SetLayoutProperties,
	SetModuleProperties : SetModuleProperties,
	AddSiteMenu : AddSiteMenu,
	AddMenuItem : AddMenuItem,
	AddVariablesToMenu : AddVariablesToMenu,
	PublishMenu : PublishMenu,
	PublishPage : PublishPage,
	PublishDirectory : PublishDirectory,
	RemoveLinkRuleFromPage : RemoveLinkRuleFromPage,
	CreateLinkRuleForPage : CreateLinkRuleForPage,
	DeletePageVariables : DeletePageVariables,
	DeleteDirectoryVariables : DeleteDirectoryVariables,
	DeleteMenuVariables : DeleteMenuVariables,
	GenerateDiff : GenerateDiff,
	Rollback : Rollback,
	CreateCheckpoint : CreateCheckpoint,
	RestoreCheckpoint : RestoreCheckpoint,
	DeleteCheckpoint : DeleteCheckpoint,
	ExportNode : ExportNode,
	ImportNode : ImportNode
};
