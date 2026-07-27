/**
 * EVENT LISTENER MANAGEMENT & AUTO-CLEANUP SYSTEM
 * Location: server/eventListenerManager.js
 * Platform: NexusAI v9.5.0 Enterprise Agentic Platform
 */

export class EventListenerManager {
  constructor() {
    this.listeners = new Map();
  }

  addListener(target, event, handler, options = {}) {
    const id = `${target.constructor.name || 'target'}_${event}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    this.listeners.set(id, {
      target,
      event,
      handler,
      options,
      addedAt: Date.now(),
      active: true
    });

    if (target.addEventListener) {
      target.addEventListener(event, handler, options);
    } else if (target.on) {
      target.on(event, handler);
    }

    return id;
  }

  removeListener(id) {
    if (!this.listeners.has(id)) return false;

    const l = this.listeners.get(id);
    if (l.active) {
      if (l.target.removeEventListener) {
        l.target.removeEventListener(l.event, l.handler, l.options);
      } else if (l.target.off) {
        l.target.off(l.event, l.handler);
      }
      l.active = false;
    }

    this.listeners.delete(id);
    return true;
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, l] of this.listeners) {
      if (!l.active || (now - l.addedAt > 1800000)) { // 30 minutes
        this.removeListener(id);
        cleaned++;
      }
    }

    return cleaned;
  }

  getStats() {
    let activeCount = 0;
    const byEvent = {};

    for (const [, l] of this.listeners) {
      if (l.active) activeCount++;
      byEvent[l.event] = (byEvent[l.event] || 0) + 1;
    }

    return {
      total: this.listeners.size,
      active: activeCount,
      byEvent
    };
  }
}

export const listenerManager = new EventListenerManager();
