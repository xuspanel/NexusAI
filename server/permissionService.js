import path from 'path';
import os from 'os';
import { minimatch } from 'minimatch';
import { pool } from './db.js';

export const PERMISSION_LEVELS = {
  RESTRICTED: 0,
  DEVELOPER: 1,
  ADMINISTRATOR: 2,
  SUPERUSER: 3
};

export const DEFAULT_COMMAND_WHITELIST = [
  'npm', 'npx', 'yarn', 'pnpm', 'git', 'node', 'python', 'python3', 'pip', 'gcc', 'g++', 'make', 'cargo', 'go',
  'ls', 'dir', 'cd', 'pwd', 'cp', 'mv', 'rm', 'mkdir', 'rmdir', 'cat', 'head', 'tail', 'grep', 'find', 'touch', 'echo',
  'systemctl', 'service', 'dnf', 'apt', 'apt-get', 'yum', 'ps', 'top', 'htop', 'kill', 'pkill', 'docker', 'docker-compose',
  'curl', 'wget', 'ssh', 'scp', 'netstat', 'ss', 'ip', 'ifconfig'
];

class PermissionService {
  constructor() {
    this.cache = new Map();
    this.ttlMs = 300000;
    this.activeWorkspace = path.normalize(process.cwd());
    const homedir = os.homedir();
    
    this.activeProfile = {
      userId: 'default_user',
      activeLevel: PERMISSION_LEVELS.DEVELOPER,
      profileName: 'Standard Developer',
      securityScore: 88,
      pathWhitelists: [
        `${this.activeWorkspace}/**`,
        `${homedir}/**`,
        '/workspace/**',
        '/tmp/**'
      ],
      pathBlacklists: ['/etc/shadow', '/etc/sudoers', '/root/.ssh/**', '/etc/passwd'],
      commandWhitelists: [...DEFAULT_COMMAND_WHITELIST],
      agenticCapabilities: {
        autonomousMode: true,
        multiStepPlanning: true,
        selfCorrection: true,
        toolCreation: true,
        maxCorrectionRetries: 5
      }
    };
  }

  getProfile() {
    return this.activeProfile;
  }

  setActiveWorkspace(workspacePath) {
    if (!workspacePath) return;
    this.activeWorkspace = path.normalize(workspacePath);
    const pattern = `${this.activeWorkspace}/**`;
    if (!this.activeProfile.pathWhitelists.includes(pattern)) {
      this.activeProfile.pathWhitelists.push(pattern);
    }
    this.cache.clear();
  }

  updateProfile(updates) {
    this.activeProfile = { ...this.activeProfile, ...updates };
    this.cache.clear();
    return this.activeProfile;
  }

  async evaluatePermission({ category, action, target, currentLevel = null }) {
    const level = currentLevel !== null ? currentLevel : this.activeProfile.activeLevel;
    const cacheKey = `${category}:${action}:${target}:${level}`;
    
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.decision;
    }

    const startTime = performance.now();
    let isAllowed = false;
    let reason = '';

    if (level === PERMISSION_LEVELS.SUPERUSER) {
      isAllowed = true;
      reason = 'Granted via Level 3 Superuser privilege';
    } 
    else if (level === PERMISSION_LEVELS.RESTRICTED) {
      if (category === 'filesystem' && action === 'read') {
        isAllowed = true;
        reason = 'Granted read access under Level 0 Restricted mode';
      } else {
        isAllowed = false;
        reason = 'Restricted Level 0 mode blocks system commands and file write operations';
      }
    } 
    else {
      if (category === 'filesystem') {
        const normalizedTarget = path.normalize(target);
        
        // Blacklist check
        const isBlacklisted = this.activeProfile.pathBlacklists.some((pattern) =>
          minimatch(normalizedTarget, pattern, { dot: true })
        );

        if (isBlacklisted) {
          isAllowed = false;
          reason = `Access denied: Target path '${target}' matches blacklist security pattern`;
        } else {
          // Dynamic active workspace, home directory & whitelist check
          const isWhitelisted = this.activeProfile.pathWhitelists.some((pattern) =>
            minimatch(normalizedTarget, pattern, { dot: true })
          );

          const homedir = os.homedir();
          const appCwd = process.cwd();

          const isInWorkspace = normalizedTarget.startsWith(this.activeWorkspace) ||
            normalizedTarget.startsWith(appCwd) ||
            normalizedTarget.startsWith(homedir) ||
            normalizedTarget.startsWith('/workspace') ||
            normalizedTarget.startsWith('/tmp');

          isAllowed = isWhitelisted || isInWorkspace;
          reason = isAllowed 
            ? 'Granted: Path within authorized workspace scope' 
            : `Access denied: Target path '${target}' outside allowed workspace scopes`;
        }
      } else if (category === 'command') {
        const baseCommand = action.trim().split(' ')[0];
        
        if (level >= PERMISSION_LEVELS.ADMINISTRATOR) {
          isAllowed = true;
          reason = `Granted: Command '${baseCommand}' permitted under Level 2 Administrator mode`;
        } else {
          isAllowed = this.activeProfile.commandWhitelists.includes(baseCommand);
          reason = isAllowed 
            ? `Granted: Command '${baseCommand}' is in Developer whitelist` 
            : `Access denied: Command '${baseCommand}' requires Level 2 Administrator or higher`;
        }
      } else if (category === 'agentic') {
        isAllowed = this.activeProfile.agenticCapabilities.multiStepPlanning;
        reason = isAllowed ? 'Granted: Agentic multi-step capabilities enabled' : 'Access denied: Agentic capabilities toggled off';
      } else {
        isAllowed = level >= PERMISSION_LEVELS.ADMINISTRATOR;
        reason = isAllowed ? `Granted under Level ${level}` : `Requires Level 2 Administrator or higher`;
      }
    }

    const durationMs = (performance.now() - startTime).toFixed(2);
    const decision = { allowed: isAllowed, reason, durationMs: `${durationMs}ms`, level };

    this.logAudit({
      category,
      actionType: action,
      targetResource: target,
      decision: isAllowed ? 'ALLOWED' : 'DENIED',
      durationMs,
      reason
    });

    this.cache.set(cacheKey, { decision, expiry: Date.now() + this.ttlMs });
    return decision;
  }

  async logAudit({ category, actionType, targetResource, decision, durationMs, reason }) {
    try {
      if (pool) {
        await pool.query(
          `INSERT INTO permission_audit_logs (id, user_id, permission_id, category, action_type, target_resource, decision, execution_time_ms, reason)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          ['audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6), 'default_user', category, category, actionType, targetResource, decision, parseFloat(durationMs), reason]
        );
      }
    } catch {
      // quiet fallback
    }
  }
}

export const permissionService = new PermissionService();
