/**
 * DEEP CODE INTELLIGENCE & CONTEXT AWARENESS ENGINE
 * Location: server/codeIntelligenceEngine.js
 * Platform: NexusAI v8.5.0 Enterprise Agentic Platform
 */

import fs from 'fs/promises';
import path from 'path';

export class CodeIntelligenceEngine {
  constructor(config = {}) {
    this.config = config;
  }

  async understandCode(code = '', filePath = 'snippet.js') {
    const lines = code.split('\n');
    const imports = this.extractImports(code);
    const exports = this.extractExports(code);
    const functions = this.extractFunctions(code);
    const classes = this.extractClasses(code);
    const complexity = this.calculateComplexity(code);
    const patterns = this.detectPatterns(code);

    return {
      filePath,
      lineCount: lines.length,
      byteSize: Buffer.byteLength(code, 'utf-8'),
      imports,
      exports,
      functions,
      classes,
      complexity,
      patterns
    };
  }

  async understandProject(workspacePath = process.cwd()) {
    const files = await this.getAllCodeFiles(workspacePath);
    const projectContext = {
      workspacePath,
      totalFiles: files.length,
      files: {},
      relationships: { nodes: [], edges: [] }
    };

    for (const file of files.slice(0, 50)) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const relPath = path.relative(workspacePath, file);
        const codeInfo = await this.understandCode(content, relPath);
        projectContext.files[relPath] = codeInfo;

        projectContext.relationships.nodes.push({
          id: relPath,
          complexity: codeInfo.complexity,
          functionsCount: codeInfo.functions.length
        });

        for (const imp of codeInfo.imports) {
          projectContext.relationships.edges.push({
            source: relPath,
            target: imp.source,
            type: 'import'
          });
        }
      } catch {
        // quiet fallback
      }
    }

    return projectContext;
  }

  extractImports(code = '') {
    const imports = [];
    const importRegex = /import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)?\s*from\s*['"]([^'"]+)['"]/g;
    const requireRegex = /(?:const|let|var)\s+(?:\{[^}]*\}|\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g;
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      imports.push({ source: match[1], raw: match[0] });
    }
    while ((match = requireRegex.exec(code)) !== null) {
      imports.push({ source: match[1], raw: match[0] });
    }

    return imports;
  }

  extractExports(code = '') {
    const exports = [];
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+([a-zA-Z0-9_]+)/g;
    let match;

    while ((match = exportRegex.exec(code)) !== null) {
      exports.push({ name: match[1], raw: match[0] });
    }

    return exports;
  }

  extractFunctions(code = '') {
    const functions = [];
    const funcRegex = /(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)|(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g;
    let match;

    while ((match = funcRegex.exec(code)) !== null) {
      const name = match[1] || match[3] || 'anonymous';
      const params = (match[2] || match[4] || '').split(',').map(s => s.trim()).filter(Boolean);
      functions.push({ name, params, line: this.getLineNumber(code, match.index) });
    }

    return functions;
  }

  extractClasses(code = '') {
    const classes = [];
    const classRegex = /class\s+([a-zA-Z0-9_]+)(?:\s+extends\s+([a-zA-Z0-9_]+))?/g;
    let match;

    while ((match = classRegex.exec(code)) !== null) {
      classes.push({
        name: match[1],
        extends: match[2] || null,
        line: this.getLineNumber(code, match.index)
      });
    }

    return classes;
  }

  calculateComplexity(code = '') {
    let cyclomatic = 1;
    let cognitive = 0;
    let nesting = 0;
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Branching keywords
      if (/\b(if|else\s+if|for|while|case|catch|\?\s*:)\b/.test(line)) {
        cyclomatic++;
        cognitive += 1 + nesting;
      }
      if (/\{/.test(line)) nesting++;
      if (/\}/.test(line)) nesting = Math.max(0, nesting - 1);
    }

    return {
      cyclomatic,
      cognitive,
      maxNesting: nesting,
      rating: cyclomatic > 15 ? 'HIGH' : cyclomatic > 8 ? 'MEDIUM' : 'LOW'
    };
  }

  detectPatterns(code = '') {
    return {
      singleton: /getInstance|static\s+instance/i.test(code),
      factory: /create[A-Z]\w+|Factory/i.test(code),
      observer: /addEventListener|subscribe|notify|emit/i.test(code),
      repository: /Repository|find[A-Z]\w+|save[A-Z]\w+/i.test(code),
      decorator: /@\w+|higherOrderComponent|with[A-Z]\w+/i.test(code)
    };
  }

  getLineNumber(code, index) {
    return code.substring(0, index).split('\n').length;
  }

  async getAllCodeFiles(dirPath, files = []) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (['node_modules', '.git', 'dist', 'coverage'].includes(entry.name)) continue;
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          await this.getAllCodeFiles(fullPath, files);
        } else if (/\.(js|jsx|ts|tsx|py|java|go)$/i.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch {
      // quiet fallback
    }
    return files;
  }
}
