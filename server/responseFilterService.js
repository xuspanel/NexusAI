/**
 * RESPONSE FILTERING SERVICE & FILE OPERATION PARSER
 * Location: server/responseFilterService.js
 * Platform: NexusAI v8.5.0 Enterprise Agentic Platform
 */

import path from 'path';

export class FileOperationParser {
  constructor(config = {}) {
    this.config = config;
  }

  parseResponse(responseText, targetWorkspace = process.cwd()) {
    if (!responseText) return [];

    const operations = [];
    const codeBlockRegex = /```([^\n]+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(responseText)) !== null) {
      const headerLine = (match[1] || '').trim();
      const codeContent = match[2] || '';

      // Check if header is a directory creation directive (mkdir:dir_name or dir:dir_name or directory:dir_name)
      const mkdirHeaderMatch = headerLine.match(/^(?:mkdir|dir|directory):(.*)$/i);
      if (mkdirHeaderMatch) {
        const dirName = mkdirHeaderMatch[1].trim() || codeContent.trim();
        if (dirName) {
          const fullPath = path.resolve(targetWorkspace, dirName);
          const relativePath = path.relative(targetWorkspace, fullPath);
          operations.push({
            type: 'mkdir',
            filename: relativePath || dirName,
            path: fullPath,
            lines: 0,
            bytes: 0,
            content: ''
          });
          continue;
        }
      }

      let filename = '';

      // 1. Header tagged filename (e.g. jsx:src/components/Header.jsx or html:index.html)
      if (headerLine) {
        const headerFileMatch = headerLine.match(/([\w\.\-\/]+\.(?:html|js|jsx|ts|tsx|py|css|json|md|sql|sh|yml|yaml))/i);
        if (headerFileMatch) {
          filename = headerFileMatch[1];
        }
      }

      // 2. First line comment extraction
      if (!filename) {
        const firstLine = codeContent.trim().split('\n')[0] || '';
        const commentMatch = firstLine.match(/(?:<!--|\/\/|#|\/\*)\s*([\w\.\-\/]+\.(?:html|js|jsx|ts|tsx|py|css|json|md|sql|sh|yml|yaml))\s*(?:-->|\*\/)?/i);
        if (commentMatch) {
          filename = commentMatch[1];
        }
      }

      if (filename) {
        const fullPath = path.resolve(targetWorkspace, filename);
        const relativePath = path.relative(targetWorkspace, fullPath);

        const lines = codeContent.trim() ? codeContent.trim().split('\n').length : 0;
        const bytes = Buffer.byteLength(codeContent, 'utf-8');

        operations.push({
          type: 'create', // default to create/write
          filename: relativePath || filename,
          path: fullPath,
          lines,
          bytes,
          content: codeContent
        });
      }
    }

    // Also parse explicit text directory commands (e.g., `mkdir -p dir_name` or `created folder 'dir_name'`)
    const textDirRegex = /(?:mkdir\s+(?:-p\s+)?|created?\s+(?:the\s+)?(?:folder|directory)\s+[`'"]?)([a-zA-Z0-9_\-\/]+)[`'"]?/gi;
    let textMatch;
    while ((textMatch = textDirRegex.exec(responseText)) !== null) {
      const folderName = textMatch[1].trim();
      if (folderName && !['at', 'in', 'the', 'a'].includes(folderName.toLowerCase())) {
        const fullPath = path.resolve(targetWorkspace, folderName);
        const relativePath = path.relative(targetWorkspace, fullPath);
        if (!operations.some(op => op.path === fullPath)) {
          operations.push({
            type: 'mkdir',
            filename: relativePath || folderName,
            path: fullPath,
            lines: 0,
            bytes: 0,
            content: ''
          });
        }
      }
    }

    return operations;
  }

  getOperationSummary(operations = []) {
    const totalFiles = operations.length;
    const totalLines = operations.reduce((sum, op) => sum + (op.lines || 0), 0);
    const totalBytes = operations.reduce((sum, op) => sum + (op.bytes || 0), 0);

    return {
      totalFiles,
      totalLines,
      totalBytes,
      files: operations.map(op => ({
        filename: op.filename,
        lines: op.lines,
        bytes: op.bytes
      }))
    };
  }
}

export class ResponseFilterService {
  constructor(config = {}) {
    this.config = config;
    this.parser = new FileOperationParser(config);
  }

  filterResponse(response, chatConfig = {}) {
    const mode = chatConfig.effectiveDisplayMode || chatConfig.codeDisplayMode || chatConfig.displayMode || 'workspace';

    if (mode === 'chat') {
      return this.enhanceForChat(response);
    }

    if (mode === 'workspace') {
      return this.filterForWorkspace(response);
    }

    // Hybrid mode
    return response;
  }

  filterForWorkspace(response) {
    const operations = this.parser.parseResponse(response);
    if (operations.length === 0) return response;

    const summary = this.parser.getOperationSummary(operations);

    let filteredText = `📦 **Workspace Generation Summary**\n`;
    filteredText += `Successfully processed **${summary.totalFiles} files** (${summary.totalLines} total lines written to disk):\n\n`;

    operations.forEach(op => {
      filteredText += `📁 **${op.filename}** (${op.lines} lines, ${(op.bytes / 1024).toFixed(1)} KB)\n`;
    });

    return filteredText;
  }

  enhanceForChat(response) {
    return response.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const lines = code.trim().split('\n').length;
      return `${match}\n📊 *(${lines} lines)*`;
    });
  }
}
