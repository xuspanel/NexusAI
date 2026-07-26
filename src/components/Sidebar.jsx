import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Pin, 
  MessageSquare, 
  Trash2, 
  Sparkles, 
  X
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { MOCK_STARTER_PROMPTS } from '../services/apiService';

export default function Sidebar() {
  const { 
    conversations, 
    activeThreadId, 
    setActiveThreadId, 
    createNewThread, 
    deleteThread, 
    togglePinThread,
    sidebarOpen,
    setSidebarOpen,
    sendMessage
  } = useChat();

  const [searchQuery, setSearchQuery] = useState('');

  if (!sidebarOpen) return null;

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedThreads = filteredConversations.filter((c) => c.pinned);
  const recentThreads = filteredConversations.filter((c) => !c.pinned);

  return (
    <>
      {/* Mobile Dark Overlay Backdrop */}
      <div 
        onClick={() => setSidebarOpen(false)}
        className="mobile-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 80,
          display: window.innerWidth <= 768 ? 'block' : 'none'
        }}
      />

      <aside className="sidebar-offcanvas" style={{
        width: 'var(--sidebar-width)',
        height: 'calc(100vh - var(--header-height))',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 85,
        transition: 'all 0.25s ease'
      }}>
        {/* Action Header */}
        <div style={{ padding: '14px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={() => {
                createNewThread();
                if (window.innerWidth <= 768) setSidebarOpen(false);
              }}
              className="btn-primary" 
              style={{ flex: 1, justifyContent: 'center', padding: '10px 14px' }}
            >
              <Plus size={16} />
              New Session
            </button>

            {/* Mobile Close Sidebar Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn-icon"
              style={{ display: window.innerWidth <= 768 ? 'inline-flex' : 'none' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', marginTop: '10px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-main)',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Threads List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {/* Pinned Section */}
          {pinnedThreads.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', padding: '0 6px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Pin size={11} /> Pinned Threads
              </div>
              {pinnedThreads.map((thread) => (
                <SidebarItem
                  key={thread.id}
                  thread={thread}
                  isActive={activeThreadId === thread.id}
                  onSelect={() => {
                    setActiveThreadId(thread.id);
                    if (window.innerWidth <= 768) setSidebarOpen(false);
                  }}
                  onDelete={(e) => deleteThread(thread.id, e)}
                  onPin={(e) => togglePinThread(thread.id, e)}
                />
              ))}
            </div>
          )}

          {/* Recent Threads Section */}
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', padding: '0 6px 6px' }}>
              Recent Sessions
            </div>
            {recentThreads.length === 0 && (
              <div style={{ padding: '12px 8px', fontSize: '12px', color: 'var(--text-subtle)', textAlign: 'center' }}>
                No matching sessions
              </div>
            )}
            {recentThreads.map((thread) => (
              <SidebarItem
                key={thread.id}
                thread={thread}
                isActive={activeThreadId === thread.id}
                onSelect={() => {
                  setActiveThreadId(thread.id);
                  if (window.innerWidth <= 768) setSidebarOpen(false);
                }}
                onDelete={(e) => deleteThread(thread.id, e)}
                onPin={(e) => togglePinThread(thread.id, e)}
              />
            ))}
          </div>

          {/* Quick Launch Shortcuts */}
          <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', padding: '0 6px 8px' }}>
              Quick Launch Prompts
            </div>
            {MOCK_STARTER_PROMPTS.slice(0, 3).map((prompt, idx) => (
              <div
                key={idx}
                onClick={() => {
                  createNewThread(prompt.title);
                  setTimeout(() => sendMessage(prompt.prompt), 50);
                  if (window.innerWidth <= 768) setSidebarOpen(false);
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '11px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={11} style={{ color: 'var(--accent-cyan)' }} />
                  {prompt.title}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {prompt.category}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: Token Usage */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Token Quota</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>14,280 / 100k</span>
          </div>
          <div style={{ height: '5px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '14.2%', background: 'var(--gradient-brand)', borderRadius: '999px' }} />
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({ thread, isActive, onSelect, onDelete, onPin }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '8px 10px',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: isActive ? 'var(--bg-surface)' : isHovered ? 'var(--bg-hover)' : 'transparent',
        border: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
        transition: 'all 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
        <MessageSquare size={14} style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)', flexShrink: 0 }} />
        <span style={{
          fontSize: '12px',
          fontWeight: isActive ? 600 : 400,
          color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {thread.title}
        </span>
      </div>

      {(isHovered || thread.pinned || isActive) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <button
            onClick={onPin}
            style={{
              background: 'transparent',
              border: 'none',
              color: thread.pinned ? 'var(--accent-amber)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px'
            }}
            title={thread.pinned ? 'Unpin' : 'Pin to top'}
          >
            <Pin size={12} />
          </button>
          <button
            onClick={onDelete}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px'
            }}
            title="Delete session"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
