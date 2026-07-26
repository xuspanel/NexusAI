import fs from 'fs/promises';
import path from 'path';
import { permissionService } from './permissionService.js';

export class VFSBridge {
  static async listDirectory(dirPath = '/workspace') {
    const normPath = path.normalize(dirPath);
    const auth = await permissionService.evaluatePermission({
      category: 'filesystem',
      action: 'read',
      target: normPath
    });

    if (!auth.allowed) {
      throw new Error(`[VFS Permission Denied] ${auth.reason}`);
    }

    try {
      const entries = await fs.readdir(normPath, { withFileTypes: true });
      return entries.map((e) => ({
        name: e.name,
        path: path.join(normPath, e.name),
        isDirectory: e.isDirectory(),
        isFile: e.isFile()
      }));
    } catch (err) {
      throw new Error(`[VFS List Error] ${err.message}`);
    }
  }

  static async readFile(filePath) {
    const normPath = path.normalize(filePath);
    const auth = await permissionService.evaluatePermission({
      category: 'filesystem',
      action: 'read',
      target: normPath
    });

    if (!auth.allowed) {
      throw new Error(`[VFS Permission Denied] ${auth.reason}`);
    }

    try {
      const content = await fs.readFile(normPath, 'utf-8');
      return content;
    } catch (err) {
      throw new Error(`[VFS Read Error] ${err.message}`);
    }
  }

  static async writeFile(filePath, content) {
    const normPath = path.normalize(filePath);
    const auth = await permissionService.evaluatePermission({
      category: 'filesystem',
      action: 'write',
      target: normPath
    });

    if (!auth.allowed) {
      throw new Error(`[VFS Permission Denied] ${auth.reason}`);
    }

    try {
      await fs.mkdir(path.dirname(normPath), { recursive: true });
      await fs.writeFile(normPath, content, 'utf-8');
      return { success: true, path: normPath };
    } catch (err) {
      throw new Error(`[VFS Write Error] ${err.message}`);
    }
  }

  static async deleteFile(filePath) {
    const normPath = path.normalize(filePath);
    const auth = await permissionService.evaluatePermission({
      category: 'filesystem',
      action: 'delete',
      target: normPath
    });

    if (!auth.allowed) {
      throw new Error(`[VFS Permission Denied] ${auth.reason}`);
    }

    try {
      await fs.unlink(normPath);
      return { success: true };
    } catch (err) {
      throw new Error(`[VFS Delete Error] ${err.message}`);
    }
  }

  static async createDirectory(dirPath) {
    const normPath = path.normalize(dirPath);
    const auth = await permissionService.evaluatePermission({
      category: 'filesystem',
      action: 'write',
      target: normPath
    });

    if (!auth.allowed) {
      throw new Error(`[VFS Permission Denied] ${auth.reason}`);
    }

    try {
      await fs.mkdir(normPath, { recursive: true });
      return { success: true, path: normPath };
    } catch (err) {
      throw new Error(`[VFS Directory Error] ${err.message}`);
    }
  }
}
