import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration from environment variables
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      database: process.env.PGDATABASE || 'nexusai_db',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      max: 20, // Connection pool max limit
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000
    };

export const pool = new Pool(poolConfig);

let isPostgresOnline = false;

// Fallback In-Memory / File Store if PostgreSQL is offline
const fallbackStore = {
  conversations: [
    {
      id: 'thread-1',
      title: 'Analytics Dashboard React Component',
      model: 'qwen2.5:1.5b',
      pinned: true,
      date_group: 'Today',
      updated_at: new Date().toISOString()
    }
  ],
  messages: [
    {
      id: 'msg-1',
      conversation_id: 'thread-1',
      sender: 'user',
      content: 'Build a futuristic analytics dashboard component in React.',
      timestamp: new Date().toISOString()
    },
    {
      id: 'msg-2',
      conversation_id: 'thread-1',
      sender: 'ai',
      model: 'qwen2.5:1.5b',
      content: 'I have designed a sleek, high-performance Analytics Dashboard Component.',
      timestamp: new Date().toISOString()
    }
  ],
  settings: {},
  documents: [
    { id: '1', file_name: 'Nexus_Architecture_Specs.pdf', file_size: '2.4 MB', chunks_count: 142, status: 'Indexed' }
  ]
};

/**
 * Initialize PostgreSQL Schema
 */
export async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log('🐘 [PostgreSQL Engine] Connected to PostgreSQL server.');
    isPostgresOnline = true;

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(sql);
      console.log('✅ [PostgreSQL Schema] Database tables and indexes verified.');
    }
    client.release();
  } catch (err) {
    console.warn('⚠️ [PostgreSQL Engine Warning] Could not connect to PostgreSQL. Using high-speed fallback store:', err.message);
    isPostgresOnline = false;
  }
}

// --------------------------------------------------------------------------
// CONVERSATIONS QUERY SERVICES
// --------------------------------------------------------------------------

export async function dbGetConversations() {
  if (isPostgresOnline) {
    const res = await pool.query(
      'SELECT id, title, model, pinned, date_group, updated_at FROM conversations ORDER BY pinned DESC, updated_at DESC'
    );
    return res.rows;
  }
  return fallbackStore.conversations;
}

export async function dbCreateConversation(id, title, model) {
  if (isPostgresOnline) {
    const res = await pool.query(
      'INSERT INTO conversations (id, title, model, date_group) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, title || 'New Conversation', model || 'qwen2.5:1.5b', 'Today']
    );
    return res.rows[0];
  }
  const newConv = { id, title: title || 'New Session', model: model || 'qwen2.5:1.5b', pinned: false, date_group: 'Today', updated_at: new Date().toISOString() };
  fallbackStore.conversations.unshift(newConv);
  return newConv;
}

export async function dbUpdateConversation(id, updates = {}) {
  if (isPostgresOnline) {
    const { title, pinned, model } = updates;
    const res = await pool.query(
      `UPDATE conversations 
       SET title = COALESCE($1, title), 
           pinned = COALESCE($2, pinned), 
           model = COALESCE($3, model),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 RETURNING *`,
      [title, pinned, model, id]
    );
    return res.rows[0];
  }
  const conv = fallbackStore.conversations.find((c) => c.id === id);
  if (conv) {
    if (updates.title !== undefined) conv.title = updates.title;
    if (updates.pinned !== undefined) conv.pinned = updates.pinned;
    if (updates.model !== undefined) conv.model = updates.model;
    conv.updated_at = new Date().toISOString();
  }
  return conv;
}

export async function dbDeleteConversation(id) {
  if (isPostgresOnline) {
    await pool.query('DELETE FROM conversations WHERE id = $1', [id]);
    return true;
  }
  fallbackStore.conversations = fallbackStore.conversations.filter((c) => c.id !== id);
  fallbackStore.messages = fallbackStore.messages.filter((m) => m.conversation_id !== id);
  return true;
}

// --------------------------------------------------------------------------
// MESSAGES QUERY SERVICES
// --------------------------------------------------------------------------

export async function dbGetMessages(conversationId) {
  if (isPostgresOnline) {
    const res = await pool.query(
      'SELECT id, conversation_id, sender, content, thought, model, artifact, attachments, timestamp FROM messages WHERE conversation_id = $1 ORDER BY timestamp ASC',
      [conversationId]
    );
    return res.rows;
  }
  return fallbackStore.messages.filter((m) => m.conversation_id === conversationId);
}

export async function dbAddMessage(msg) {
  const { id, conversationId, sender, content, thought, model, artifact, attachments } = msg;

  if (isPostgresOnline) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query(
        `INSERT INTO messages (id, conversation_id, sender, content, thought, model, artifact, attachments) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [id, conversationId, sender, content, thought || null, model || null, artifact ? JSON.stringify(artifact) : null, JSON.stringify(attachments || [])]
      );
      await client.query('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [conversationId]);
      await client.query('COMMIT');
      return res.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  const newMsg = { id, conversation_id: conversationId, sender, content, thought, model, artifact, attachments, timestamp: new Date().toISOString() };
  fallbackStore.messages.push(newMsg);
  return newMsg;
}

// --------------------------------------------------------------------------
// SETTINGS QUERY SERVICES
// --------------------------------------------------------------------------

export async function dbGetSettings() {
  if (isPostgresOnline) {
    const res = await pool.query('SELECT setting_key, setting_value FROM user_settings');
    const settingsObj = {};
    res.rows.forEach((r) => {
      settingsObj[r.setting_key] = r.setting_value;
    });
    return settingsObj;
  }
  return fallbackStore.settings;
}

export async function dbSaveSetting(key, value) {
  if (isPostgresOnline) {
    await pool.query(
      `INSERT INTO user_settings (setting_key, setting_value, updated_at) 
       VALUES ($1, $2, CURRENT_TIMESTAMP) 
       ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP`,
      [key, JSON.stringify(value)]
    );
    return true;
  }
  fallbackStore.settings[key] = value;
  return true;
}
