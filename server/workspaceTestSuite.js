/**
 * WORKSPACE OPERATION TEST SUITE & AUTOMATED AUDITOR
 * Location: server/workspaceTestSuite.js
 * Platform: NexusAI v8.5.0 Enterprise Agentic Platform
 */

import fs from 'fs/promises';
import path from 'path';
import { RobustWorkspaceFileWriter } from './robustWorkspaceWriter.js';
import { WorkspaceOperationDiagnostic } from './workspaceDiagnostic.js';

export class WorkspaceTestSuite {
  constructor(workspacePath = process.cwd()) {
    this.workspacePath = path.resolve(workspacePath);
    this.writer = new RobustWorkspaceFileWriter(this.workspacePath);
    this.diagnostic = new WorkspaceOperationDiagnostic();
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runAllTests() {
    console.log(`🧪 Running Workspace Operation Verification Suite at: ${this.workspacePath}...`);
    this.results = [];
    this.passed = 0;
    this.failed = 0;

    await this.testDiagnosticCheck();
    await this.testDirectoryCreation();
    await this.testFileCreationAndContentVerification();
    await this.testFileUpdateAndBackup();
    await this.testPathTraversalSecurity();

    const percentage = Math.round((this.passed / this.results.length) * 100);
    const summary = {
      total: this.results.length,
      passed: this.passed,
      failed: this.failed,
      percentage,
      status: percentage === 100 ? 'excellent' : percentage >= 80 ? 'good' : 'critical'
    };

    return { summary, results: this.results };
  }

  async testDiagnosticCheck() {
    try {
      const report = await this.diagnostic.diagnose(this.workspacePath);
      const ok = report.workspaceExists && report.workspaceWritable;
      this.recordResult('Diagnostic & Permission Health Check', ok, report);
    } catch (err) {
      this.recordResult('Diagnostic & Permission Health Check', false, { error: err.message });
    }
  }

  async testDirectoryCreation() {
    const testDir = path.join(this.workspacePath, `.nexusai-test-dir-${Date.now()}`);
    try {
      const res = await this.writer.createDirectory(testDir);
      const exists = await fs.access(testDir).then(() => true).catch(() => false);
      if (exists) await fs.rmdir(testDir);
      this.recordResult('Directory Creation & Stat Verification', res.success && exists, res);
    } catch (err) {
      this.recordResult('Directory Creation & Stat Verification', false, { error: err.message });
    }
  }

  async testFileCreationAndContentVerification() {
    const testFile = path.join(this.workspacePath, `.nexusai-test-file-${Date.now()}.txt`);
    const testContent = 'Hello NexusAI Verified File Writer World!';
    try {
      const res = await this.writer.writeFile(testFile, testContent, { verifyContent: true });
      const readback = await fs.readFile(testFile, 'utf-8');
      const verified = res.success && readback === testContent;
      if (await fs.access(testFile).then(() => true).catch(() => false)) {
        await fs.unlink(testFile);
      }
      this.recordResult('File Creation & Content Readback Verification', verified, res);
    } catch (err) {
      this.recordResult('File Creation & Content Readback Verification', false, { error: err.message });
    }
  }

  async testFileUpdateAndBackup() {
    const testFile = path.join(this.workspacePath, `.nexusai-update-test-${Date.now()}.txt`);
    try {
      await this.writer.writeFile(testFile, 'Original Content');
      const res = await this.writer.writeFile(testFile, 'Updated Content', { backupBeforeOverwrite: true });
      const readback = await fs.readFile(testFile, 'utf-8');
      const verified = res.success && readback === 'Updated Content' && res.backupCreated;
      if (res.backupPath) await fs.unlink(res.backupPath).catch(() => {});
      await fs.unlink(testFile).catch(() => {});
      this.recordResult('File Update & Backup Creation Verification', verified, res);
    } catch (err) {
      this.recordResult('File Update & Backup Creation Verification', false, { error: err.message });
    }
  }

  async testPathTraversalSecurity() {
    try {
      const badPath = '/etc/passwd_nexusai_test';
      const res = await this.writer.writeFile(badPath, 'Should Fail');
      const prevented = !res.success && (res.error?.includes('Security Violation') || res.message?.includes('Path Traversal'));
      this.recordResult('Path Traversal Safeguard Test', prevented, res);
    } catch (err) {
      this.recordResult('Path Traversal Safeguard Test', true, { prevented: true });
    }
  }

  recordResult(name, passed, details) {
    if (passed) this.passed++;
    else this.failed++;

    this.results.push({
      name,
      passed,
      details
    });
  }
}

export const workspaceTestSuite = new WorkspaceTestSuite();
