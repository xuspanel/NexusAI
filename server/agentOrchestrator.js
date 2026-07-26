/**
 * AGENT BEHAVIOR ORCHESTRATOR ENGINE
 * Location: server/agentOrchestrator.js
 * Platform: NexusAI v8.5.0 Enterprise Agentic Platform
 */

import fs from 'fs/promises';
import path from 'path';
import { SystemPromptInjector } from './systemPromptFactory.js';
import { ResponseFilterService, FileOperationParser } from './responseFilterService.js';
import { permissionService } from './permissionService.js';
import { VFSBridge } from './vfsBridge.js';
import { dbAddMessage } from './db.js';

import { RobustWorkspaceFileWriter } from './robustWorkspaceWriter.js';

export class AgentBehaviorOrchestrator {
  constructor(config = {}) {
    this.config = config;
    this.injector = new SystemPromptInjector(config);
    this.filterService = new ResponseFilterService(config);
    this.parser = new FileOperationParser(config);
    this.writer = new RobustWorkspaceFileWriter(config.workspace || process.cwd(), config);
  }

  async processAndStream({
    messages = [],
    model = 'qwen2.5:1.5b',
    systemPrompt,
    conversationId,
    workspace,
    mode = 'BUILD',
    chatConfig = {},
    options = {},
    ollamaHost = 'http://localhost:11434',
    req,
    res
  }) {
    const activeWs = workspace || process.cwd();
    permissionService.setActiveWorkspace(activeWs);
    this.writer.setWorkspace(activeWs);

    const effectiveMode = chatConfig.effectiveDisplayMode || chatConfig.codeDisplayMode || chatConfig.displayMode || 'workspace';

    // 1. Build & Inject Context-Aware System Prompt
    const workspaceContext = {
      path: activeWs,
      projectType: 'Full-Stack Enterprise Web Application'
    };

    const injectedSystemPrompt = this.injector.injectPrompt(mode, workspaceContext, {
      ...chatConfig,
      effectiveDisplayMode: effectiveMode
    });

    const combinedSystemPrompt = systemPrompt 
      ? `${systemPrompt}\n\n${injectedSystemPrompt}` 
      : injectedSystemPrompt;

    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // Save User message in DB
    if (conversationId && lastUserMessage) {
      dbAddMessage({
        id: 'user-msg-' + Date.now(),
        conversationId,
        sender: 'user',
        content: lastUserMessage
      }).catch(() => {});
    }

    let fullAiResponse = '';
    const abortController = new AbortController();

    res.on('close', () => {
      if (!res.writableEnded) {
        abortController.abort();
      }
    });

    try {
      const formattedMessages = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      formattedMessages.unshift({ role: 'system', content: combinedSystemPrompt });

      const ollamaResponse = await fetch(`${ollamaHost}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          model: model || 'qwen2.5:1.5b',
          messages: formattedMessages,
          stream: true,
          options: {
            temperature: options.temperature || 0.3,
            num_predict: options.maxTokens || 4096
          }
        })
      });

      if (!ollamaResponse.ok || !ollamaResponse.body) {
        throw new Error(`Ollama API returned status ${ollamaResponse.status}`);
      }

      const reader = ollamaResponse.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const parsed = JSON.parse(trimmed);
            const token = parsed.message?.content;
            if (token !== undefined) {
              fullAiResponse += token;
              res.write(`data: ${JSON.stringify({ token })}\n\n`);
              if (res.flush) res.flush();
            }

            if (parsed.done) {
              // 2. Perform Verified File Extraction & Physical Disk Generation
              const filesCreated = await this.executeWorkspaceFileGeneration(
                fullAiResponse, 
                activeWs, 
                lastUserMessage, 
                chatConfig
              );

              if (filesCreated.length > 0) {
                const successfulFiles = filesCreated.filter(f => f.success);
                const failedFiles = filesCreated.filter(f => !f.success);

                let notice = '';

                if (successfulFiles.length > 0) {
                  const f = successfulFiles[0];
                  notice += `\n\n✅ **Verified Workspace File**: \`${f.filename}\` (${f.lines} lines, ${f.bytes} bytes)${f.backupCreated ? ' [Backup Saved]' : ''}`;
                }

                if (failedFiles.length > 0) {
                  const f = failedFiles[0];
                  notice += `\n\n❌ **File Write Failure**: \`${f.filename}\` (${f.error})`;
                }

                if (notice) {
                  fullAiResponse += notice;
                  res.write(`data: ${JSON.stringify({ token: notice })}\n\n`);
                }
              }

              // Save AI message to PostgreSQL/Fallback DB
              if (conversationId && fullAiResponse) {
                dbAddMessage({
                  id: 'ai-msg-' + Date.now(),
                  conversationId,
                  sender: 'ai',
                  content: fullAiResponse,
                  model
                }).catch(() => {});
              }

              res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
              if (res.flush) res.flush();
              return res.end();
            }
          } catch {
            // ignore partial json
          }
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err) {
      if (err.name === 'AbortError') return res.end();
      console.warn('⚠️ [Agent Orchestrator Stream Warning]:', err.message);
      res.write(`data: ${JSON.stringify({ token: `\n\n⚠️ Stream Error: ${err.message}` })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }
  }

  async executeWorkspaceFileGeneration(responseText, targetWorkspace, userPrompt = '', config = {}) {
    const activeTargetWs = targetWorkspace || process.cwd();
    if (!activeTargetWs) return [];

    permissionService.setActiveWorkspace(activeTargetWs);
    this.writer.setWorkspace(activeTargetWs);

    const results = [];
    const parsedOps = this.parser.parseResponse(responseText || '', activeTargetWs);

    // 1. Direct User Intent Extraction for Folder/Directory Creation
    if (userPrompt) {
      const intentMatch = userPrompt.match(/(?:create|make|add|build)\s+(?:a\s+)?(?:folder|directory)\s+(?:named|called|title)?\s*[`'"]?([a-zA-Z0-9_\-\/]+)[`'"]?/i);
      if (intentMatch) {
        const requestedFolder = intentMatch[1].trim();
        if (requestedFolder && !['at', 'in', 'the', 'a', 'to'].includes(requestedFolder.toLowerCase())) {
          const dirRes = await this.writer.createDirectory(requestedFolder);
          dirRes.filename = requestedFolder;
          results.push(dirRes);
        }
      }
    }

    // 2. Parsed Operations Execution
    for (const op of parsedOps) {
      if (op.type === 'mkdir') {
        const dirRes = await this.writer.createDirectory(op.filename || op.path);
        dirRes.filename = op.filename || op.path;
        results.push(dirRes);
      } else {
        const res = await this.writer.writeFile(op.filename || op.path, op.content, {
          backupBeforeOverwrite: config.createBackups !== false,
          verifyContent: true
        });
        results.push(res);
      }
    }

    return results;
  }
}

export const agentOrchestrator = new AgentBehaviorOrchestrator();
