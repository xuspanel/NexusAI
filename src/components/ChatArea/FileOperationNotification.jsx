import React, { useState } from 'react';
import { 
  FileCheck, 
  FilePlus, 
  FileEdit, 
  FileX, 
  FolderArchive, 
  ExternalLink, 
  Eye, 
  Check, 
  ChevronDown, 
  ChevronRight,
  ShieldCheck,
  Code
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export default function FileOperationNotification({ notification }) {
  const { setActiveArtifact, setCanvasOpen, setWorkspaceModalOpen } = useChat();
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  if (!notification) return null;

  const {
    type = 'create', // 'create' | 'update' | 'delete' | 'batch'
    filename = '',
    path = '',
    files = [],
    lines = 0,
    bytes = 0,
    backupCreated = false,
    backupPath = '',
    timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    content = ''
  } = notification;

  const handleOpenCanvas = (fileContent, fileTitle, fileLang) => {
    setActiveArtifact({
      id: 'vfs-' + Date.now(),
      type: 'code',
      title: fileTitle || filename || 'Workspace File',
      language: fileLang || 'javascript',
      code: fileContent || ''
    });
    setCanvasOpen(true);
  };

  const getBadgeStyle = () => {
    switch (type) {
      case 'create':
        return { label: 'FILE CREATED', bg: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', icon: FilePlus, border: 'rgba(6, 182, 212, 0.4)' };
      case 'update':
        return { label: 'FILE UPDATED', bg: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)', icon: FileEdit, border: 'rgba(168, 85, 247, 0.4)' };
      case 'delete':
        return { label: 'FILE DELETED', bg: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', icon: FileX, border: 'rgba(244, 63, 94, 0.4)' };
      case 'batch':
      default:
        return { label: 'BATCH WORKSPACE GENERATION', bg: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)', icon: FolderArchive, border: 'rgba(99, 102, 241, 0.4)' };
    }
  };

  const badge = getBadgeStyle();
  const IconComponent = badge.icon;

  return (
    <div 
      role="region" 
      aria-label={`File operation notification for ${filename || 'workspace files'}`}
      className="glass-card fade-in"
      style={{
        margin: '12px 0',
        padding: '14px 16px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-surface)',
        border: `1px solid ${badge.border}`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            padding: '6px',
            borderRadius: 'var(--radius-md)',
            background: badge.bg,
            color: badge.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IconComponent size={16} />
          </div>
          <div>
            <span style={{ 
              fontSize: '10px', 
              fontWeight: 800, 
              color: badge.color, 
              letterSpacing: '0.5px', 
              textTransform: 'uppercase',
              display: 'block'
            }}>
              {badge.label}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
              {type === 'batch' ? `${files.length} Files Written to Workspace` : filename}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {backupCreated && (
            <span className="badge badge-cyan" style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <ShieldCheck size={10} />
              Backup Ready
            </span>
          )}
          <span style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>{timestamp}</span>
        </div>
      </div>

      {/* Path Display */}
      {type !== 'batch' && (
        <div style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          background: 'var(--bg-tertiary)',
          padding: '6px 10px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          wordBreak: 'break-all',
          marginBottom: '10px'
        }}>
          📁 {path || filename}
        </div>
      )}

      {/* Batch Files List */}
      {type === 'batch' && files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
          {files.slice(0, detailsExpanded ? files.length : 3).map((f, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)'
            }}>
              <span style={{ color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                📄 {f.filename || f.path}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                {f.lines ? `${f.lines} lines` : 'Written'}
              </span>
            </div>
          ))}
          {files.length > 3 && (
            <button
              onClick={() => setDetailsExpanded(!detailsExpanded)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-cyan)',
                fontSize: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 0'
              }}
            >
              {detailsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <span>{detailsExpanded ? 'Show Less' : `+${files.length - 3} more generated files...`}</span>
            </button>
          )}
        </div>
      )}

      {/* Footer Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-subtle)', display: 'flex', gap: '12px' }}>
          {lines > 0 && <span><strong>Lines:</strong> {lines}</span>}
          {bytes > 0 && <span><strong>Size:</strong> {(bytes / 1024).toFixed(1)} KB</span>}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setWorkspaceModalOpen(true)}
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px' }}
            title="Open Workspace Directory Browser"
          >
            <Eye size={12} />
            <span>Workspace</span>
          </button>

          {content && type !== 'batch' && (
            <button
              onClick={() => handleOpenCanvas(content, filename)}
              className="btn-primary"
              style={{ padding: '4px 10px', fontSize: '11px' }}
              title="Open generated content in live Code Canvas"
            >
              <Code size={12} />
              <span>Inspect in Canvas</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
