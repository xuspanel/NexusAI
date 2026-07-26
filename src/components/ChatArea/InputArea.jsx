import React, { useState, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Globe, 
  Brain, 
  Square, 
  X, 
  FileText, 
  Mic,
  Sparkles
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export default function InputArea() {
  const { 
    sendMessage, 
    isGenerating, 
    webSearchEnabled, 
    setWebSearchEnabled,
    deepThinkingEnabled,
    setDeepThinkingEnabled,
    enhancePrompt,
    selectedModel
  } = useChat();

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() && attachments.length === 0) return;
    if (isGenerating) return;

    sendMessage(input, attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map((file) => ({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleEnhance = async () => {
    if (!input.trim()) return;
    setIsEnhancing(true);
    const enhanced = await enhancePrompt(input);
    setInput(enhanced);
    setIsEnhancing(false);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setInput((prev) => (prev ? prev + ' ' : '') + 'Create a responsive React dashboard component.');
        setIsRecording(false);
      }, 2500);
    }
  };

  return (
    <div style={{
      maxWidth: '860px',
      margin: '0 auto',
      width: '100%',
      padding: '0 12px 14px',
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      {/* Outer Panel */}
      <div 
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-xl)',
          padding: '10px 12px',
          boxShadow: 'var(--shadow-lg)',
          borderColor: isGenerating ? 'var(--border-active)' : 'var(--border-color)',
          transition: 'all 0.25s ease'
        }}
      >
        {/* Attachment Files Pills */}
        {attachments.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
            {attachments.map((file, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <FileText size={12} style={{ color: 'var(--accent-cyan)' }} />
                <span>{file.name}</span>
                <button 
                  onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
          }}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${selectedModel.name}... (Shift + Enter for newline)`}
          rows={1}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-main)',
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            resize: 'none',
            maxHeight: '180px',
            lineHeight: 1.4
          }}
        />

        {/* Bottom Toolbar: Feature Toggles & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', flexWrap: 'wrap', gap: '8px' }}>
          {/* Left Toggles */}
          <div className="input-toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              style={{ display: 'none' }} 
              multiple 
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-icon"
              title="Attach document or image"
              style={{ width: 30, height: 30 }}
            >
              <Paperclip size={14} />
            </button>

            {/* Web Search Toggle Pill */}
            <button
              type="button"
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              style={{
                padding: '3px 8px',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: webSearchEnabled ? 'rgba(6, 182, 212, 0.4)' : 'var(--border-color)',
                background: webSearchEnabled ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                color: webSearchEnabled ? 'var(--accent-cyan)' : 'var(--text-muted)',
                fontSize: '10px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Globe size={12} />
              <span>Search</span>
            </button>

            {/* Deep Thinking Toggle Pill */}
            <button
              type="button"
              onClick={() => setDeepThinkingEnabled(!deepThinkingEnabled)}
              style={{
                padding: '3px 8px',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: deepThinkingEnabled ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)',
                background: deepThinkingEnabled ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: deepThinkingEnabled ? 'var(--accent-emerald)' : 'var(--text-muted)',
                fontSize: '10px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Brain size={12} />
              <span>Deep Think</span>
            </button>

            {/* Prompt Supercharger */}
            {input.trim() && (
              <button
                type="button"
                onClick={handleEnhance}
                disabled={isEnhancing}
                style={{
                  padding: '3px 8px',
                  borderRadius: '999px',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: 'var(--accent-secondary)',
                  fontSize: '10px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={12} className={isEnhancing ? 'animate-spin-slow' : ''} />
                <span>{isEnhancing ? '...' : 'Enhance'}</span>
              </button>
            )}
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
            <button
              type="button"
              onClick={toggleRecording}
              className="btn-icon"
              style={{
                width: 30,
                height: 30,
                color: isRecording ? 'var(--accent-rose)' : 'var(--text-muted)',
                background: isRecording ? 'rgba(244, 63, 94, 0.15)' : 'transparent'
              }}
              title="Voice Input"
            >
              <Mic size={14} className={isRecording ? 'animate-pulse' : ''} />
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={(!input.trim() && attachments.length === 0) || isGenerating}
              className="btn-primary"
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                opacity: (!input.trim() && attachments.length === 0) && !isGenerating ? 0.4 : 1,
                cursor: (!input.trim() && attachments.length === 0) && !isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              {isGenerating ? <Square size={13} /> : <Send size={13} />}
              <span>{isGenerating ? 'Stop' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
