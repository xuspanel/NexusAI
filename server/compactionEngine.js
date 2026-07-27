/**
 * INTELLIGENT CONVERSATION COMPACTION ENGINE
 * Location: server/compactionEngine.js
 * Platform: NexusAI v9.5.0 Enterprise Agentic Platform
 */

export class ConversationCompactionEngine {
  constructor(config = {}) {
    this.config = {
      maxMessagesBeforeCompaction: config.maxMessagesBeforeCompaction || 50,
      compactionTriggerThreshold: config.compactionTriggerThreshold || 80,
      summaryLength: config.summaryLength || 3,
      preserveImportant: config.preserveImportant !== false,
      ollamaHost: config.ollamaHost || 'http://localhost:11434',
      ...config
    };

    this.isCompacting = false;
    this.compactionQueue = [];
    this.summaryCache = new Map();
    this.stats = {
      totalCompactions: 0,
      messagesCompacted: 0,
      memorySavedBytes: 0,
      avgCompactionTimeMs: 0,
      lastCompactionTime: null
    };
  }

  async compactConversation(conversation = {}, options = {}) {
    const startTime = Date.now();
    const messages = conversation.messages || [];

    if (messages.length < this.config.maxMessagesBeforeCompaction) {
      return {
        compacted: false,
        reason: 'Message count below compaction threshold',
        messageCount: messages.length,
        conversation
      };
    }

    if (this.isCompacting) {
      this.compactionQueue.push({ conversation, options });
      return {
        compacted: false,
        queued: true,
        reason: 'Engine busy; queued for background processing',
        conversation
      };
    }

    this.isCompacting = true;

    try {
      // Step 1: Analyze Message Importance (0-100 Score)
      const importanceScores = this.analyzeMessageImportance(messages);

      // Step 2: Categorize Messages (Keep, Compact, Summarize)
      const { keep, summarize } = this.categorizeMessages(messages, importanceScores);

      // Step 3: Generate AI Summaries for Compacted Groups
      const summaries = await this.generateSummaries(summarize, options);

      // Step 4: Build Compacted Conversation Structure
      const compactedConversation = this.buildCompactedConversation(keep, summaries, conversation);

      // Step 5: Update Metrics
      const durationMs = Date.now() - startTime;
      const compactedCount = messages.length - compactedConversation.messages.length;
      this.updateStats(messages.length, compactedConversation.messages.length, durationMs);

      return {
        compacted: true,
        originalCount: messages.length,
        newCount: compactedConversation.messages.length,
        compactedCount,
        summaryCount: summaries.length,
        durationMs,
        conversation: compactedConversation
      };
    } catch (err) {
      console.warn('⚠️ [Compaction Engine Error]:', err.message);
      return {
        compacted: false,
        error: err.message,
        conversation: this.createFallbackCompaction(conversation)
      };
    } finally {
      this.isCompacting = false;
      this.processQueue();
    }
  }

  analyzeMessageImportance(messages = []) {
    const total = messages.length;
    return messages.map((msg, index) => {
      let score = 0;
      const content = msg.content || '';
      const isUser = msg.sender === 'user' || msg.role === 'user';

      // 1. Recency Weight (0-25 points)
      score += (index / total) * 25;

      // 2. User Question Weight
      if (isUser) score += 15;

      // 3. Technical Content & Code Block Weight (25 points)
      if (/```|function|class|import|export|const|let|var|SELECT|UPDATE/i.test(content)) {
        score += 25;
      }

      // 4. Question & Directive Markers
      if (content.includes('?')) score += 10;
      if (/important|critical|urgent|fix|bug|issue|error|feature|architecture|security/i.test(content)) {
        score += 15;
      }

      // 5. System File Creation Notices
      if (content.includes('✅') || content.includes('Verified Workspace File')) {
        score += 20;
      }

      return { index, score: Math.min(100, score) };
    });
  }

  categorizeMessages(messages = [], scores = []) {
    const keep = [];
    const summarize = [];
    const total = messages.length;

    // Always keep system prompt, first user prompt, and recent 15 messages
    messages.forEach((msg, idx) => {
      const scoreObj = scores[idx] || { score: 50 };
      if (
        idx === 0 || 
        idx >= total - 15 || 
        scoreObj.score >= 70 ||
        msg.role === 'system'
      ) {
        keep.push({ ...msg, originalIndex: idx });
      } else {
        summarize.push({ ...msg, originalIndex: idx });
      }
    });

    return { keep, summarize };
  }

  async generateSummaries(summarizeMessages = [], options = {}) {
    if (summarizeMessages.length === 0) return [];
    const groupSize = 10;
    const summaries = [];

    for (let i = 0; i < summarizeMessages.length; i += groupSize) {
      const group = summarizeMessages.slice(i, i + groupSize);
      const textBlock = group.map(m => `${m.sender || m.role}: ${m.content}`).join('\n');
      
      let summaryText = '';
      try {
        summaryText = await this.callAIForSummary(textBlock, options);
      } catch {
        summaryText = this.extractFallbackKeypoints(textBlock);
      }

      summaries.push({
        content: summaryText,
        count: group.length,
        startIndex: group[0].originalIndex,
        endIndex: group[group.length - 1].originalIndex
      });
    }

    return summaries;
  }

  async callAIForSummary(textBlock = '', options = {}) {
    const prompt = `Summarize the following developer chat context in 3 concise sentences, highlighting key requirements, files created, and decisions:\n\n${textBlock.substring(0, 2000)}\n\nSummary:`;

    const res = await fetch(`${this.config.ollamaHost}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.summaryModel || 'qwen2.5:1.5b',
        prompt,
        stream: false,
        options: { temperature: 0.2, max_tokens: 150 }
      })
    });

    if (!res.ok) throw new Error(`Ollama summary call failed (${res.status})`);
    const data = await res.json();
    return data.response ? data.response.trim() : this.extractFallbackKeypoints(textBlock);
  }

  extractFallbackKeypoints(text = '') {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const keySentences = sentences.filter(s => /file|create|build|fix|architecture|api|workspace/i.test(s));
    return (keySentences.slice(0, 3).join(' ') || text.substring(0, 250)).trim();
  }

  buildCompactedConversation(keepMessages = [], summaries = [], originalConversation = {}) {
    const compactedMessages = [];
    
    // Add summary cards for older messages
    summaries.forEach(s => {
      compactedMessages.push({
        id: `summary-${s.startIndex}-${Date.now()}`,
        sender: 'system',
        role: 'system',
        isSummary: true,
        content: `📋 **Compacted Context Summary (${s.count} messages)**:\n${s.content}`
      });
    });

    // Add kept messages
    keepMessages.forEach(m => {
      compactedMessages.push(m);
    });

    return {
      ...originalConversation,
      messages: compactedMessages,
      compacted: true,
      compactionDate: new Date().toISOString(),
      originalMessageCount: originalConversation.messages ? originalConversation.messages.length : 0
    };
  }

  createFallbackCompaction(conversation = {}) {
    const messages = conversation.messages || [];
    if (messages.length <= 30) return conversation;

    const kept = [messages[0], ...messages.slice(-25)];
    return {
      ...conversation,
      messages: [
        {
          id: `summary-fallback-${Date.now()}`,
          sender: 'system',
          role: 'system',
          isSummary: true,
          content: `📋 **Conversation Truncated**: Compacted ${messages.length - 25} older messages.`
        },
        ...kept
      ],
      compacted: true
    };
  }

  updateStats(originalCount, newCount, durationMs) {
    this.stats.totalCompactions++;
    const diff = Math.max(0, originalCount - newCount);
    this.stats.messagesCompacted += diff;
    this.stats.memorySavedBytes += diff * 1024;
    this.stats.avgCompactionTimeMs = Math.round(
      (this.stats.avgCompactionTimeMs * (this.stats.totalCompactions - 1) + durationMs) / this.stats.totalCompactions
    );
    this.stats.lastCompactionTime = new Date().toISOString();
  }

  processQueue() {
    if (this.compactionQueue.length > 0 && !this.isCompacting) {
      const next = this.compactionQueue.shift();
      this.compactConversation(next.conversation, next.options);
    }
  }

  getStats() {
    return {
      ...this.stats,
      queueLength: this.compactionQueue.length,
      isCompacting: this.isCompacting
    };
  }
}

export const compactionEngine = new ConversationCompactionEngine();
