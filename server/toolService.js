import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import { permissionService } from './permissionService.js';

const execAsync = util.promisify(exec);

export const TOOL_REGISTRY = {
  // Category 1: Code Quality & DevEx
  eslint: { name: 'ESLint', command: 'npx eslint', category: 'quality', defaultArgs: ['--version'] },
  prettier: { name: 'Prettier', command: 'npx prettier', category: 'quality', defaultArgs: ['--version'] },
  typescript: { name: 'TypeScript Compiler', command: 'npx tsc', category: 'quality', defaultArgs: ['--version'] },
  black: { name: 'Black Python Formatter', command: 'python3 -m black', category: 'quality', defaultArgs: ['--version'] },
  pylint: { name: 'Pylint Python Linter', command: 'python3 -m pylint', category: 'quality', defaultArgs: ['--version'] },
  mypy: { name: 'MyPy Static Type Checker', command: 'python3 -m mypy', category: 'quality', defaultArgs: ['--version'] },

  // Category 2: Git Automation & Pre-commit
  commitlint: { name: 'Commitlint', command: 'npx commitlint', category: 'git', defaultArgs: ['--version'] },
  husky: { name: 'Husky Git Hooks', command: 'npx husky', category: 'git', defaultArgs: ['--version'] },
  lintstaged: { name: 'Lint-Staged', command: 'npx lint-staged', category: 'git', defaultArgs: ['--version'] },

  // Category 3: Testing Frameworks
  jest: { name: 'Jest Test Runner', command: 'npx jest', category: 'testing', defaultArgs: ['--version'] },
  pytest: { name: 'Pytest Python Test Runner', command: 'python3 -m pytest', category: 'testing', defaultArgs: ['--version'] },
  mocha: { name: 'Mocha Test Framework', command: 'npx mocha', category: 'testing', defaultArgs: ['--version'] },

  // Category 4: Build & Bundlers
  vite: { name: 'Vite Bundler', command: 'npx vite', category: 'bundler', defaultArgs: ['--version'] },
  webpack: { name: 'Webpack Bundler', command: 'npx webpack', category: 'bundler', defaultArgs: ['--version'] },
  esbuild: { name: 'ESBuild Compiler', command: 'npx esbuild', category: 'bundler', defaultArgs: ['--version'] },

  // Category 5: Containerization
  docker: { name: 'Docker Engine', command: 'docker', category: 'container', defaultArgs: ['--version'] },
  kubectl: { name: 'Kubernetes CLI', command: 'kubectl', category: 'container', defaultArgs: ['version', '--client'] },
  helm: { name: 'Helm Package Manager', command: 'helm', category: 'container', defaultArgs: ['version'] },

  // Category 6: Security & SAST
  snyk: { name: 'Snyk Security Scanner', command: 'npx snyk', category: 'security', defaultArgs: ['--version'] },
  bandit: { name: 'Bandit Python Security', command: 'python3 -m bandit', category: 'security', defaultArgs: ['--version'] },
  semgrep: { name: 'Semgrep SAST Scanner', command: 'semgrep', category: 'security', defaultArgs: ['--version'] },

  // Category 7: Documentation & Diagrams
  typedoc: { name: 'TypeDoc Generator', command: 'npx typedoc', category: 'documentation', defaultArgs: ['--version'] },
  mermaid: { name: 'Mermaid CLI Diagrammer', command: 'npx @mermaid-js/mermaid-cli', category: 'documentation', defaultArgs: ['--version'] }
};

class ToolService {
  /**
   * Check status and versions of all registered tools in parallel with strict 1.5s timeouts
   */
  async checkAllStatus() {
    const entries = Object.entries(TOOL_REGISTRY);
    const checks = entries.map(async ([key, tool]) => {
      const res = await this.checkSingleTool(key);
      return [key, res];
    });

    const resultsArray = await Promise.all(checks);
    const results = {};
    resultsArray.forEach(([key, res]) => {
      results[key] = res;
    });
    return results;
  }

  async checkSingleTool(toolKey) {
    const tool = TOOL_REGISTRY[toolKey];
    if (!tool) return { installed: false, error: 'Unknown tool key' };

    try {
      const { stdout } = await execAsync(`${tool.command} ${tool.defaultArgs.join(' ')}`, { timeout: 1500 });
      return {
        installed: true,
        name: tool.name,
        category: tool.category,
        version: stdout.trim().split('\n')[0] || 'Installed'
      };
    } catch (err) {
      return {
        installed: false,
        name: tool.name,
        category: tool.category,
        error: err.message.slice(0, 80)
      };
    }
  }

  /**
   * Execute a tool safely via VFS & Permission Evaluation
   */
  async executeTool({ toolKey, args = [], cwd = process.cwd() }) {
    const tool = TOOL_REGISTRY[toolKey];
    if (!tool) {
      throw new Error(`Tool '${toolKey}' is not registered in the system toolchain.`);
    }

    const normCwd = path.normalize(cwd || process.cwd());
    
    // Evaluate permissions
    const auth = await permissionService.evaluatePermission({
      category: 'command',
      action: `${tool.command} ${args.join(' ')}`,
      target: normCwd
    });

    if (!auth.allowed) {
      throw new Error(`[Tool Permission Denied] ${auth.reason}`);
    }

    const fullCommand = `${tool.command} ${args.join(' ')}`;
    const startTime = performance.now();

    try {
      const { stdout, stderr } = await execAsync(fullCommand, {
        cwd: normCwd,
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024
      });

      const durationMs = (performance.now() - startTime).toFixed(2);
      return {
        success: true,
        tool: tool.name,
        command: fullCommand,
        durationMs: `${durationMs}ms`,
        stdout,
        stderr
      };
    } catch (err) {
      const durationMs = (performance.now() - startTime).toFixed(2);
      return {
        success: false,
        tool: tool.name,
        command: fullCommand,
        durationMs: `${durationMs}ms`,
        error: err.message,
        stdout: err.stdout || '',
        stderr: err.stderr || ''
      };
    }
  }
}

export const toolService = new ToolService();
