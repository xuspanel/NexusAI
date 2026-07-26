/**
 * WORKSPACE OPERATION DIAGNOSTIC SERVICE
 * Location: server/workspaceDiagnostic.js
 * Platform: NexusAI v8.5.0 Enterprise Agentic Platform
 */

import fs from 'fs/promises';
import path from 'path';

export class WorkspaceOperationDiagnostic {
  constructor(config = {}) {
    this.config = config;
    this.operationHistory = [];
  }

  async diagnose(workspacePath = process.cwd()) {
    const targetWs = path.resolve(workspacePath);
    
    const results = {
      timestamp: new Date().toISOString(),
      workspacePath: targetWs,
      workspaceExists: false,
      workspaceWritable: false,
      workspaceReadable: false,
      permissionIssues: [],
      integrationIssues: [],
      recommendations: [],
      severity: 'low',
      autoFixApplied: []
    };

    // 1. Check workspace existence
    try {
      await fs.access(targetWs);
      results.workspaceExists = true;
    } catch (e) {
      results.workspaceExists = false;
      results.permissionIssues.push({
        issue: 'Workspace directory does not exist or is inaccessible',
        details: e.message,
        severity: 'critical'
      });
      results.recommendations.push({
        issue: 'Workspace missing',
        recommendation: `Create workspace directory: mkdir -p ${targetWs}`,
        severity: 'critical'
      });
    }

    // 2. Check Read & Write Permissions
    if (results.workspaceExists) {
      // Check Read
      try {
        await fs.readdir(targetWs);
        results.workspaceReadable = true;
      } catch (e) {
        results.workspaceReadable = false;
        results.permissionIssues.push({
          issue: 'Cannot read workspace directory',
          details: e.message,
          severity: 'critical'
        });
      }

      // Check Write
      const testFile = path.join(targetWs, `.nexusai-write-test-${Date.now()}.tmp`);
      try {
        await fs.writeFile(testFile, 'NEXUSAI_DIAGNOSTIC_TEST');
        await fs.unlink(testFile);
        results.workspaceWritable = true;
      } catch (e) {
        results.workspaceWritable = false;
        results.permissionIssues.push({
          issue: 'Cannot write to workspace directory',
          details: e.message,
          severity: 'critical'
        });
        results.recommendations.push({
          issue: 'Write permission denied',
          recommendation: `Fix write permissions: chmod -R 755 ${targetWs}`,
          severity: 'critical'
        });
      }
    }

    // 3. Attempt Auto-Fix if issues found
    if (!results.workspaceExists || !results.workspaceWritable) {
      const fixes = await this.attemptAutoFix(targetWs, results);
      results.autoFixApplied = fixes;
    }

    // 4. Determine overall severity
    if (!results.workspaceExists || !results.workspaceWritable) {
      results.severity = 'critical';
    } else if (results.permissionIssues.length > 0) {
      results.severity = 'high';
    } else {
      results.severity = 'low';
    }

    return results;
  }

  async attemptAutoFix(targetWs, diagnosticResults) {
    const fixes = [];

    // Auto-Fix 1: Create missing directory
    if (!diagnosticResults.workspaceExists) {
      try {
        await fs.mkdir(targetWs, { recursive: true });
        diagnosticResults.workspaceExists = true;
        fixes.push(`✅ Created missing workspace directory at ${targetWs}`);
      } catch (err) {
        fixes.push(`❌ Auto-fix failed to create directory: ${err.message}`);
      }
    }

    // Auto-Fix 2: Fix directory write permissions
    if (diagnosticResults.workspaceExists && !diagnosticResults.workspaceWritable) {
      try {
        await fs.chmod(targetWs, 0o755);
        const testFile = path.join(targetWs, `.nexusai-autofix-test-${Date.now()}.tmp`);
        await fs.writeFile(testFile, 'OK');
        await fs.unlink(testFile);
        diagnosticResults.workspaceWritable = true;
        fixes.push(`✅ Restored 755 permissions for workspace at ${targetWs}`);
      } catch (err) {
        fixes.push(`❌ Auto-fix failed to update permissions: ${err.message}`);
      }
    }

    return fixes;
  }
}

export const workspaceDiagnostic = new WorkspaceOperationDiagnostic();
