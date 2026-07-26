import React, { useEffect } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import WelcomeHero from './components/ChatArea/WelcomeHero';
import VirtualMessageList from './components/ChatArea/VirtualMessageList';
import InputArea from './components/ChatArea/InputArea';
import ArtifactCanvas from './components/Canvas/ArtifactCanvas';
import SettingsModal from './components/Modals/SettingsModal';
import KnowledgeVaultModal from './components/Modals/KnowledgeVaultModal';
import PermissionsModal from './components/Modals/PermissionsModal';
import ModeConfigModal from './components/Modals/ModeConfigModal';
import WorkspaceModal from './components/Modals/WorkspaceModal';
import WorkflowBuilder from './components/Workflows/WorkflowBuilder';
import ParticleBackground from './components/Background/ParticleBackground';

function AppContent() {
  const { 
    activeWorkspace, 
    activeThread, 
    permissionsModalOpen, 
    setPermissionsModalOpen,
    activeMode,
    modeConfigModalOpen,
    setModeConfigModalOpen,
    workspaceModalOpen,
    setWorkspaceModalOpen,
    currentWorkspace
  } = useChat();

  const messages = activeThread ? activeThread.messages : [];

  // Global Keyboard Shortcuts: Ctrl+Shift+P (Permissions), Ctrl+Shift+W (Workspace)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          setPermissionsModalOpen(true);
        }
        if (e.key.toLowerCase() === 'w') {
          e.preventDefault();
          setWorkspaceModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPermissionsModalOpen, setWorkspaceModalOpen]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Background Canvas Particles */}
      <ParticleBackground />

      {/* Main Header */}
      <Navbar />

      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - var(--header-height))', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        <Sidebar />

        {activeWorkspace === 'workflow' ? (
          <WorkflowBuilder />
        ) : (
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, background: 'transparent', position: 'relative' }}>
            {/* Active Mode & Workspace Banner */}
            <div style={{
              height: '46px',
              padding: '0 16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                {/* Active Mode Tag */}
                <div 
                  onClick={() => setModeConfigModalOpen(true)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: `${activeMode.color}22`,
                    border: `1px solid ${activeMode.color}`,
                    color: activeMode.color,
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Click to view & configure mode persona & tools"
                >
                  <span>{activeMode.name}</span>
                </div>

                {/* Workspace Scope Indicator */}
                <div 
                  onClick={() => setWorkspaceModalOpen(true)}
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)'
                  }}
                  title="Click to change active workspace directory (Ctrl+Shift+W)"
                >
                  [{currentWorkspace}]
                </div>

                {messages.length > 0 && (
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeThread?.title}
                  </span>
                )}
              </div>

              {messages.length > 0 && (
                <span className="badge badge-purple" style={{ fontSize: '9px' }}>
                  {messages.length} messages
                </span>
              )}
            </div>

            {/* Virtualized Messages Container / Welcome View */}
            {messages.length === 0 ? (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <WelcomeHero />
              </div>
            ) : (
              <VirtualMessageList messages={messages} />
            )}

            {/* Sticky Prompt Input Area */}
            <InputArea />
          </main>
        )}

        {/* Right Split-Screen Artifact Canvas */}
        <ArtifactCanvas />
      </div>

      {/* Modals */}
      <SettingsModal />
      <KnowledgeVaultModal />
      <PermissionsModal isOpen={permissionsModalOpen} onClose={() => setPermissionsModalOpen(false)} />
      <ModeConfigModal isOpen={modeConfigModalOpen} onClose={() => setModeConfigModalOpen(false)} />
      <WorkspaceModal isOpen={workspaceModalOpen} onClose={() => setWorkspaceModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}
