/**
 * INTELLIGENT CODE REVIEW & QUALITY AUDITING ENGINE
 * Location: server/codeReviewEngine.js
 * Platform: NexusAI v8.5.0 Enterprise Agentic Platform
 */

import fs from 'fs/promises';
import path from 'path';

export class IntelligentCodeReviewEngine {
  constructor(config = {}) {
    this.config = config;
  }

  async reviewCode(code = '', filePath = 'code_review.js') {
    const issues = [];
    const suggestions = [];
    let score = 100;

    // Check 1: Code Quality & Smells
    const qualityRes = this.checkCodeQuality(code);
    issues.push(...qualityRes.issues);
    suggestions.push(...qualityRes.suggestions);

    // Check 2: Anti-Patterns
    const antiPatternRes = this.checkAntiPatterns(code);
    issues.push(...antiPatternRes.issues);

    // Check 3: Security & OWASP Vulnerabilities
    const securityRes = this.checkSecurity(code);
    issues.push(...securityRes.issues);

    // Check 4: Performance Bottlenecks
    const perfRes = this.checkPerformance(code);
    issues.push(...perfRes.issues);

    // Score Calculation
    issues.forEach(issue => {
      if (issue.severity === 'critical') score -= 15;
      else if (issue.severity === 'high') score -= 10;
      else if (issue.severity === 'medium') score -= 5;
      else score -= 2;
    });

    score = Math.max(0, score);

    let overall = 'pass';
    if (score >= 85) overall = 'excellent';
    else if (score >= 70) overall = 'good';
    else if (score >= 50) overall = 'needs_improvement';
    else overall = 'critical_issues';

    return {
      filePath,
      timestamp: new Date().toISOString(),
      score,
      overall,
      issues,
      suggestions,
      recommendations: this.generateRecommendations(issues)
    };
  }

  async reviewFile(fullPath) {
    try {
      const code = await fs.readFile(fullPath, 'utf-8');
      return await this.reviewCode(code, path.basename(fullPath));
    } catch (err) {
      return { filePath: fullPath, score: 0, overall: 'error', issues: [{ severity: 'critical', message: err.message }] };
    }
  }

  checkCodeQuality(code = '') {
    const issues = [];
    const suggestions = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Deep nesting check (> 4 levels of indentation)
      const indentLevel = line.search(/\S/) / 2;
      if (indentLevel > 4) {
        issues.push({
          severity: 'medium',
          line: lineNum,
          type: 'deep_nesting',
          message: `Deep nesting detected (level ${Math.round(indentLevel)}). Consider refactoring using guard clauses.`
        });
      }

      // Commented out code detection
      if (/^\/\/\s*(const|let|var|function|if|for|import)\s+/.test(trimmed)) {
        issues.push({
          severity: 'low',
          line: lineNum,
          type: 'commented_code',
          message: 'Commented-out code block detected. Remove clutter before production.'
        });
      }

      // Magic numbers check
      if (/(?<!\w)(?:[1-9]\d{2,}|86400|3600)(?!\w)/.test(trimmed) && !/const\s+[A-Z_]+/.test(trimmed)) {
        suggestions.push({
          severity: 'low',
          line: lineNum,
          type: 'magic_number',
          message: 'Magic numeric literal detected. Extract into a named constant explaining its purpose.'
        });
      }
    });

    if (lines.length > 300) {
      issues.push({
        severity: 'high',
        line: 1,
        type: 'large_file',
        message: `File contains ${lines.length} lines. Consider breaking down into modular components.`
      });
    }

    return { issues, suggestions };
  }

  checkAntiPatterns(code = '') {
    const issues = [];
    const lines = code.split('\n');

    if (/class\s+\w+[\s\S]*?function[\s\S]*?function[\s\S]*?function[\s\S]*?function[\s\S]*?function/.test(code) && lines.length > 500) {
      issues.push({
        severity: 'high',
        line: 1,
        type: 'god_object',
        message: 'God Object anti-pattern detected. Class handles too many disparate responsibilities.'
      });
    }

    if (/\/\/\s*(TODO|FIXME|HACK|BUG|XXX)/i.test(code)) {
      issues.push({
        severity: 'low',
        line: 1,
        type: 'lava_flow',
        message: 'Unresolved TODO/FIXME markers present in code.'
      });
    }

    return { issues };
  }

  checkSecurity(code = '') {
    const issues = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Hardcoded Secret Keys Detection
      if (/(?:api[_-]?key|secret|password|bearer|token)\s*=\s*['"`][A-Za-z0-9_\-]{16,}['"`]/i.test(line)) {
        issues.push({
          severity: 'critical',
          line: lineNum,
          type: 'hardcoded_secret',
          message: 'Hardcoded secret key or token detected! Move credentials to environment variables.',
          cwe: 'CWE-798'
        });
      }

      // SQL Injection Risk
      if (/(?:query|exec|execute)\s*\(\s*['"`].*\$\{.*\}.*['"`]\s*\)/i.test(line)) {
        issues.push({
          severity: 'critical',
          line: lineNum,
          type: 'sql_injection',
          message: 'Potential SQL Injection! Use parameterized queries instead of string template interpolation.',
          cwe: 'CWE-89'
        });
      }

      // Dangerous eval() or Function() constructor
      if (/\beval\s*\(|new\s+Function\s*\(/i.test(line)) {
        issues.push({
          severity: 'critical',
          line: lineNum,
          type: 'eval_usage',
          message: 'Dangerous eval() or Function() execution detected.',
          cwe: 'CWE-95'
        });
      }

      // XSS Risk
      if (/innerHTML\s*=/.test(line)) {
        issues.push({
          severity: 'high',
          line: lineNum,
          type: 'xss',
          message: 'Unsanitized innerHTML assignment detected. Use textContent or DOM sanitization.',
          cwe: 'CWE-79'
        });
      }
    });

    return { issues };
  }

  checkPerformance(code = '') {
    const issues = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Synchronous file I/O operations in main loop
      if (/fs\.(readFileSync|writeFileSync|existsSync)\s*\(/.test(line)) {
        issues.push({
          severity: 'medium',
          line: lineNum,
          type: 'blocking_io',
          message: 'Synchronous blocking file I/O call detected. Prefer asynchronous fs/promises.'
        });
      }

      // Unhandled setInterval
      if (/setInterval\s*\(/.test(line) && !/clearInterval/.test(code)) {
        issues.push({
          severity: 'medium',
          line: lineNum,
          type: 'memory_leak',
          message: 'setInterval detected without corresponding clearInterval cleanup.'
        });
      }
    });

    return { issues };
  }

  generateRecommendations(issues = []) {
    const critical = issues.filter(i => i.severity === 'critical');
    const high = issues.filter(i => i.severity === 'high');

    const recs = [];
    if (critical.length > 0) {
      recs.push({
        priority: 'critical',
        title: 'Fix Security & Stability Blockers',
        description: `Found ${critical.length} critical issues (e.g. hardcoded secrets, SQL injection risks).`
      });
    }
    if (high.length > 0) {
      recs.push({
        priority: 'high',
        title: 'Resolve Refactoring & Performance Issues',
        description: `Found ${high.length} high priority issues.`
      });
    }
    return recs;
  }
}
