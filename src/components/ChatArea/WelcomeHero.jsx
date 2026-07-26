import React from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  ArrowRight
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { MOCK_STARTER_PROMPTS } from '../../services/apiService';

export default function WelcomeHero() {
  const { sendMessage, selectedModel } = useChat();

  return (
    <div 
      className="welcome-hero-container"
      style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '36px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}
    >
      {/* Animated Floating Logo Orb */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <div 
          style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '50%',
            background: 'var(--gradient-brand)',
            opacity: 0.35,
            filter: 'blur(18px)'
          }} 
        />
        <img
          src="/logo.jpg"
          alt="NexusAI Orb"
          className="animate-float"
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            position: 'relative',
            zIndex: 2,
            boxShadow: 'var(--shadow-neon)',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Greeting Title */}
      <h1 className="welcome-title" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.6px', lineHeight: 1.25 }}>
        What would you like to <span className="gradient-text">build today?</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', maxWidth: '560px', lineHeight: 1.5, margin: '0 0 28px' }}>
        Powered by <strong style={{ color: 'var(--text-main)' }}>{selectedModel.name}</strong>. Ready to craft high-performance code, analyze complex architectures, or ingest knowledge documents.
      </p>

      {/* Starter Prompts Grid */}
      <div 
        className="welcome-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px',
          width: '100%',
          marginBottom: '28px'
        }}
      >
        {MOCK_STARTER_PROMPTS.map((item, idx) => (
          <div
            key={idx}
            onClick={() => sendMessage(item.prompt)}
            className="glass-card"
            style={{
              padding: '14px 16px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '9px' }}>{item.category}</span>
                <Sparkles size={13} style={{ color: 'var(--accent-secondary)' }} />
              </div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-main)' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {item.prompt}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '10px' }}>
              Run Prompt <ArrowRight size={11} />
            </div>
          </div>
        ))}
      </div>

      {/* File Upload Dropzone Badge */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          padding: '14px 18px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px dashed var(--border-active)',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <UploadCloud size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Drop files or paste code snippets</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Supports PDF, TXT, JSX, Python, CSV, and Wireframes</div>
          </div>
        </div>
        <button className="btn-secondary" style={{ fontSize: '11px', padding: '6px 12px' }}>Browse Files</button>
      </div>
    </div>
  );
}
