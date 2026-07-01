/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type EventCallback = (...args: unknown[]) => void;

export class EventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  emit(event: string, arg1?: unknown, arg2?: unknown) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      if (arg2 !== undefined) {
        for (const listener of eventListeners) {
          listener(arg1, arg2);
        }
      } else if (arg1 !== undefined) {
        for (const listener of eventListeners) {
          listener(arg1);
        }
      } else {
        for (const listener of eventListeners) {
          listener();
        }
      }
    }
  }
}
