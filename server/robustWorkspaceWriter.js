/**
 * ROBUST VERIFIED WORKSPACE FILE WRITER SERVICE
 * Location: server/robustWorkspaceWriter.js
 * Platform: NexusAI v8.5.0 Enterprise Agentic Platform
 */

import fs from 'fs/promises';
import path from 'path';
import { VFSBridge } from './vfsBridge.js';
import { permissionService } from './permissionService.js';

export class RobustWorkspaceFileWriter {
  constructor(workspacePath = process.cwd(), config = {}) {
    this.workspacePath = path.resolve(workspacePath);
    this.config = config;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 150;
    this.operationHistory = [];
  }

  setWorkspace(workspacePath) {
    if (workspacePath) {
      this.workspacePath = path.resolve(workspacePath);
    }
  }

  resolvePath(targetPath) {
    if (path.isAbsolute(targetPath)) {
      return path.resolve(targetPath);
    }
    return path.resolve(this.workspacePath, targetPath);
  }

  async createDirectory(dirPath) {
    const fullPath = this.resolvePath(dirPath);
    permissionService.setActiveWorkspace(this.workspacePath);

    this.logOperation('create_directory', fullPath, 'attempt');

    try {
      await fs.mkdir(fullPath, { recursive: true });

      // Empirical Verification: Check directory existence
      await fs.access(fullPath);
      const stat = await fs.stat(fullPath);

      if (!stat.isDirectory()) {
        throw new Error(`Path exists but is not a directory: ${fullPath}`);
      }

      this.logOperation('create_directory', fullPath, 'success');
      return {
        success: true,
        path: fullPath,
        relativePath: path.relative(this.workspacePath, fullPath),
        message: `✅ Directory created & verified: ${fullPath}`
      };
    } catch (err) {
      this.logOperation('create_directory', fullPath, 'failed', err);
      return {
        success: false,
        path: fullPath,
        error: err.message,
        message: `❌ Failed to create directory: ${err.message}`
      };
    }
  }

  async writeFile(targetPath, content = '', options = {}) {
    const fullPath = this.resolvePath(targetPath);
    const relativePath = path.relative(this.workspacePath, fullPath);
    permissionService.setActiveWorkspace(this.workspacePath);

    // Path Traversal Security Verification
    if (!fullPath.startsWith(this.workspacePath)) {
      const err = new Error(`Security Violation: Path traversal outside workspace (${fullPath})`);
      this.logOperation('write_file', fullPath, 'failed', err);
      return {
        success: false,
        path: fullPath,
        relativePath,
        error: err.message,
        message: `❌ Path Traversal Prevented: ${relativePath}`
      };
    }

    const backupPath = `${fullPath}.backup-${Date.now()}`;
    let retries = 0;

    this.logOperation('write_file', fullPath, 'attempt');

    while (retries < this.maxRetries) {
      try {
        // 1. Ensure Parent Directory
        const parentDir = path.dirname(fullPath);
        await fs.mkdir(parentDir, { recursive: true });

        // 2. Backup existing file if requested
        let backupCreated = false;
        try {
          await fs.access(fullPath);
          if (options.backupBeforeOverwrite !== false) {
            await fs.copyFile(fullPath, backupPath);
            backupCreated = true;
          }
        } catch {
          // file does not exist yet
        }

        // 3. Write File via VFS Bridge
        await VFSBridge.writeFile(fullPath, content);

        // 4. VERIFICATION 1: File Existence
        await fs.access(fullPath);

        // 5. VERIFICATION 2: Stat & Size Check
        const stat = await fs.stat(fullPath);
        const expectedBytes = Buffer.byteLength(content, 'utf-8');

        if (expectedBytes > 0 && stat.size === 0) {
          throw new Error(`Verification Failure: File size is 0 bytes for non-empty content`);
        }

        // 6. VERIFICATION 3: Strict Readback Content Matching
        if (options.verifyContent !== false && content.length > 0) {
          const writtenContent = await fs.readFile(fullPath, 'utf-8');
          if (writtenContent !== content) {
            throw new Error(`Verification Failure: Readback content does not match expected output`);
          }
        }

        const lineCount = content ? content.split('\n').length : 0;
        const result = {
          success: true,
          path: fullPath,
          relativePath,
          filename: path.basename(fullPath),
          lines: lineCount,
          bytes: stat.size,
          backupCreated,
          backupPath: backupCreated ? backupPath : null,
          message: `✅ Verified file written to workspace: ${relativePath} (${lineCount} lines, ${stat.size} bytes)`
        };

        this.logOperation('write_file', fullPath, 'success', null, result);
        return result;

      } catch (err) {
        retries++;
        console.warn(`⚠️ [RobustWriter Retry ${retries}/${this.maxRetries}] ${fullPath}:`, err.message);

        // Attempt rollback from backup if write failed
        try {
          await fs.access(backupPath);
          await fs.copyFile(backupPath, fullPath);
          console.log(`🛡️ [Rollback Restored] ${fullPath} from backup`);
        } catch {
          // no backup to restore
        }

        if (retries >= this.maxRetries) {
          this.logOperation('write_file', fullPath, 'failed', err);
          return {
            success: false,
            path: fullPath,
            relativePath,
            error: err.message,
            message: `❌ File Write & Verification Failed after ${retries} attempts: ${err.message}`
          };
        }

        await new Promise(res => setTimeout(res, this.retryDelay * retries));
      }
    }
  }

  async verifyFile(targetPath) {
    const fullPath = this.resolvePath(targetPath);
    try {
      await fs.access(fullPath);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        return { exists: true, isDirectory: true, message: `📁 Directory verified: ${targetPath}` };
      }
      const content = await fs.readFile(fullPath, 'utf-8');
      return {
        exists: true,
        isDirectory: false,
        size: stat.size,
        lines: content.split('\n').length,
        modified: stat.mtime,
        content,
        message: `✅ File verified: ${targetPath} (${stat.size} bytes)`
      };
    } catch (err) {
      return {
        exists: false,
        error: err.message,
        message: `❌ Verification failed for ${targetPath}: ${err.message}`
      };
    }
  }

  logOperation(type, pathStr, status, error = null, metadata = {}) {
    const entry = {
      timestamp: Date.now(),
      type,
      path: pathStr,
      status,
      error: error ? error.message : null,
      metadata
    };
    this.operationHistory.push(entry);
    if (this.operationHistory.length > 500) {
      this.operationHistory = this.operationHistory.slice(-500);
    }
  }

  getRecentOperations(limit = 10) {
    return this.operationHistory.slice(-limit).reverse();
  }
}

export const robustWriter = new RobustWorkspaceFileWriter();
