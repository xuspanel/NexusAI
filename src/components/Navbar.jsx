import React, { useState } from 'react';
import { 
  ChevronDown, 
  Settings, 
  Database, 
  Zap, 
  LayoutGrid, 
  MessageSquare, 
  Workflow, 
  Sun, 
  Moon, 
  Terminal, 
  Cpu,
  Shield,
  Layers,
  Folder,
  X
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { AGENT_MODES } from '../config/agentModes';
import SystemMonitor from './Telemetry/SystemMonitor';

export default function Navbar() {
  const { 
    availableModels,
    selectedModel, 
    setSelectedModel, 
    activeWorkspace, 
    setActiveWorkspace,
    theme, 
    setTheme, 
    setSettingsModalOpen,
    setVaultModalOpen,
    sidebarOpen,
    setSidebarOpen,
    permissionLevel,
    setPermissionsModalOpen,
    activeMode,
    setActiveMode,
    setModeConfigModalOpen,
    currentWorkspace,
    setWorkspaceModalOpen
  } = useChat();

  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const themeOptions = [
    { id: 'theme-dark', label: 'Dark Nebula', icon: Moon },
    { id: 'theme-cyber', label: 'Cyberpunk Neon', icon: Zap },
    { id: 'theme-oled', label: 'Midnight OLED', icon: Terminal },
    { id: 'theme-light', label: 'Solar Light', icon: Sun }
  ];

  const levelBadges = {
    0: { label: 'L0: RESTRICTED', color: 'badge-purple' },
    1: { label: 'L1: DEV', color: 'badge-cyan' },
    2: { label: 'L2: ADMIN', color: 'badge-emerald' },
    3: { label: 'L3: ROOT', color: 'badge-purple' }
  };

  const activeLevelBadge = levelBadges[permissionLevel] || levelBadges[1];
  const workspaceFolderName = currentWorkspace.split('/').pop() || 'Workspace';

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      position: 'relative',
      zIndex: 40
    }}>
      {/* Left: Brand, Workspace & Sidebar Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-icon"
          title="Toggle Navigation Sidebar"
        >
          <LayoutGrid size={18} />
        </button>

        {/* Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <img 
            src="/logo.jpg" 
            alt="NexusAI Logo" 
            className="brand-logo"
            style={{ 
              width: 32, 
              height: 32, 
              borderRadius: '9px', 
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)',
              objectFit: 'cover'
            }} 
          />
          <div className="hide-mobile">
            <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.3px' }} className="gradient-text brand-title">
              NexusAI
            </span>
          </div>
        </div>

        {/* Workspace Directory Trigger Button */}
        <button
          onClick={() => setWorkspaceModalOpen(true)}
          className="glass-card hide-mobile"
          style={{
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--accent-cyan)'
          }}
          title={`Active Workspace: ${currentWorkspace} (Ctrl+Shift+W)`}
        >
          <Folder size={13} />
          <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {workspaceFolderName}
          </span>
        </button>

        <div className="hide-mobile" style={{ height: '18px', width: '1px', background: 'var(--border-color)', margin: '0 2px' }} />

        {/* 6-Mode Agentic Selector Pill Bar */}
        <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-tertiary)', padding: '2px', borderRadius: '10px' }}>
          {Object.values(AGENT_MODES).map((mode) => {
            const isActive = activeMode.id === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '7px',
                  border: 'none',
                  background: isActive ? mode.color : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: isActive ? `0 0 10px ${mode.color}66` : 'none',
                  transition: 'all 0.15s ease'
                }}
                title={`${mode.name}: ${mode.tagline} (${mode.shortcut})`}
              >
                <span>{mode.shortLabel}</span>
              </button>
            );
          })}

          <button
            onClick={() => setModeConfigModalOpen(true)}
            style={{
              padding: '4px 6px',
              borderRadius: '7px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Configure Agent Modes Studio"
          >
            <Layers size={13} />
          </button>
        </div>
      </div>

      {/* Center: Model Selector Button */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
          className="glass-card model-selector-btn"
          style={{
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            background: 'var(--bg-surface)',
            borderRadius: '999px',
            border: '1px solid var(--border-color)'
          }}
        >
          <Cpu size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedModel.name}
          </span>
          <ChevronDown size={13} style={{ color: 'var(--text-muted)', transform: modelDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {/* Responsive Model Dropdown */}
        {modelDropdownOpen && (
          <div
            className="glass-panel fade-in"
            style={{
              position: window.innerWidth <= 640 ? 'fixed' : 'absolute',
              top: window.innerWidth <= 640 ? '50%' : 'calc(100% + 8px)',
              left: window.innerWidth <= 640 ? '50%' : '50%',
              transform: window.innerWidth <= 640 ? 'translate(-50%, -50%)' : 'translateX(-50%)',
              width: window.innerWidth <= 640 ? '90vw' : '360px',
              maxHeight: '380px',
              overflowY: 'auto',
              borderRadius: 'var(--radius-lg)',
              padding: '12px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px 8px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                Select Engine ({availableModels.length})
              </span>
              {window.innerWidth <= 640 && (
                <button onClick={() => setModelDropdownOpen(false)} className="btn-icon" style={{ width: 24, height: 24 }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {availableModels.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedModel(m);
                  setModelDropdownOpen(false);
                }}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  background: selectedModel.id === m.id ? 'var(--bg-hover)' : 'transparent',
                  border: selectedModel.id === m.id ? '1px solid var(--border-active)' : '1px solid transparent',
                  marginBottom: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>{m.name}</span>
                  <span className={`badge ${m.badgeColor}`} style={{ fontSize: '9px' }}>{m.latency}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.tagline}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Permission Status Badge, Telemetry, Theme & Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Permission Level Status Badge */}
        <button
          onClick={() => setPermissionsModalOpen(true)}
          className={`badge ${activeLevelBadge.color}`}
          style={{
            cursor: 'pointer',
            padding: '4px 10px',
            fontSize: '10px',
            border: '1px solid var(--border-active)',
            transition: 'all 0.15s ease'
          }}
          title="Configure Agent Privileges & Security Scopes (Ctrl+Shift+P)"
        >
          <Shield size={12} />
          <span>{activeLevelBadge.label}</span>
        </button>

        <SystemMonitor />

        {/* Theme Selector */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="btn-icon" 
            title="Switch Theme"
          >
            <Zap size={16} style={{ color: 'var(--accent-primary)' }} />
          </button>

          {themeDropdownOpen && (
            <div
              className="glass-panel fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '180px',
                borderRadius: 'var(--radius-md)',
                padding: '6px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 100
              }}
            >
              {themeOptions.map((t) => {
                const IconComponent = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setThemeDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: theme === t.id ? 'var(--bg-hover)' : 'transparent',
                      color: theme === t.id ? 'var(--accent-primary)' : 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <IconComponent size={14} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Settings Modal Button */}
        <button 
          onClick={() => setSettingsModalOpen(true)}
          className="btn-icon" 
          title="Engine Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
