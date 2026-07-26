/**
 * INTELLIGENT AUTOMATED DOCUMENTATION ENGINE
 * Location: server/documentationEngine.js
 * Platform: NexusAI v8.5.0 Enterprise Agentic Platform
 */

import { CodeIntelligenceEngine } from './codeIntelligenceEngine.js';

export class IntelligentDocumentationEngine {
  constructor(config = {}) {
    this.config = config;
    this.codeIntel = new CodeIntelligenceEngine(config);
  }

  async generateDocumentation(projectContext = {}) {
    const overview = this.generateOverview(projectContext);
    const architecture = this.generateArchitectureDocs(projectContext);
    const apiDocs = this.generateAPIDocs(projectContext);
    const markdownSpec = this.formatMarkdownSpec(overview, architecture, apiDocs);

    return {
      overview,
      architecture,
      apiDocs,
      markdownSpec
    };
  }

  generateOverview(projectContext = {}) {
    return {
      title: 'NexusAI System Architecture & Component Specification',
      version: 'v8.5.0-PROD',
      totalFiles: projectContext.totalFiles || 0,
      targetWorkspace: projectContext.workspacePath || process.cwd()
    };
  }

  generateArchitectureDocs(projectContext = {}) {
    return {
      diagram: `\`\`\`mermaid
graph TD
    Client[React SPA Frontend] -->|HTTP / SSE| ExpressServer[Express SSE API Server :3005]
    ExpressServer --> VFSBridge[Virtual File System Bridge]
    ExpressServer --> DB[PostgreSQL 18.4 + Fallback Engine]
    ExpressServer --> Ollama[Local Ollama LLM :11434]
    VFSBridge --> Disk[Physical Workspace Disk]
\`\`\``,
      layers: ['Presentation (React)', 'Application (Express SSE)', 'Persistence (PostgreSQL)', 'AI Engine (Ollama)']
    };
  }

  generateAPIDocs(projectContext = {}) {
    return [
      { method: 'GET', endpoint: '/api/workspace/info', description: 'Returns active workspace directory & metadata.' },
      { method: 'GET', endpoint: '/api/system/metrics', description: 'Returns real-time CPU, RAM, and Ollama status.' },
      { method: 'POST', endpoint: '/api/chat/stream', description: 'High-speed SSE stream endpoint with automated VFS disk generation.' },
      { method: 'POST', endpoint: '/api/vfs/file/write', description: 'Writes physical files safely to active workspace disk.' }
    ];
  }

  formatMarkdownSpec(overview, architecture, apiDocs = []) {
    let md = `# 📘 ${overview.title}\n\n`;
    md += `> **Version**: ${overview.version} | **Workspace**: \`${overview.targetWorkspace}\`\n\n`;

    md += `## 1. System Architecture Diagram\n\n${architecture.diagram}\n\n`;

    md += `## 2. API Specifications\n\n`;
    apiDocs.forEach(api => {
      md += `- \`${api.method} ${api.endpoint}\`: ${api.description}\n`;
    });

    return md;
  }
}
