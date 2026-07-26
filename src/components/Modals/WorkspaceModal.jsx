import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderPlus, 
  FileText, 
  X, 
  Check, 
  ChevronRight, 
  Home, 
  HardDrive, 
  Search, 
  Star, 
  Clock, 
  Shield, 
  Lock, 
  Unlock, 
  RefreshCw,
  ArrowUp,
  Sliders,
  Eye,
  EyeOff
} from 'lucide-react';
import { useChat, getApiUrl } from '../../context/ChatContext';

export default function WorkspaceModal({ isOpen, onClose }) {
  const { currentWorkspace, setCurrentWorkspace, addWorkspaceBookmark, workspaceBookmarks } = useChat();

  const [pathInput, setPathInput] = useState(currentWorkspace || '/workspace');
  const [currentPath, setCurrentPath] = useState(currentWorkspace || '/workspace');
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState({ valid: true, readable: true, writable: true });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when modal opens or currentWorkspace changes
  useEffect(() => {
    if (currentWorkspace) {
      setPathInput(currentWorkspace);
      setCurrentPath(currentWorkspace);
    }
  }, [currentWorkspace, isOpen]);

  // Fetch directory items on path change
  useEffect(() => {
    if (!isOpen) return;

    const fetchDirectory = async () => {
      setLoading(true);
      try {
        const res = await fetch(getApiUrl('/api/vfs/list'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: currentPath })
        });
        const data = await res.json();
        if (data.success) {
          setItems(data.entries);
          setValidationStatus({ valid: true, readable: true, writable: true });
        } else {
          setValidationStatus({ valid: false, reason: data.error });
        }
      } catch (err) {
        setValidationStatus({ valid: false, reason: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchDirectory();
  }, [currentPath, isOpen]);

  if (!isOpen) return null;

  const handleNavigate = (newPath) => {
    setCurrentPath(newPath);
    setPathInput(newPath);
  };

  const handleGoUp = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    handleNavigate(parentPath);
  };

  const handleSelectAsWorkspace = () => {
    setCurrentWorkspace(currentPath);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleAddBookmark = () => {
    const name = currentPath.split('/').pop() || 'Workspace';
    addWorkspaceBookmark({ name, path: currentPath });
  };

  const filteredItems = items.filter((item) => {
    if (!showHidden && item.name.startsWith('.')) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <div 
      className="modal-backdrop fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '85vh',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-active)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 34, height: 34, borderRadius: '9px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
              <FolderPlus size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>Active Workspace Directory Manager</h3>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>Browse & set isolated working environment directory for file ops</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: 28, height: 28 }}>
            <X size={16} />
          </button>
        </div>

        {/* Path Breadcrumbs Bar */}
        <div style={{ padding: '10px 20px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => handleNavigate('/')} className="btn-icon" style={{ width: 26, height: 26 }} title="Root directory">
            <HardDrive size={13} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', flex: 1 }}>
            <span 
              onClick={() => handleNavigate('/')}
              style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              root
            </span>
            {pathParts.map((part, idx) => {
              const fullSubPath = '/' + pathParts.slice(0, idx + 1).join('/');
              return (
                <React.Fragment key={idx}>
                  <ChevronRight size={11} style={{ color: 'var(--text-subtle)' }} />
                  <span
                    onClick={() => handleNavigate(fullSubPath)}
                    style={{
                      fontSize: '11px',
                      fontWeight: idx === pathParts.length - 1 ? 700 : 500,
                      color: idx === pathParts.length - 1 ? 'var(--accent-cyan)' : 'var(--text-main)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {part}
                  </span>
                </React.Fragment>
              );
            })}
          </div>

          <button onClick={handleGoUp} className="btn-icon" style={{ width: 26, height: 26 }} title="Go up one folder level">
            <ArrowUp size={13} />
          </button>
          <button onClick={handleAddBookmark} className="btn-icon" style={{ width: 26, height: 26, color: 'var(--accent-amber)' }} title="Bookmark current folder">
            <Star size={13} />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search files and subfolders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>

          <button 
            onClick={() => setShowHidden(!showHidden)} 
            className="btn-icon" 
            style={{ width: 30, height: 30, color: showHidden ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
            title={showHidden ? 'Hide hidden files' : 'Show hidden files (.git, .env)'}
          >
            {showHidden ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>

        {/* Bookmarks Section */}
        {workspaceBookmarks.length > 0 && (
          <div style={{ padding: '8px 20px', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', alignSelf: 'center', marginRight: '4px' }}>Bookmarks:</span>
            {workspaceBookmarks.map((bkmk, idx) => (
              <button
                key={idx}
                onClick={() => handleNavigate(bkmk.path)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '999px',
                  border: '1px solid var(--border-color)',
                  background: currentPath === bkmk.path ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                  color: currentPath === bkmk.path ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                ⭐ {bkmk.name}
              </button>
            ))}
          </div>
        )}

        {/* Directory Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px', minHeight: '220px' }}>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              <RefreshCw size={18} className="animate-spin-slow" style={{ marginBottom: '8px', color: 'var(--accent-cyan)' }} />
              <div>Reading directory contents...</div>
            </div>
          ) : !validationStatus.valid ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--accent-rose)', fontSize: '12px', background: 'rgba(244, 63, 94, 0.08)', borderRadius: 'var(--radius-md)' }}>
              <Lock size={20} style={{ marginBottom: '6px' }} />
              <div style={{ fontWeight: 700 }}>Access Restricted / Invalid Directory</div>
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>{validationStatus.reason}</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No matching files or directories found.
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => item.isDirectory && handleNavigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '2px',
                  cursor: item.isDirectory ? 'pointer' : 'default',
                  background: 'transparent',
                  transition: 'all 0.15s ease'
                }}
                className="directory-item-row"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  {item.isDirectory ? (
                    <Folder size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                  ) : (
                    <FileText size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: '12px', fontWeight: item.isDirectory ? 600 : 400, color: item.isDirectory ? 'var(--text-main)' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px', color: 'var(--text-subtle)' }}>
                  {!item.isDirectory && <span>{item.size}</span>}
                  <span className="badge badge-purple" style={{ fontSize: '8px' }}>
                    {item.permissions || 'rwx'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Path Input & Set Action Footer */}
        <div style={{ padding: '14px 20px', background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>Target Path:</span>
            <input
              type="text"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNavigate(pathInput)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)'
              }}
            />
            <button onClick={() => handleNavigate(pathInput)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>
              Navigate
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={12} style={{ color: 'var(--accent-emerald)' }} />
              <span>Permissions: Level 1 Developer Authorized</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={onClose} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                Cancel
              </button>
              <button onClick={handleSelectAsWorkspace} className="btn-primary" style={{ padding: '6px 16px', fontSize: '12px' }}>
                {savedSuccess ? <Check size={14} /> : <FolderPlus size={14} />}
                <span>{savedSuccess ? 'Workspace Saved!' : 'Set as Active Workspace'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
