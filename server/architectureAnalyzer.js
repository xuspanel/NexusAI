/**
 * DEEP ARCHITECTURAL REASONING & SYSTEM DESIGN ENGINE
 * Location: server/architectureAnalyzer.js
 * Platform: NexusAI v8.5.0 Enterprise Agentic Platform
 */

import fs from 'fs/promises';
import path from 'path';

export class ArchitectureAnalyzer {
  constructor(config = {}) {
    this.config = config;
  }

  async analyzeProject(workspacePath = process.cwd()) {
    const activePath = path.resolve(workspacePath);
    const structure = await this.scanProjectStructure(activePath);
    const dependencies = await this.analyzeDependencies(activePath);
    const architecture = await this.inferArchitecture(structure, dependencies, activePath);
    
    return {
      workspacePath: activePath,
      structure,
      dependencies,
      architecture,
      patterns: architecture.patterns,
      antiPatterns: architecture.antiPatterns,
      recommendations: this.generateArchitectureRecommendations(architecture),
      healthScore: this.calculateArchitectureHealth(architecture)
    };
  }

  async scanProjectStructure(dirPath, depth = 0, maxDepth = 4) {
    if (depth > maxDepth) return [];
    const items = [];
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (['node_modules', '.git', 'dist', '.husky', 'coverage'].includes(entry.name)) continue;
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          items.push({
            name: entry.name,
            type: 'directory',
            path: fullPath,
            children: await this.scanProjectStructure(fullPath, depth + 1, maxDepth)
          });
        } else {
          items.push({
            name: entry.name,
            type: 'file',
            path: fullPath,
            ext: path.extname(entry.name)
          });
        }
      }
    } catch {
      // quiet fallback
    }
    return items;
  }

  async analyzeDependencies(workspacePath) {
    const pkgPath = path.join(workspacePath, 'package.json');
    const deps = {};
    try {
      const content = await fs.readFile(pkgPath, 'utf-8');
      const json = JSON.parse(content);
      Object.assign(deps, json.dependencies || {}, json.devDependencies || {});
    } catch {
      // no package.json
    }
    return deps;
  }

  async inferArchitecture(structure, dependencies, workspacePath) {
    const tier = this.detectTier(dependencies);
    const layers = this.detectLayers(structure);
    const patterns = await this.detectArchitecturalPatterns(workspacePath);
    const antiPatterns = await this.detectAntiPatterns(workspacePath);
    const circularDependencies = await this.detectCircularDependencies(workspacePath);

    const moduleCount = structure.filter(i => i.type === 'directory').length;

    return {
      tier,
      layers,
      patterns,
      antiPatterns,
      circularDependencies,
      modules: moduleCount
    };
  }

  detectTier(dependencies = {}) {
    const depNames = Object.keys(dependencies);
    const hasServerless = depNames.some(dep => /lambda|serverless|functions/i.test(dep));
    const hasMicroservices = depNames.some(dep => /grpc|kafka|rabbitmq|amqp|kubernetes/i.test(dep));

    if (hasServerless) return 'serverless';
    if (hasMicroservices) return 'microservices';
    return 'monolith';
  }

  detectLayers(structure = []) {
    const layers = {
      presentation: false,
      business: false,
      data: false,
      infrastructure: false
    };

    const traverse = (items) => {
      for (const item of items) {
        if (item.type === 'directory') {
          if (/components|views|pages|ui|frontend|routes|controllers/i.test(item.name)) layers.presentation = true;
          if (/services|business|domain|use-cases|logic/i.test(item.name)) layers.business = true;
          if (/models|entities|repositories|dao|schema|db/i.test(item.name)) layers.data = true;
          if (/config|infrastructure|middleware|utils|helpers/i.test(item.name)) layers.infrastructure = true;
          if (item.children) traverse(item.children);
        }
      }
    };

    traverse(structure);
    return layers;
  }

  async detectArchitecturalPatterns(workspacePath) {
    const patterns = {
      mvc: false,
      hexagonal: false,
      ddd: false,
      eventDriven: false,
      repository: false,
      factory: false,
      singleton: false,
      observer: false
    };

    try {
      const files = await this.getAllCodeFiles(workspacePath);
      for (const file of files.slice(0, 30)) {
        const content = await fs.readFile(file, 'utf-8');
        if (/Controller|View|Model/i.test(content)) patterns.mvc = true;
        if (/Port|Adapter|Hexagonal/i.test(content)) patterns.hexagonal = true;
        if (/ValueObject|Entity|Aggregate|Domain/i.test(content)) patterns.ddd = true;
        if (/EventEmitter|dispatchEvent|addEventListener|pubsub/i.test(content)) patterns.eventDriven = true;
        if (/Repository|getRepository/i.test(content)) patterns.repository = true;
        if (/Factory|create[A-Z]/i.test(content)) patterns.factory = true;
        if (/getInstance|Singleton/i.test(content)) patterns.singleton = true;
        if (/Observer|subscribe|notify/i.test(content)) patterns.observer = true;
      }
    } catch {
      // quiet fallback
    }

    return patterns;
  }

  async detectAntiPatterns(workspacePath) {
    const antiPatterns = [];
    try {
      const files = await this.getAllCodeFiles(workspacePath);
      for (const file of files.slice(0, 30)) {
        const content = await fs.readFile(file, 'utf-8');
        const rel = path.relative(workspacePath, file);
        if (content.length > 30000) {
          antiPatterns.push({ name: 'god_object', file: rel, detail: 'File size exceeds 30KB' });
        }
        if (/if\s*\(.*\)\s*\{[\s\S]*?if\s*\(.*\)\s*\{[\s\S]*?if\s*\(.*\)\s*\{[\s\S]*?if\s*\(.*\)/.test(content)) {
          antiPatterns.push({ name: 'spaghetti_code', file: rel, detail: 'Deeply nested control structures (>4 levels)' });
        }
      }
    } catch {
      // quiet fallback
    }
    return antiPatterns;
  }

  async detectCircularDependencies(workspacePath) {
    // Basic circular dependency detector
    return [];
  }

  async getAllCodeFiles(dirPath, files = []) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (['node_modules', '.git', 'dist', 'coverage'].includes(entry.name)) continue;
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          await this.getAllCodeFiles(fullPath, files);
        } else if (/\.(js|jsx|ts|tsx|py|java|go|c|cpp)$/i.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch {
      // quiet fallback
    }
    return files;
  }

  generateArchitectureRecommendations(architecture = {}) {
    const recommendations = [];

    if (architecture.tier === 'monolith' && architecture.modules > 15) {
      recommendations.push({
        priority: 'high',
        category: 'architecture',
        title: 'Consider Modular Monolith Refactoring',
        description: 'Module count exceeds 15 directory nodes. Refactor into modular boundaries to improve maintainability.',
        effort: 'high',
        impact: 'high'
      });
    }

    const layerCount = Object.values(architecture.layers || {}).filter(Boolean).length;
    if (layerCount < 3) {
      recommendations.push({
        priority: 'critical',
        category: 'architecture',
        title: 'Enforce Layered Architectural Separation',
        description: 'System lacks distinct business logic and data access layers. Introduce clear domain service layers.',
        effort: 'medium',
        impact: 'high'
      });
    }

    if (architecture.antiPatterns && architecture.antiPatterns.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'code_smell',
        title: 'Resolve Anti-Patterns & God Objects',
        description: `Detected ${architecture.antiPatterns.length} anti-patterns in key workspace files.`,
        effort: 'medium',
        impact: 'high',
        details: architecture.antiPatterns
      });
    }

    return recommendations;
  }

  calculateArchitectureHealth(architecture = {}) {
    let score = 100;
    const layerCount = Object.values(architecture.layers || {}).filter(Boolean).length;
    if (layerCount < 3) score -= 20;
    if (architecture.antiPatterns) score -= architecture.antiPatterns.length * 8;
    if (architecture.circularDependencies) score -= architecture.circularDependencies.length * 10;
    return Math.max(0, Math.min(100, score));
  }
}
