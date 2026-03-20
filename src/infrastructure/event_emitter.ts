export interface DomainEvent {
  readonly eventType: string;
  readonly occurredAt: Date;
}

export type EventHandler<T extends DomainEvent> = (event: T) => void;


export interface IEventEmitter {
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void;

  unsubscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void;

  emit<T extends DomainEvent>(eventType: string, payload: T): void;
}


// Map of event types to arrays of handler functions
// Using any here for the handlers because we need to store handlers of different types
// The type safety is enforced at the subscribe/emit call sites
export class EventEmitter implements IEventEmitter {
  private handlers: Map<string, Array<EventHandler<any>>> = new Map();

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    // Get existing handlers for this event type, or create a new array
    const existingHandlers = this.handlers.get(eventType) || [];
    
    // Add the new handler
    existingHandlers.push(handler);
    
    // Update the map
    this.handlers.set(eventType, existingHandlers);
    
    console.log(`[EventEmitter] Subscribed to event: ${eventType}`);
  }


  unsubscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    const existingHandlers = this.handlers.get(eventType);
    
    if (!existingHandlers) {
      console.warn(
        `[EventEmitter] Cannot unsubscribe: no handlers found for event type "${eventType}"`
      );
      return;
    }
    
    // Filter out the handler we want to remove
    const updatedHandlers = existingHandlers.filter((h) => h !== handler);
    
    if (updatedHandlers.length === existingHandlers.length) {
      console.warn(
        `[EventEmitter] Handler not found for event type "${eventType}"`
      );
      return;
    }
    
    // Update the map
    if (updatedHandlers.length === 0) {
      // Remove the event type entirely if no handlers left
      this.handlers.delete(eventType);
    } else {
      this.handlers.set(eventType, updatedHandlers);
    }
    
    console.log(`[EventEmitter] Unsubscribed from event: ${eventType}`);
  }

  emit<T extends DomainEvent>(eventType: string, payload: T): void {
    const handlers = this.handlers.get(eventType);
    
    if (!handlers || handlers.length === 0) {
      console.log(
        `[EventEmitter] No handlers registered for event type: ${eventType}`
      );
      return;
    }
    
    console.log(
      `[EventEmitter] Emitting event: ${eventType} to ${handlers.length} handler(s)`
    );
    
    // Call each handler with the payload
    // Wrap in try-catch to prevent one handler's error from stopping others
    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error(
          `[EventEmitter] Error in handler for event ${eventType}:`,
          error
        );
      }
    });
  }

  getHandlerCount(eventType: string): number {
    const handlers = this.handlers.get(eventType);
    return handlers ? handlers.length : 0;
  }

  clearHandlers(eventType?: string): void {
    if (eventType) {
      this.handlers.delete(eventType);
      console.log(`[EventEmitter] Cleared all handlers for: ${eventType}`);
    } else {
      this.handlers.clear();
      console.log(`[EventEmitter] Cleared all handlers`);
    }
  }

  getEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}