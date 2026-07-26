-- ==========================================================================
-- NEXUS AI - PRODUCTION POSTGRESQL DATABASE SCHEMA
-- File: server/schema.sql
-- ==========================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(64) PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    model VARCHAR(128) NOT NULL DEFAULT 'qwen2.5:1.5b',
    pinned BOOLEAN DEFAULT FALSE,
    date_group VARCHAR(32) DEFAULT 'Today',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_pinned ON conversations(pinned);

-- 2. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender VARCHAR(16) NOT NULL CHECK (sender IN ('user', 'ai')),
    content TEXT NOT NULL,
    thought TEXT,
    model VARCHAR(128),
    artifact JSONB,
    attachments JSONB DEFAULT '[]'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id, timestamp ASC);

-- 3. USER CONFIGURATIONS & SETTINGS TABLE
CREATE TABLE IF NOT EXISTS user_settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. KNOWLEDGE VAULT RAG DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id VARCHAR(64) PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_size VARCHAR(32),
    chunks_count INT DEFAULT 0,
    status VARCHAR(32) DEFAULT 'Indexed',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
