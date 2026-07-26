import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  Save, 
  Check, 
  FolderPlus, 
  MessageSquare, 
  Layers, 
  Bell, 
  RotateCcw, 
  ShieldCheck, 
  Volume2, 
  FolderTree,
  FileCode,
  Sparkles
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export default function SettingsModal() {
  const { 
    settingsModalOpen, 
    setSettingsModalOpen,
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    systemPrompt,
    setSystemPrompt,
    currentWorkspace,
    chatConfig,
    updateChatConfig,
    resetChatConfigToDefaults
  } = useChat();

  const [activeTab, setActiveTab] = useState('chat_config'); // Default to newly created tab
  const [apiKey, setApiKey] = useState('sk-nexus-38910482019481928410');
  const [customHost, setCustomHost] = useState('http://localhost:11434');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!settingsModalOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setSettingsModalOpen(false);
    }, 1200);
  };

  const agentModesList = [
    { id: 'PLAN', label: 'PLAN Mode (Ctrl+1)', color: 'var(--accent-blue)' },
    { id: 'BUILD', label: 'BUILD Mode (Ctrl+2)', color: 'var(--accent-emerald)' },
    { id: 'REVIEW', label: 'REVIEW Mode (Ctrl+3)', color: 'var(--accent-amber)' },
    { id: 'TEST', label: 'TEST Mode (Ctrl+4)', color: 'var(--accent-purple)' },
    { id: 'DEPLOY', label: 'DEPLOY Mode (Ctrl+5)', color: 'var(--accent-rose)' },
    { id: 'LEARN', label: 'LEARN Mode (Ctrl+6)', color: 'var(--accent-cyan)' }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 150,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px'
    }}>
      <div 
        className="glass-panel modal-dialog fade-in" 
        role="dialog"
        aria-labelledby="settings-modal-title"
        style={{
          width: '640px',
          maxWidth: '95vw',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          border: '1px solid var(--border-active)',
          boxSizing: 'border-box'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              display: 'flex'
            }}>
              <Sliders size={18} />
            </div>
            <div>
              <h2 id="settings-modal-title" style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Engine Configuration & Keys
              </h2>
              <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                Manage LLM hyper-parameters, workspace file generation, & credentials
              </span>
            </div>
          </div>
          <button 
            onClick={() => setSettingsModalOpen(false)} 
            className="btn-icon"
            aria-label="Close configuration modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          borderBottom: '1px solid var(--border-color)', 
          marginBottom: '20px', 
          paddingBottom: '8px', 
          overflowX: 'auto' 
        }}>
          <button
            onClick={() => setActiveTab('chat_config')}
            role="tab"
            aria-selected={activeTab === 'chat_config'}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'chat_config' ? 'var(--bg-tertiary)' : 'transparent',
              color: activeTab === 'chat_config' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderBottom: activeTab === 'chat_config' ? '2px solid var(--accent-cyan)' : '2px solid transparent'
            }}
          >
            <FolderPlus size={14} />
            <span>Chat Configurations</span>
            <span className="badge badge-cyan" style={{ fontSize: '8px', padding: '1px 5px' }}>NEW</span>
          </button>

          <button
            onClick={() => setActiveTab('engine')}
            role="tab"
            aria-selected={activeTab === 'engine'}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'engine' ? 'var(--bg-tertiary)' : 'transparent',
              color: activeTab === 'engine' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              borderBottom: activeTab === 'engine' ? '2px solid var(--accent-primary)' : '2px solid transparent'
            }}
          >
            Hyperparameters
          </button>

          <button
            onClick={() => setActiveTab('keys')}
            role="tab"
            aria-selected={activeTab === 'keys'}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'keys' ? 'var(--bg-tertiary)' : 'transparent',
              color: activeTab === 'keys' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              borderBottom: activeTab === 'keys' ? '2px solid var(--accent-primary)' : '2px solid transparent'
            }}
          >
            API Credentials
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            role="tab"
            aria-selected={activeTab === 'custom'}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'custom' ? 'var(--bg-tertiary)' : 'transparent',
              color: activeTab === 'custom' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              borderBottom: activeTab === 'custom' ? '2px solid var(--accent-primary)' : '2px solid transparent'
            }}
          >
            Ollama REST
          </button>
        </div>

        {/* Tab 1: Chat Configurations (Workspace Generation & Display Modes) */}
        {activeTab === 'chat_config' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Active Workspace Banner */}
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px'
            }}>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-subtle)', display: 'block' }}>
                  Target Workspace Root Path
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  📁 {currentWorkspace}
                </span>
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '9px' }}>Disk R/W Active</span>
            </div>

            {/* Code Display Mode Radio Group */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
                Code Generation & Display Mode
              </label>
              <div 
                role="radiogroup" 
                aria-label="Code display mode options"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}
              >
                {/* Mode 1: Workspace Generation */}
                <div 
                  onClick={() => updateChatConfig({ displayMode: 'workspace' })}
                  role="radio"
                  aria-checked={chatConfig.displayMode === 'workspace'}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && updateChatConfig({ displayMode: 'workspace' })}
                  className="glass-card"
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: chatConfig.displayMode === 'workspace' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                    background: chatConfig.displayMode === 'workspace' ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-tertiary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <FolderPlus size={16} style={{ color: 'var(--accent-cyan)' }} />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>Workspace</span>
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                    Generates & writes files directly to disk. Replaces raw code blocks with sleek notifications to prevent chat memory bloat.
                  </p>
                </div>

                {/* Mode 2: Chat Mode */}
                <div 
                  onClick={() => updateChatConfig({ displayMode: 'chat' })}
                  role="radio"
                  aria-checked={chatConfig.displayMode === 'chat'}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && updateChatConfig({ displayMode: 'chat' })}
                  className="glass-card"
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: chatConfig.displayMode === 'chat' ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                    background: chatConfig.displayMode === 'chat' ? 'rgba(168, 85, 247, 0.1)' : 'var(--bg-tertiary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <MessageSquare size={16} style={{ color: 'var(--accent-purple)' }} />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>Chat Output</span>
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                    Displays full code blocks directly in chat history without automatic disk file creation.
                  </p>
                </div>

                {/* Mode 3: Hybrid Mode */}
                <div 
                  onClick={() => updateChatConfig({ displayMode: 'hybrid' })}
                  role="radio"
                  aria-checked={chatConfig.displayMode === 'hybrid'}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && updateChatConfig({ displayMode: 'hybrid' })}
                  className="glass-card"
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: chatConfig.displayMode === 'hybrid' ? '2px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                    background: chatConfig.displayMode === 'hybrid' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Layers size={16} style={{ color: 'var(--accent-emerald)' }} />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>Hybrid Mode</span>
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                    Renders full code blocks in chat history AND automatically writes files to workspace disk.
                  </p>
                </div>
              </div>
            </div>

            {/* Notification & Safety Toggles */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: '10px' }}>
                Notification & File Writing Safeguards
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'var(--bg-tertiary)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: 'var(--text-main)'
                }}>
                  <input
                    type="checkbox"
                    checked={chatConfig.showNotifications}
                    onChange={(e) => updateChatConfig({ showNotifications: e.target.checked })}
                    style={{ accentColor: 'var(--accent-cyan)', width: 16, height: 16 }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>Show File Notifications</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>Render file cards in chat log</div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'var(--bg-tertiary)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: 'var(--text-main)'
                }}>
                  <input
                    type="checkbox"
                    checked={chatConfig.createBackups}
                    onChange={(e) => updateChatConfig({ createBackups: e.target.checked })}
                    style={{ accentColor: 'var(--accent-cyan)', width: 16, height: 16 }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>Safety Backups (.bak)</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>Backup before overwriting file</div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'var(--bg-tertiary)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: 'var(--text-main)'
                }}>
                  <input
                    type="checkbox"
                    checked={chatConfig.autoExpandTree}
                    onChange={(e) => updateChatConfig({ autoExpandTree: e.target.checked })}
                    style={{ accentColor: 'var(--accent-cyan)', width: 16, height: 16 }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>Auto-Expand Tree</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>Expand tree on file write</div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'var(--bg-tertiary)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: 'var(--text-main)'
                }}>
                  <input
                    type="checkbox"
                    checked={chatConfig.soundEffects}
                    onChange={(e) => updateChatConfig({ soundEffects: e.target.checked })}
                    style={{ accentColor: 'var(--accent-cyan)', width: 16, height: 16 }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>Audio Cues</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>Play tone on file creation</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Per-Agent Mode Display Overrides */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
                Per-Agentic Mode Display Overrides
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                background: 'var(--bg-tertiary)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                {agentModesList.map((mode) => (
                  <div key={mode.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ fontWeight: 700, color: mode.color }}>{mode.label}</span>
                    <select
                      value={chatConfig.perModeOverrides?.[mode.id] || chatConfig.displayMode}
                      onChange={(e) => {
                        const newOverrides = { ...chatConfig.perModeOverrides, [mode.id]: e.target.value };
                        updateChatConfig({ perModeOverrides: newOverrides });
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontSize: '10px',
                        outline: 'none',
                        fontWeight: 600
                      }}
                    >
                      <option value="workspace">Workspace</option>
                      <option value="chat">Chat</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Reset Defaults Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={resetChatConfigToDefaults}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-rose)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RotateCcw size={12} />
                <span>Reset Chat Config to Defaults</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Hyperparameters */}
        {activeTab === 'engine' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                System Persona Instructions
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                <span>Temperature (Creativity)</span>
                <span style={{ color: 'var(--accent-cyan)' }}>{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                <span>Max Output Tokens</span>
                <span style={{ color: 'var(--accent-cyan)' }}>{maxTokens}</span>
              </div>
              <input
                type="range"
                min="1024"
                max="32768"
                step="1024"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
            </div>
          </div>
        )}

        {/* Tab 3: API Keys */}
        {activeTab === 'keys' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                Nexus Cloud / OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '10px', color: 'var(--text-subtle)', marginTop: '4px', display: 'block' }}>
                Keys are stored locally in your browser session.
              </span>
            </div>
          </div>
        )}

        {/* Tab 4: Custom Endpoint */}
        {activeTab === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                Local Ollama Host Endpoint
              </label>
              <input
                type="text"
                value={customHost}
                onChange={(e) => setCustomHost(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        )}

        {/* Save & Action Buttons */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={() => setSettingsModalOpen(false)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            {savedSuccess ? <Check size={14} /> : <Save size={14} />}
            <span>{savedSuccess ? 'Saved Config!' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
