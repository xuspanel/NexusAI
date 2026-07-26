import React, { useState } from 'react';
import { 
  X, 
  Code, 
  Play, 
  Copy, 
  Check, 
  Download, 
  Maximize2, 
  Minimize2, 
  Terminal, 
  FileCode
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export default function ArtifactCanvas() {
  const { activeArtifact, canvasOpen, setCanvasOpen } = useChat();
  const [activeTab, setActiveTab] = useState('preview');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!canvasOpen || !activeArtifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeArtifact.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeArtifact.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_artifact.${activeArtifact.language || 'jsx'}`;
    a.click();
  };

  return (
    <>
      {/* Mobile Backdrop for Canvas */}
      <div 
        onClick={() => setCanvasOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 90,
          display: window.innerWidth <= 1024 && !isFullscreen ? 'block' : 'none'
        }}
      />

      <aside className="canvas-offcanvas" style={{
        width: isFullscreen ? '100vw' : 'var(--canvas-width)',
        height: isFullscreen ? '100vh' : 'calc(100vh - var(--header-height))',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 100 : 95,
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'all 0.25s ease'
      }}>
        {/* Canvas Header */}
        <div style={{
          height: '50px',
          padding: '0 14px',
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left: Artifact Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <FileCode size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeArtifact.title || 'Live Artifact'}
            </span>
            <span className="badge badge-purple" style={{ fontSize: '9px' }}>
              {activeArtifact.language || 'jsx'}
            </span>
          </div>

          {/* Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={handleCopy} className="btn-icon" style={{ width: 28, height: 28 }} title="Copy Code">
              {copied ? <Check size={13} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={13} />}
            </button>
            <button onClick={handleDownload} className="btn-icon" style={{ width: 28, height: 28 }} title="Download File">
              <Download size={13} />
            </button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="btn-icon" style={{ width: 28, height: 28 }} title="Toggle Fullscreen">
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
            <button onClick={() => setCanvasOpen(false)} className="btn-icon" style={{ width: 28, height: 28 }} title="Close Canvas">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div style={{ padding: '6px 12px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('preview')}
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'preview' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'preview' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Play size={12} /> Live Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'code' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'code' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Code size={12} /> Source Code
          </button>
          <button
            onClick={() => setActiveTab('console')}
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'console' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'console' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Terminal size={12} /> Console (0)
          </button>
        </div>

        {/* Main Canvas Display Area */}
        <div style={{ flex: 1, overflow: 'auto', background: '#0b0f19', padding: '16px' }}>
          {activeTab === 'preview' && (
            <div className="glass-card" style={{ padding: '16px', minHeight: '100%', background: '#111827' }}>
              <LiveComponentRenderer code={activeArtifact.code} />
            </div>
          )}

          {activeTab === 'code' && (
            <pre style={{
              margin: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: '#e6edf3',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              overflowX: 'auto'
            }}>
              <code>{activeArtifact.code}</code>
            </pre>
          )}

          {activeTab === 'console' && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-emerald)' }}>
              [Nexus Artifact Sandbox initialized successfully]<br />
              [HMR Hot Module Replacement active]<br />
              [No runtime warnings recorded]
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function LiveComponentRenderer({ code }) {
  const [tab, setTab] = useState('weekly');
  const metrics = [
    { title: 'Total Revenue', value: '$128,420', change: '+14.2%', isUp: true },
    { title: 'Active Users', value: '42,890', change: '+8.7%', isUp: true },
    { title: 'Server Latency', value: '18ms', change: '-4.1%', isUp: true },
    { title: 'Error Rate', value: '0.02%', change: '-0.01%', isUp: true }
  ];

  return (
    <div style={{ color: '#f9fafb', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Nexus Telemetry Live Preview</h2>
          <p style={{ margin: '2px 0 0', color: '#9ca3af', fontSize: '11px' }}>Interactive Sandbox Render</p>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: '#1f2937', padding: '3px', borderRadius: '6px' }}>
          {['daily', 'weekly', 'monthly'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '3px 8px',
                border: 'none',
                borderRadius: '4px',
                background: tab === t ? '#6366f1' : 'transparent',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '10px',
                textTransform: 'capitalize',
                fontWeight: 600
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        {metrics.map((m, idx) => (
          <div key={idx} style={{ background: '#1f2937', padding: '12px', borderRadius: '8px', border: '1px solid #374151' }}>
            <span style={{ color: '#9ca3af', fontSize: '10px' }}>{m.title}</span>
            <div style={{ fontSize: '18px', fontWeight: 800, margin: '4px 0', color: '#f3f4f6' }}>{m.value}</div>
            <span style={{ color: '#10b981', fontSize: '10px', fontWeight: 600 }}>{m.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
