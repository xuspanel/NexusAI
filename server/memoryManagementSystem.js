/**
 * MEMORY MANAGEMENT & LEAK PREVENTION SYSTEM
 * Location: server/memoryManagementSystem.js
 * Platform: NexusAI v9.5.0 Enterprise Agentic Platform
 */

import os from 'os';

export class MemoryManagementSystem {
  constructor(config = {}) {
    this.config = config;
    this.memoryThresholdMB = config.memoryThresholdMB || 512;
    this.monitoringInterval = config.monitoringInterval || 5000;
    this.memoryHistory = [];
    this.leakDetected = false;
    this.cleanupCallbacks = [];
    this.lastCleanupTime = null;
    this.cleanupCount = 0;
    this._monitorTimer = null;
  }

  start() {
    if (this._monitorTimer) return;
    this._monitorTimer = setInterval(() => {
      this._monitorMemory();
    }, this.monitoringInterval);
    console.log('⚡ [MemoryManagementSystem] Active memory monitoring started.');
  }

  stop() {
    if (this._monitorTimer) {
      clearInterval(this._monitorTimer);
      this._monitorTimer = null;
    }
  }

  registerCleanup(callback) {
    if (typeof callback === 'function') {
      this.cleanupCallbacks.push(callback);
    }
  }

  _monitorMemory() {
    const memoryUsage = this.getMemoryUsage();
    this.memoryHistory.push({
      timestamp: Date.now(),
      ...memoryUsage
    });

    if (this.memoryHistory.length > 500) {
      this.memoryHistory = this.memoryHistory.slice(-500);
    }

    this._checkForLeaks();

    if (memoryUsage.heapUsedMB > this.memoryThresholdMB) {
      this.performCleanup();
    }
  }

  getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const u = process.memoryUsage();
      return {
        heapUsedMB: parseFloat((u.heapUsed / 1024 / 1024).toFixed(1)),
        heapTotalMB: parseFloat((u.heapTotal / 1024 / 1024).toFixed(1)),
        rssMB: parseFloat((u.rss / 1024 / 1024).toFixed(1)),
        externalMB: parseFloat((u.external / 1024 / 1024).toFixed(1)),
        systemFreeMB: parseFloat((os.freemem() / 1024 / 1024).toFixed(1)),
        systemTotalMB: parseFloat((os.totalmem() / 1024 / 1024).toFixed(1))
      };
    }
    return { heapUsedMB: 0, heapTotalMB: 0, rssMB: 0, externalMB: 0 };
  }

  _checkForLeaks() {
    if (this.memoryHistory.length < 20) return;
    const recent = this.memoryHistory.slice(-20);
    let steadyGrowth = true;

    for (let i = 1; i < recent.length; i++) {
      if (recent[i].heapUsedMB <= recent[i - 1].heapUsedMB) {
        steadyGrowth = false;
        break;
      }
    }

    if (steadyGrowth) {
      const growthRate = (recent[recent.length - 1].heapUsedMB - recent[0].heapUsedMB) / recent[0].heapUsedMB;
      if (growthRate > 0.2) {
        this.leakDetected = true;
        console.warn(`⚠️ [Memory Leak Alert] Heap grew by ${(growthRate * 100).toFixed(1)}% steadily.`);
        this.performCleanup();
      }
    } else {
      this.leakDetected = false;
    }
  }

  async performCleanup() {
    console.log('🧹 [MemoryManagementSystem] Executing automated memory cleanup...');
    this.cleanupCount++;
    this.lastCleanupTime = new Date().toISOString();

    for (const callback of this.cleanupCallbacks) {
      try {
        await callback();
      } catch (err) {
        console.warn('⚠️ [Cleanup Callback Error]:', err.message);
      }
    }

    if (global.gc) {
      try {
        global.gc();
        console.log('🔄 [Garbage Collection] V8 gc() executed successfully.');
      } catch {
        // quiet fallback
      }
    }

    const after = this.getMemoryUsage();
    console.log(`✅ [Memory Cleanup Complete] Heap: ${after.heapUsedMB} MB / ${after.heapTotalMB} MB.`);
    return after;
  }

  getMemoryReport() {
    const current = this.getMemoryUsage();
    return {
      current,
      leakDetected: this.leakDetected,
      cleanupCount: this.cleanupCount,
      lastCleanupTime: this.lastCleanupTime,
      historyLength: this.memoryHistory.length
    };
  }
}

export const memoryManager = new MemoryManagementSystem();
