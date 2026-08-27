import { EventClient } from './plugin.js';
import { AllDevtoolsEvents, TanStackDevtoolsEvent } from './types.js';
/** Maps a type to its public members only (drops `#private`/`private`). */
type PublicSurface<T> = {
    [K in keyof T]: T[K];
};
/**
 * A no-op implementation of `EventClient` with an identical public API.
 *
 * The package root export resolves to this class outside of development (see
 * `index.ts`), so production bundlers can tree-shake the real client away.
 * Authors who want devtools events in production should import the real client
 * from `@tanstack/devtools-event-client/production` instead.
 */
export declare class EventClientNoOp<TEventMap extends Record<string, any>> implements PublicSurface<EventClient<TEventMap>> {
    #private;
    constructor({ pluginId, }: {
        pluginId: string;
        debug?: boolean;
        reconnectEveryMs?: number;
        enabled?: boolean;
    });
    getPluginId(): string;
    createEventPayload<TEvent extends keyof TEventMap & string>(eventSuffix: TEvent, payload: TEventMap[TEvent]): {
        type: string;
        payload: TEventMap[TEvent];
        pluginId: string;
    };
    emit<TEvent extends keyof TEventMap & string>(_eventSuffix: TEvent, _payload: TEventMap[TEvent]): void;
    on<TEvent extends keyof TEventMap & string>(_eventSuffix: TEvent, _cb: (event: TanStackDevtoolsEvent<TEvent, TEventMap[TEvent]>) => void, _options?: {
        withEventTarget?: boolean;
    }): () => void;
    onAll(_cb: (event: TanStackDevtoolsEvent<string, any>) => void): () => void;
    onAllPluginEvents(_cb: (event: AllDevtoolsEvents<TEventMap>) => void): () => void;
}
export {};
