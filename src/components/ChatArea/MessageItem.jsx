import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  ChevronDown, 
  ChevronRight, 
  Code, 
  Volume2, 
  ExternalLink,
  Brain,
  FolderPlus,
  FileText
} from 'lucide-react';
import { useChat, getApiUrl } from '../../context/ChatContext';
import FileOperationNotification from './FileOperationNotification';

export default function MessageItem({ message }) {
  const { setActiveArtifact, setCanvasOpen, isGenerating, currentWorkspace, chatConfig } = useChat();
  const [copied, setCopied] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);
  const [savedWorkspaceIdx, setSavedWorkspaceIdx] = useState(null);
  const [thoughtExpanded, setThoughtExpanded] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isAI = message.sender === 'ai';

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const handleSaveToWorkspace = async (code, language, headerFilename, idx) => {
    let inferredFilename = headerFilename ? headerFilename.trim() : '';

    if (!inferredFilename) {
      const firstLine = code.trim().split('\n')[0] || '';
      const commentMatch = firstLine.match(/(?:<!--|\/\/|#|\/\*)\s*([\w\.\-\/]+\.(?:html|js|jsx|ts|tsx|py|css|json|md|sql|sh|yml|yaml))\s*(?:-->|\*\/)?/i);
      if (commentMatch) {
        inferredFilename = commentMatch[1].trim();
      }
    }

    if (!inferredFilename) {
      if (language === 'html') inferredFilename = 'index.html';
      else if (language === 'css') inferredFilename = 'style.css';
      else if (language === 'javascript' || language === 'jsx') inferredFilename = 'index.js';
      else if (language === 'python') inferredFilename = 'main.py';
      else if (language === 'markdown' || language === 'md') inferredFilename = 'README.md';
      else if (language === 'json') inferredFilename = 'config.json';
      else inferredFilename = `file_${Date.now()}.${language || 'txt'}`;
    }

    const filename = prompt('Confirm filename to save in workspace:', inferredFilename);
    if (!filename) return;

    const targetPath = `${currentWorkspace}/${filename}`;

    try {
      const res = await fetch(getApiUrl('/api/vfs/file/write'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: targetPath, content: code })
      });
      const data = await res.json();
      if (data.success) {
        setSavedWorkspaceIdx(idx);
        setTimeout(() => setSavedWorkspaceIdx(null), 3000);
      } else {
        alert(`Failed to save file: ${data.error}`);
      }
    } catch (err) {
      alert(`VFS Save Error: ${err.message}`);
    }
  };

  const handleSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(message.content.replace(/```[\s\S]*?```/g, 'Code snippet'));
        utterance.onend = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    }
  };

  return (
    <div 
      className="message-item-container fade-in"
      style={{
        display: 'flex',
        gap: '12px',
        padding: '16px',
        background: isAI ? 'transparent' : 'var(--gradient-user-msg)',
        borderRadius: isAI ? '0' : 'var(--radius-lg)',
        borderBottom: isAI ? '1px solid var(--border-color)' : '1px solid var(--border-color)',
        marginBottom: '4px',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Avatar */}
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {isAI ? (
          <img 
            src="/ai_avatar.jpg" 
            alt="AI Avatar" 
            className="message-avatar"
            style={{ 
              width: 32, 
              height: 32, 
              borderRadius: '999px', 
              boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)',
              objectFit: 'cover'
            }} 
          />
        ) : (
          <div 
            className="message-avatar"
            style={{ 
              width: 32, 
              height: 32, 
              borderRadius: '999px', 
              background: 'var(--gradient-brand)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px'
            }}
          >
            U
          </div>
        )}
      </div>

      {/* Message Content Container */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {/* Header Line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>
            {isAI ? 'NexusAI Engine' : 'You'}
          </span>
          {isAI && (
            <span className="badge badge-purple" style={{ fontSize: '8px' }}>
              {message.model || 'Nexus 4.5'}
            </span>
          )}
          <span style={{ fontSize: '10px', color: 'var(--text-subtle)', marginLeft: 'auto' }}>
            {message.timestamp}
          </span>
        </div>

        {/* Thought Accordion */}
        {isAI && message.thought && (
          <div 
            style={{ 
              marginBottom: '10px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}
          >
            <button
              onClick={() => setThoughtExpanded(!thoughtExpanded)}
              style={{
                width: '100%',
                padding: '7px 10px',
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Brain size={13} className={isGenerating ? 'animate-spin-slow' : ''} />
                <span>Chain of Thought Reasoning</span>
              </div>
              {thoughtExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
            {thoughtExpanded && (
              <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', lineHeight: 1.4, overflowX: 'auto' }}>
                {message.thought}
              </div>
            )}
          </div>
        )}

        {/* Text Content */}
        <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-main)', wordBreak: 'break-word' }}>
          {renderFormattedMessage(message.content, handleCopyCode, copiedCodeIdx, setActiveArtifact, setCanvasOpen, handleSaveToWorkspace, savedWorkspaceIdx, chatConfig)}
        </div>

        {/* Artifact Pill */}
        {message.artifact && (
          <div 
            onClick={() => {
              setActiveArtifact(message.artifact);
              setCanvasOpen(true);
            }}
            className="glass-card"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              marginTop: '10px',
              cursor: 'pointer',
              borderColor: 'var(--border-active)',
              background: 'rgba(99, 102, 241, 0.1)',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            <Code size={15} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{message.artifact.title}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tap to view & run in live canvas</div>
            </div>
            <ExternalLink size={13} style={{ color: 'var(--accent-primary)', marginLeft: 'auto', flexShrink: 0 }} />
          </div>
        )}

        {/* Toolbar */}
        {isAI && message.content && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px' }}>
            <button 
              onClick={() => handleCopy(message.content)} 
              className="btn-icon" 
              style={{ width: 28, height: 28 }}
              title="Copy Message"
            >
              {copied ? <Check size={12} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={12} />}
            </button>
            <button 
              onClick={handleSpeech} 
              className="btn-icon" 
              style={{ width: 28, height: 28, color: isPlayingAudio ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
              title="Read Aloud"
            >
              <Volume2 size={12} />
            </button>
            <button 
              onClick={() => setFeedback('up')} 
              className="btn-icon" 
              style={{ width: 28, height: 28, color: feedback === 'up' ? 'var(--accent-emerald)' : 'var(--text-muted)' }}
              title="Good Response"
            >
              <ThumbsUp size={12} />
            </button>
            <button 
              onClick={() => setFeedback('down')} 
              className="btn-icon" 
              style={{ width: 28, height: 28, color: feedback === 'down' ? 'var(--accent-rose)' : 'var(--text-muted)' }}
              title="Poor Response"
            >
              <ThumbsDown size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function renderFormattedMessage(text, onCopyCode, copiedCodeIdx, setActiveArtifact, setCanvasOpen, onSaveToWorkspace, savedWorkspaceIdx, chatConfig) {
  if (!text) return null;

  const effectiveMode = chatConfig?.effectiveDisplayMode || chatConfig?.displayMode || 'workspace';

  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('```')) {
      const match = part.match(/```(\w+)?(?::([\w\.\-\/]+))?\n([\s\S]*?)```/);
      const language = match ? match[1] || 'code' : 'code';
      const headerFilename = match ? match[2] || '' : '';
      const codeContent = match ? match[3] : part.slice(3, -3);

      const fileLines = codeContent.trim() ? codeContent.trim().split('\n').length : 0;
      const fileBytes = new Blob([codeContent]).size;

      // WORKSPACE GENERATION MODE: Replace full raw code block text with sleek File Operation Notification Card
      if (effectiveMode === 'workspace' && (headerFilename || language !== 'code')) {
        return (
          <FileOperationNotification
            key={idx}
            notification={{
              type: 'create',
              filename: headerFilename || `${language}_file`,
              path: headerFilename || `${language}_file`,
              lines: fileLines,
              bytes: fileBytes,
              backupCreated: chatConfig?.createBackups,
              content: codeContent
            }}
          />
        );
      }

      // HYBRID OR CHAT MODE: Renders Code View + File Operation Notification Card
      return (
        <React.Fragment key={idx}>
          {effectiveMode === 'hybrid' && headerFilename && (
            <FileOperationNotification
              notification={{
                type: 'create',
                filename: headerFilename,
                path: headerFilename,
                lines: fileLines,
                bytes: fileBytes,
                backupCreated: chatConfig?.createBackups,
                content: codeContent
              }}
            />
          )}

          <div 
            style={{ 
              margin: '10px 0', 
              borderRadius: 'var(--radius-md)', 
              overflow: 'hidden', 
              border: '1px solid var(--border-color)',
              background: '#0d1117',
              maxWidth: '100%'
            }}
          >
            {/* Code Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '6px 12px', 
              background: '#161b22', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)' 
            }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#8b949e', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                {headerFilename ? `${language} • ${headerFilename}` : language}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {/* Save to Workspace Button */}
                <button
                  onClick={() => onSaveToWorkspace(codeContent, language, headerFilename, idx)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: savedWorkspaceIdx === idx ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                  title="Save file to active workspace directory"
                >
                  {savedWorkspaceIdx === idx ? <Check size={11} /> : <FolderPlus size={11} />}
                  {savedWorkspaceIdx === idx ? 'Saved!' : 'Save to Workspace'}
                </button>

                <button
                  onClick={() => {
                    setActiveArtifact({
                      id: 'artifact-' + idx,
                      type: language === 'jsx' || language === 'react' ? 'react' : 'code',
                      title: headerFilename || `${language.toUpperCase()} Snippet`,
                      language,
                      code: codeContent
                    });
                    setCanvasOpen(true);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <Code size={11} />
                  Canvas
                </button>
                <button
                  onClick={() => onCopyCode(codeContent, idx)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8b949e',
                    fontSize: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  {copiedCodeIdx === idx ? <Check size={11} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={11} />}
                  {copiedCodeIdx === idx ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Code View */}
            <pre style={{ 
              margin: 0, 
              padding: '12px 14px', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '12px', 
              lineHeight: 1.45, 
              color: '#e6edf3', 
              overflowX: 'auto',
              maxWidth: '100%'
            }}>
              <code>{codeContent}</code>
            </pre>
          </div>
        </React.Fragment>
      );
    }

    return (
      <div key={idx} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {part}
      </div>
    );
  });
}
