/**
 * NEXUS AI - 6-MODE AGENTIC ORCHESTRATION ENGINE CONFIGURATION
 */

export const AGENT_MODES = {
  PLAN: {
    id: 'plan',
    name: 'PLAN Mode',
    shortLabel: 'PLAN',
    icon: 'ClipboardList',
    shortcut: 'Ctrl+1',
    color: '#3b82f6', // Blue
    badgeColor: 'badge-purple',
    tagline: 'Strategic Planning & Architecture Design',
    description: 'High-level architectural planning, requirements analysis, component diagrams, and project scoping.',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9,
    systemPrompt: 'You are a Principal Software Architect & Strategic AI Planner. When the user asks to create files or folders (e.g. .md files, specifications, architecture docs), generate the full file contents in code blocks with the exact filename header (e.g. ```markdown:filename.md) and confirm file creation inside the active workspace. Never tell the user to manually create the file themselves.',
    capabilities: [
      'Requirements Analysis & User Stories',
      'System Architecture & Mermaid Diagrams',
      'Technology Stack & DB Schema Design',
      'Sprint Planning & Effort Estimation'
    ]
  },

  BUILD: {
    id: 'build',
    name: 'BUILD Mode',
    shortLabel: 'BUILD',
    icon: 'Zap',
    shortcut: 'Ctrl+2',
    color: '#10b981', // Emerald Green
    badgeColor: 'badge-emerald',
    tagline: 'Execution, Code Generation & Implementation',
    description: 'Active development, code generation, refactoring, bug fixes, and hands-on execution.',
    temperature: 0.3,
    maxTokens: 4096,
    topP: 0.95,
    systemPrompt: 'You are an Elite Agentic Software Engineer. When the user asks to create a file or folder (e.g., .md, .js, .jsx, .py, .json), YOU MUST output the full file content inside a code block with the target filename specified (e.g., ```javascript:filename.js or ```markdown:README.md). Always write complete, production-grade files that can be directly saved to disk in the workspace.',
    capabilities: [
      'Full-Stack Code Generation (React, Node, Python)',
      'Refactoring & Bug Fixing',
      'Package & Dependency Management',
      'VFS File Writes & Build Execution'
    ]
  },

  REVIEW: {
    id: 'review',
    name: 'REVIEW Mode',
    shortLabel: 'REVIEW',
    icon: 'Search',
    shortcut: 'Ctrl+3',
    color: '#f59e0b', // Amber/Orange
    badgeColor: 'badge-cyan',
    tagline: 'Code Quality & Security Vulnerability Auditing',
    description: 'Static analysis, security vulnerability scanning, performance profiling, and code review checks.',
    temperature: 0.5,
    maxTokens: 2048,
    topP: 0.85,
    systemPrompt: 'You are a Lead Security Auditor & Code Quality Specialist. Analyze code for security vulnerabilities, AST compliance, memory leaks, performance bottlenecks, and style guide violations. Output complete audit reports and patched code blocks ready for workspace saving.',
    capabilities: [
      'Security Vulnerability Scanning (OWASP)',
      'Performance Bottleneck Identification',
      'Style & AST Linter Compliance',
      'Diff Inspection & Refactoring Advice'
    ]
  },

  TEST: {
    id: 'test',
    name: 'TEST Mode',
    shortLabel: 'TEST',
    icon: 'TestTube',
    shortcut: 'Ctrl+4',
    color: '#8b5cf6', // Purple
    badgeColor: 'badge-purple',
    tagline: 'Automated Testing & QA Verification',
    description: 'Unit test generation, integration testing, coverage reports, and automated test execution.',
    temperature: 0.2,
    maxTokens: 2048,
    topP: 0.8,
    systemPrompt: 'You are a Test Automation & QA Specialist. Generate complete unit test files, assertion suites, and test reports. Output complete test file content in formatted code blocks with filename tags for instant workspace creation.',
    capabilities: [
      'Unit & Integration Test Suite Generation',
      'Coverage Assertions & Load Testing',
      'Regression & Smoke Test Automation',
      'Failure Diagnosis & Auto-Fix Suggestions'
    ]
  },

  DEPLOY: {
    id: 'deploy',
    name: 'DEPLOY Mode',
    shortLabel: 'DEPLOY',
    icon: 'Rocket',
    shortcut: 'Ctrl+5',
    color: '#ef4444', // Red
    badgeColor: 'badge-cyan',
    tagline: 'Production DevOps & Release Management',
    description: 'Deployment scripts, containerization (Docker), Nginx/PM2 configs, and rollback procedures.',
    temperature: 0.1,
    maxTokens: 2048,
    topP: 0.95,
    systemPrompt: 'You are a Principal DevOps Engineer. Output complete configuration files (e.g. Dockerfile, nginx.conf, deploy.sh) in code blocks with exact filenames so they can be saved directly to the workspace.',
    capabilities: [
      'Nginx & PM2 Production Deployment',
      'Docker & Container Orchestration',
      'SSL/TLS Certificate Setup (Certbot)',
      'Zero-Downtime Rollback & Monitoring'
    ]
  },

  LEARN: {
    id: 'learn',
    name: 'LEARN Mode',
    shortLabel: 'LEARN',
    icon: 'Brain',
    shortcut: 'Ctrl+6',
    color: '#06b6d4', // Cyan
    badgeColor: 'badge-cyan',
    tagline: 'Pattern Recognition & Knowledge Enrichment',
    description: 'Interaction analysis, pattern optimization, knowledge base enrichment, and prompt refinement.',
    temperature: 0.8,
    maxTokens: 4096,
    topP: 0.9,
    systemPrompt: 'You are an AI Optimization & Pattern Learning Specialist. Generate complete documentation and optimization files in code blocks with filename tags for saving to the workspace.',
    capabilities: [
      'Interaction Analytics & Pattern Detection',
      'Prompt Optimization & Supercharging',
      'Vector Knowledge Base Enrichment',
      'Continuous Workflow Learning'
    ]
  }
};
