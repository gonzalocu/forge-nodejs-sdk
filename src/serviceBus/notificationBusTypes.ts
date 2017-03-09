
export type EventPredicate = (name: string, body: any) => boolean;

export interface INotificationBus {
	startReceiving(): Promise<any>;
	stopReceiving(): Promise<any>;
	on(eventName: string, listener: Function): void;
	waitOnce(resolvePredicate: EventPredicate, rejectPredicate?: EventPredicate): Promise<any>;
}

export interface INotificationBusOptions {
	url: string;
	notificationBusName: string;
}

export enum MessagePriority {
	Background = 0,
	Foreground = 1
}

export const MessagePriorities = [MessagePriority.Background, MessagePriority.Foreground]; 

