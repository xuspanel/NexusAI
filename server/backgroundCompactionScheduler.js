/**
 * BACKGROUND COMPACTION SCHEDULER & IDLE MONITOR
 * Location: server/backgroundCompactionScheduler.js
 * Platform: NexusAI v9.5.0 Enterprise Agentic Platform
 */

import { compactionEngine } from './compactionEngine.js';

export class BackgroundCompactionScheduler {
  constructor(config = {}) {
    this.config = {
      checkIntervalMs: config.checkIntervalMs || 60000,
      idleThresholdMs: config.idleThresholdMs || 10000,
      triggerThreshold: config.triggerThreshold || 60,
      ...config
    };

    this.scheduledQueue = [];
    this.activeCompactions = new Set();
    this.isRunning = false;
    this.lastUserInteraction = Date.now();
    this._checkTimer = null;
    this.stats = {
      completed: 0,
      failed: 0,
      scheduled: 0
    };
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this._checkTimer = setInterval(() => {
      this._checkQueueAndIdle();
    }, this.config.checkIntervalMs);

    console.log('🔄 [BackgroundCompactionScheduler] Background scheduler active.');
  }

  stop() {
    if (this._checkTimer) {
      clearInterval(this._checkTimer);
      this._checkTimer = null;
    }
    this.isRunning = false;
  }

  recordUserActivity() {
    this.lastUserInteraction = Date.now();
  }

  isSystemIdle() {
    const timeSinceUser = Date.now() - this.lastUserInteraction;
    if (timeSinceUser < this.config.idleThresholdMs) {
      return false;
    }
    if (compactionEngine.isCompacting) {
      return false;
    }
    return true;
  }

  scheduleConversation(conversation, options = {}) {
    if (!conversation || !conversation.messages) return;
    if (conversation.messages.length < this.config.triggerThreshold) return;

    if (!this.scheduledQueue.some(item => item.conversation.id === conversation.id)) {
      this.scheduledQueue.push({ conversation, options, scheduledAt: Date.now() });
      this.stats.scheduled++;
    }

    if (this.isSystemIdle()) {
      this._processNextInQueue();
    }
  }

  async _checkQueueAndIdle() {
    if (!this.isSystemIdle() || this.scheduledQueue.length === 0) return;
    await this._processNextInQueue();
  }

  async _processNextInQueue() {
    if (this.scheduledQueue.length === 0 || compactionEngine.isCompacting) return;

    const item = this.scheduledQueue.shift();
    if (!item) return;

    this.activeCompactions.add(item.conversation.id);

    try {
      const res = await compactionEngine.compactConversation(item.conversation, item.options);
      if (res.compacted) {
        this.stats.completed++;
        console.log(`✅ [Background Compactor] Compacted conversation ${item.conversation.id}: ${res.originalCount} -> ${res.newCount} msgs.`);
      } else {
        this.stats.failed++;
      }
    } catch (err) {
      this.stats.failed++;
      console.warn('⚠️ [Background Compactor Failed]:', err.message);
    } finally {
      this.activeCompactions.delete(item.conversation.id);
    }
  }

  getStats() {
    return {
      ...this.stats,
      queueLength: this.scheduledQueue.length,
      activeCompactions: this.activeCompactions.size,
      isIdle: this.isSystemIdle()
    };
  }
}

export const compactionScheduler = new BackgroundCompactionScheduler();
