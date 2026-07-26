/**
 * ULTIMATE AGENT ORCHESTRATOR & DEEP INTELLIGENCE ENGINE
 * Location: server/ultimateAgentOrchestrator.js
 * Platform: NexusAI v8.5.0 Enterprise Agentic Platform
 */

import { ArchitectureAnalyzer } from './architectureAnalyzer.js';
import { CodeIntelligenceEngine } from './codeIntelligenceEngine.js';
import { IntelligentCodeReviewEngine } from './codeReviewEngine.js';
import { IntelligentRefactoringEngine } from './refactoringEngine.js';
import { IntelligentTestEngine } from './testEngine.js';
import { IntelligentDocumentationEngine } from './documentationEngine.js';
import { ProjectHealthEngine } from './projectHealthEngine.js';
import { agentOrchestrator } from './agentOrchestrator.js';

export const ULTIMATE_SYSTEM_PROMPT = `
You are NexusAI ULTIMATE - Senior Principal Software Engineer & System Architect (30+ years experience).

## YOUR IDENTITY & CAPABILITIES
1. **Deep Architecture Reasoning**: You master MVC, Hexagonal, DDD, Event-Driven, Microservices, and Serverless architectures. You identify anti-patterns, circular dependencies, and high-level design smells immediately.
2. **Code Intelligence & Refactoring**: You calculate cyclomatic & cognitive complexity, extract clean abstractions, enforce DRY/SOLID principles, and eliminate code debt.
3. **Security & OWASP Hardening**: You detect SQL injection, XSS, hardcoded secrets, eval execution, and unvalidated inputs instantly.
4. **Automated Testing & Coverage**: You generate robust Vitest/Jest/Pytest suites covering happy paths, null edge cases, and error conditions (>80% coverage target).
5. **Clear Professional Communication**: Use visual status indicators (📁 📝 ✅ ❌ ⚠️ 🛡️ 📦 📊) and provide structured, production-ready deliverables.
`;

export class UltimateAgentOrchestrator {
  constructor(config = {}) {
    this.config = config;
    this.archAnalyzer = new ArchitectureAnalyzer(config);
    this.codeIntel = new CodeIntelligenceEngine(config);
    this.codeReview = new IntelligentCodeReviewEngine(config);
    this.refactoring = new IntelligentRefactoringEngine(config);
    this.testEngine = new IntelligentTestEngine(config);
    this.docEngine = new IntelligentDocumentationEngine(config);
    this.healthEngine = new ProjectHealthEngine(config);
  }

  classifyRequest(content = '') {
    const text = content.toLowerCase();
    if (/architect|system design|component breakdown|tier|layer/i.test(text)) return 'architecture_analysis';
    if (/review|audit|inspect|security scan|owasp/i.test(text)) return 'code_review';
    if (/refactor|extract|simplify|cognitive complexity/i.test(text)) return 'refactoring';
    if (/test|unit test|integration test|vitest|jest|pytest/i.test(text)) return 'test_generation';
    if (/document|api docs|mermaid|markdown spec|readme/i.test(text)) return 'documentation';
    if (/health|metrics|score|project health|status/i.test(text)) return 'project_health';
    return 'general';
  }

  async processAndStream(params) {
    const lastUserMessage = params.messages[params.messages.length - 1]?.content || '';
    const intent = this.classifyRequest(lastUserMessage);
    const workspacePath = params.workspace || process.cwd();

    let intelligenceContext = '';

    try {
      if (intent === 'architecture_analysis') {
        const arch = await this.archAnalyzer.analyzeProject(workspacePath);
        intelligenceContext = `\n\n## DEEP ARCHITECTURE ANALYSIS CONTEXT\nTier: ${arch.architecture.tier.toUpperCase()} | Health Score: ${arch.healthScore}/100\nLayers: ${JSON.stringify(arch.architecture.layers)}\nRecommendations: ${arch.recommendations.map(r => r.title).join('; ')}`;
      } else if (intent === 'project_health') {
        const health = await this.healthEngine.assessProjectHealth(workspacePath);
        intelligenceContext = `\n\n## PROJECT HEALTH CONTEXT\nScore: ${health.score}/100 (${health.status.toUpperCase()})\nMetrics: ${JSON.stringify(health.metrics)}`;
      }
    } catch (err) {
      console.warn('⚠️ [Ultimate Intelligence Warning]:', err.message);
    }

    const enhancedSystemPrompt = `${ULTIMATE_SYSTEM_PROMPT}\n${intelligenceContext}`;
    const combinedSystemPrompt = params.systemPrompt 
      ? `${params.systemPrompt}\n\n${enhancedSystemPrompt}`
      : enhancedSystemPrompt;

    return await agentOrchestrator.processAndStream({
      ...params,
      systemPrompt: combinedSystemPrompt
    });
  }
}

export const ultimateAgentOrchestrator = new UltimateAgentOrchestrator();
