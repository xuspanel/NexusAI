/**
 * INTELLIGENT HIGH-SPEED STREAMING ENGINE
 * Location: server/intelligentStreamingEngine.js
 * Platform: NexusAI v9.5.0 Enterprise Agentic Platform
 */

export class IntelligentStreamingEngine {
  constructor(config = {}) {
    this.config = config;
    this.bufferSize = config.bufferSize || 64; // KB
    this.flushInterval = config.flushInterval || 30; // ms
    this.maxBufferTime = config.maxBufferTime || 3000; // ms
    this.pendingChunks = [];
    this.totalBuffered = 0;
    this.streamMetrics = {
      chunksReceived: 0,
      chunksProcessed: 0,
      totalLatency: 0,
      avgLatency: 0,
      peakMemory: 0,
      startTime: 0,
      endTime: 0
    };
    this._flushTimer = null;
  }

  async processStream(response, callbacks = {}) {
    this.streamMetrics.startTime = Date.now();
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullResponse = '';
    let buffer = '';
    let chunkCount = 0;

    this._startFlushTimer(callbacks);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        chunkCount++;
        this.streamMetrics.chunksReceived++;

        if (chunkCount % 50 === 0) {
          this._checkMemoryUsage();
        }

        if (buffer.length >= this.bufferSize * 1024) {
          const processed = await this._processBuffer(buffer, callbacks);
          fullResponse += processed;
          buffer = '';
        }

        // Non-blocking event loop yielding
        if (chunkCount % 15 === 0) {
          await this._yieldControl();
        }
      }

      if (buffer.length > 0) {
        const processed = await this._processBuffer(buffer, callbacks);
        fullResponse += processed;
      }

      await this._flushPending(callbacks);

      this.streamMetrics.endTime = Date.now();
      const durationSec = (this.streamMetrics.endTime - this.streamMetrics.startTime) / 1000;
      this.streamMetrics.avgLatency = durationSec > 0 ? (this.streamMetrics.chunksReceived / durationSec) : 0;

      if (callbacks.onComplete) {
        await callbacks.onComplete(fullResponse, this.streamMetrics);
      }

      return fullResponse;
    } catch (error) {
      if (callbacks.onError) {
        await callbacks.onError(error);
      }
      throw error;
    } finally {
      this._stopFlushTimer();
    }
  }

  async _processBuffer(buffer, callbacks) {
    if (!buffer) return '';
    if (callbacks.onToken) {
      await callbacks.onToken(buffer);
    }
    this.pendingChunks.push({
      content: buffer,
      timestamp: Date.now(),
      size: buffer.length
    });
    this.totalBuffered += buffer.length;
    this.streamMetrics.chunksProcessed++;
    return buffer;
  }

  async _flushPending(callbacks) {
    if (this.pendingChunks.length === 0) return;

    const batch = this.pendingChunks;
    this.pendingChunks = [];
    this.totalBuffered = 0;

    const fullChunk = batch.map(c => c.content).join('');
    if (callbacks.onBatch) {
      await callbacks.onBatch(fullChunk, {
        chunkCount: batch.length,
        totalSize: fullChunk.length,
        timestamp: Date.now()
      });
    }
  }

  _startFlushTimer(callbacks) {
    if (this._flushTimer) return;
    this._flushTimer = setInterval(async () => {
      if (this.pendingChunks.length > 0) {
        await this._flushPending(callbacks);
      }
    }, this.flushInterval);
  }

  _stopFlushTimer() {
    if (this._flushTimer) {
      clearInterval(this._flushTimer);
      this._flushTimer = null;
    }
  }

  _checkMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      const heapUsedMB = usage.heapUsed / 1024 / 1024;
      if (heapUsedMB > this.streamMetrics.peakMemory) {
        this.streamMetrics.peakMemory = heapUsedMB;
      }
      if (heapUsedMB > 512 && global.gc) {
        global.gc();
      }
    }
  }

  async _yieldControl() {
    return new Promise(resolve => {
      if (typeof setImmediate !== 'undefined') {
        setImmediate(resolve);
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  getMetrics() {
    return { ...this.streamMetrics };
  }
}

export const streamingEngine = new IntelligentStreamingEngine();
