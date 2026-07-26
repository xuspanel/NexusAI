import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Check, 
  Sliders, 
  Workflow, 
  Shield, 
  Sparkles,
  Play
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { AGENT_MODES } from '../../config/agentModes';

export default function ModeConfigModal({ isOpen, onClose }) {
  const { activeMode, setActiveMode } = useChat();
  const [selectedModeId, setSelectedModeId] = useState(activeMode.id);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentModeConfig = AGENT_MODES[selectedModeId.toUpperCase()] || AGENT_MODES.PLAN;

  const handleApplyMode = () => {
    setActiveMode(currentModeConfig);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 210,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div className="glass-panel modal-dialog fade-in" style={{
        width: '720px',
        maxWidth: '96vw',
        maxHeight: '90vh',
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
            <Layers size={22} style={{ color: currentModeConfig.color }} />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Agent Mode Studio Configuration</h2>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Configure active model behaviors, AI hyperparameters & automated pipelines</span>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '6px', marginBottom: '16px' }}>
          {Object.values(AGENT_MODES).map((mode) => {
            const isSelected = selectedModeId === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedModeId(mode.id)}
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? `1px solid ${mode.color}` : '1px solid var(--border-color)',
                  background: isSelected ? `${mode.color}22` : 'var(--bg-tertiary)',
                  color: isSelected ? mode.color : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{mode.shortLabel}</span>
                <span style={{ fontSize: '9px', opacity: 0.8 }}>{mode.shortcut}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Mode Config Panel */}
        <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: currentModeConfig.color }}>
                {currentModeConfig.name}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{currentModeConfig.tagline}</span>
            </div>
            <span className="badge badge-purple" style={{ fontSize: '10px' }}>
              Temp: {currentModeConfig.temperature}
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '16px' }}>
            {currentModeConfig.description}
          </p>

          {/* System Prompt Box */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-subtle)', uppercase: 'true', display: 'block', marginBottom: '4px' }}>
              Mode System Persona Instructions
            </label>
            <textarea
              readOnly
              value={currentModeConfig.systemPrompt}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                resize: 'none'
              }}
            />
          </div>

          {/* Capabilities List */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-subtle)', uppercase: 'true', marginBottom: '8px' }}>
              Active Mode Capabilities & Tool Access
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '6px' }}>
              {currentModeConfig.capabilities.map((cap, idx) => (
                <div key={idx} style={{ padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '11px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={12} style={{ color: currentModeConfig.color }} />
                  {cap}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
            Tip: Use <strong style={{ color: 'var(--text-main)' }}>Ctrl+1..6</strong> to switch modes instantly.
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleApplyMode} className="btn-primary" style={{ background: currentModeConfig.color }}>
              {savedSuccess ? <Check size={14} /> : <Play size={14} />}
              <span>{savedSuccess ? 'Mode Switched!' : `Activate ${currentModeConfig.shortLabel} Mode`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
