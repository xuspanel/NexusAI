import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../context/ChatContext';
import { 
  Shield, 
  X, 
  Check, 
  AlertTriangle, 
  Terminal, 
  FolderTree, 
  Cpu, 
  Globe, 
  Workflow, 
  FileText, 
  Download, 
  Lock, 
  Unlock,
  Key,
  Layers,
  Activity
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export default function PermissionsModal({ isOpen, onClose }) {
  const { permissionLevel, setPermissionLevel } = useChat();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'filesystem' | 'commands' | 'system' | 'network' | 'agentic' | 'audit' | 'presets'
  const [profile, setProfile] = useState({
    activeLevel: permissionLevel || 1,
    securityScore: 88,
    pathWhitelists: ['/workspace/**', '/tmp/**', '/home/ahmed_alsaleh/Dev/NexusAI/**'],
    pathBlacklists: ['/etc/shadow', '/etc/sudoers', '/root/**'],
    commandWhitelists: ['npm', 'npx', 'git', 'node', 'python3', 'pip', 'gcc', 'make', 'ls', 'cp', 'mv', 'rm', 'mkdir'],
    agenticCapabilities: {
      autonomousMode: true,
      multiStepPlanning: true,
      selfCorrection: true,
      maxCorrectionRetries: 5
    }
  });

  const [auditLogs, setAuditLogs] = useState([]);
  const [filterDecision, setFilterDecision] = useState('ALL');

  useEffect(() => {
    if (!isOpen) return;

    const fetchAudit = async () => {
      try {
        const res = await fetch(getApiUrl('/api/permissions/audit-logs'));
        const data = await res.json();
        if (data.success) {
          setAuditLogs(data.auditLogs);
        }
      } catch (err) {
        console.warn('Audit logs fetch warning:', err.message);
      }
    };

    fetchAudit();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLevelChange = async (level) => {
    setPermissionLevel(level);
    setProfile({ ...profile, activeLevel: level });
    try {
      await fetch(getApiUrl('/api/permissions/profile'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeLevel: level })
      });
    } catch {
      // quiet fallback
    }
  };

  const levelBadges = [
    { level: 0, label: 'Level 0: Restricted', color: 'badge-purple', desc: 'Read-only access, zero CLI execution' },
    { level: 1, label: 'Level 1: Developer', color: 'badge-cyan', desc: 'Full /workspace R/W, dev tools (npm, git, python)' },
    { level: 2, label: 'Level 2: Administrator', color: 'badge-emerald', desc: 'System service control, dnf/apt, port binding' },
    { level: 3, label: 'Level 3: Superuser', color: 'badge-purple', desc: 'Unrestricted system access' }
  ];

  const filteredLogs = filterDecision === 'ALL' 
    ? auditLogs 
    : auditLogs.filter((l) => l.decision === filterDecision);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div className="glass-panel modal-dialog fade-in" style={{
        width: '820px',
        maxWidth: '96vw',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-active)',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={22} style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Agentic Permission & Privilege Control</h2>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>4-Tier Zero-Trust Security Engine (<span style={{ color: 'var(--accent-emerald)' }}>&lt;5ms Evaluation</span>)</span>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* 8-Tab Navigation Bar */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px', paddingBottom: '6px', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'filesystem', label: 'File System', icon: FolderTree },
            { id: 'commands', label: 'Commands (200+)', icon: Terminal },
            { id: 'system', label: 'System & Resources', icon: Cpu },
            { id: 'network', label: 'Network', icon: Globe },
            { id: 'agentic', label: 'Agentic Modes', icon: Workflow },
            { id: 'audit', label: 'Audit Logs', icon: FileText },
            { id: 'presets', label: 'Profiles & Presets', icon: Layers }
          ].map((t) => {
            const IconC = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: activeTab === t.id ? 'var(--bg-surface)' : 'transparent',
                  color: activeTab === t.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <IconC size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Tab Content Container */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Security Score Badge */}
              <div className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SECURITY RATING</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {profile.securityScore}/100 <span className="badge badge-emerald">EXCELLENT</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Least-privilege isolation active on /workspace</span>
                </div>
                <Shield size={42} style={{ color: 'var(--accent-emerald)', opacity: 0.8 }} />
              </div>

              {/* 4-Tier Selector Grid */}
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-subtle)', uppercase: 'true' }}>
                Select Active Permission Level (0 - 3)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                {levelBadges.map((lb) => {
                  const isActive = profile.activeLevel === lb.level;
                  return (
                    <div
                      key={lb.level}
                      onClick={() => handleLevelChange(lb.level)}
                      className="glass-card"
                      style={{
                        padding: '14px',
                        cursor: 'pointer',
                        borderColor: isActive ? 'var(--border-active)' : 'var(--border-color)',
                        background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{lb.label}</span>
                        {isActive && <Check size={16} style={{ color: 'var(--accent-emerald)' }} />}
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lb.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FILE SYSTEM */}
          {activeTab === 'filesystem' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  Path Whitelists (Glob Patterns Allowed)
                </label>
                {profile.pathWhitelists.map((pathStr, idx) => (
                  <div key={idx} style={{ padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontFamily: 'var(--font-mono)', marginBottom: '4px', border: '1px solid var(--border-color)' }}>
                    {pathStr}
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  System Blacklists (Always Denied)
                </label>
                {profile.pathBlacklists.map((pathStr, idx) => (
                  <div key={idx} style={{ padding: '6px 10px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontFamily: 'var(--font-mono)', marginBottom: '4px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                    {pathStr}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COMMANDS */}
          {activeTab === 'commands' && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                Whitelisted CLI Toolchain ({profile.commandWhitelists.length} Commands Active)
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {profile.commandWhitelists.map((cmd, idx) => (
                  <span key={idx} className="badge badge-cyan" style={{ fontSize: '11px', padding: '4px 10px' }}>
                    <Terminal size={11} /> {cmd}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: AGENTIC CAPABILITIES */}
          {activeTab === 'agentic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Multi-Step Autonomous Planning</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Allows AI agent to chain tools and execute multi-step projects</div>
                </div>
                <span className="badge badge-emerald">ENABLED</span>
              </div>
              <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Self-Correction & Automated Retries</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automatically fixes syntax or linter errors during build</div>
                </div>
                <span className="badge badge-emerald">ENABLED (Max 5)</span>
              </div>
            </div>
          )}

          {/* TAB 7: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Real-Time Permission Audit Trail</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['ALL', 'ALLOWED', 'DENIED'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setFilterDecision(d)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: filterDecision === d ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                        color: '#fff',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {filteredLogs.map((log) => (
                <div key={log.id} style={{ padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '4px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>[{log.category.toUpperCase()}]</span> {log.action_type || log.target_resource}
                    {log.reason && <span style={{ color: 'var(--text-subtle)', marginLeft: '6px' }}>({log.reason})</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-subtle)' }}>{log.execution_time_ms}ms</span>
                    <span className={log.decision === 'ALLOWED' ? 'badge badge-emerald' : 'badge badge-purple'}>
                      {log.decision}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 8: PRESETS */}
          {activeTab === 'presets' && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                Security Profile Presets
              </div>
              <div className="glass-card" style={{ padding: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Standard Full-Stack Developer Profile</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Level 1 Developer with npm, git, and python whitelisted</div>
                </div>
                <button className="btn-secondary" style={{ fontSize: '11px' }}>Apply Profile</button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={onClose} className="btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
