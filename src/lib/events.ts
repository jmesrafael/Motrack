/**
 * In-process domain events (DATA_FLOW.md §5). Emitted by services only, after
 * commit; payload is ids only — subscribers reload what they need.
 */

export interface DomainEventPayload {
  bikeId?: string | undefined;
  scheduleId?: string | undefined;
  entityId?: string | undefined;
}

export type DomainEventName =
  | 'maintenance:changed'
  | 'odometer:changed'
  | 'fuel:changed'
  | 'repair:changed'
  | 'expense:changed'
  | 'schedule:changed'
  | 'document:changed'
  | 'bike:changed'
  | 'settings:changed';

type Listener = (payload: DomainEventPayload) => void;

const listeners = new Map<DomainEventName, Set<Listener>>();

export function onDomainEvent(name: DomainEventName, listener: Listener): () => void {
  let set = listeners.get(name);
  if (set === undefined) {
    set = new Set();
    listeners.set(name, set);
  }
  set.add(listener);
  return () => {
    set.delete(listener);
  };
}

/** Subscribes one listener to several events at once (store invalidation pattern). */
export function onDomainEvents(names: readonly DomainEventName[], listener: Listener): () => void {
  const offs = names.map((name) => onDomainEvent(name, listener));
  return () => {
    for (const off of offs) {
      off();
    }
  };
}

export function emitDomainEvent(name: DomainEventName, payload: DomainEventPayload = {}): void {
  const set = listeners.get(name);
  if (set === undefined) {
    return;
  }
  for (const listener of [...set]) {
    listener(payload);
  }
}
