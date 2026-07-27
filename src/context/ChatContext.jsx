import React, { createContext, useContext, useState, useEffect } from 'react';
import { AI_MODELS as DEFAULT_MODELS, enhancePrompt } from '../services/apiService';
import { useOptimizedStream } from '../hooks/useOptimizedStream';
import { AGENT_MODES } from '../config/agentModes';

const ChatContext = createContext();

export function getApiUrl(endpoint) {
  if (typeof window === 'undefined') return `http://localhost:3005${endpoint}`;
  return endpoint;
}

export async function fetchWithAuth(url, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nexusai_auth_token') : null;
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  return fetch(getApiUrl(url), { ...options, headers });
}

export const DEFAULT_CHAT_CONFIG = {
  displayMode: 'workspace', // 'chat' | 'workspace' | 'hybrid'
  showNotifications: true,
  autoExpandTree: true,
  createBackups: true,
  soundEffects: false,
  perModeOverrides: {
    PLAN: 'chat',
    BUILD: 'workspace',
    REVIEW: 'chat',
    TEST: 'workspace',
    DEPLOY: 'workspace',
    LEARN: 'chat'
  }
};

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [availableModels, setAvailableModels] = useState(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS[0]);
  const [activeWorkspace, setActiveWorkspace] = useState('chat');
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState('theme-dark');
  
  // Workspace Directory & Persistence State
  const [currentWorkspace, setCurrentWorkspace] = useState(() => {
    return localStorage.getItem('nexusai_current_workspace') || '/workspace';
  });
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [workspaceBookmarks, setWorkspaceBookmarks] = useState(() => {
    const saved = localStorage.getItem('nexusai_workspace_bookmarks');
    return saved ? JSON.parse(saved) : [
      { name: 'App Workspace', path: '/workspace' },
      { name: 'System Tmp', path: '/tmp' }
    ];
  });

  // Chat Configuration State (Workspace Generation / Code Display Modes)
  const [chatConfig, setChatConfig] = useState(() => {
    const saved = localStorage.getItem('nexusai_chat_config');
    if (saved) {
      try {
        return { ...DEFAULT_CHAT_CONFIG, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_CHAT_CONFIG;
      }
    }
    return DEFAULT_CHAT_CONFIG;
  });

  const updateChatConfig = (newConfig) => {
    setChatConfig((prev) => {
      const updated = typeof newConfig === 'function' ? newConfig(prev) : { ...prev, ...newConfig };
      localStorage.setItem('nexusai_chat_config', JSON.stringify(updated));
      return updated;
    });
  };

  const resetChatConfigToDefaults = () => {
    localStorage.setItem('nexusai_chat_config', JSON.stringify(DEFAULT_CHAT_CONFIG));
    setChatConfig(DEFAULT_CHAT_CONFIG);
  };

  // 6 Agentic Modes State (PLAN, BUILD, REVIEW, TEST, DEPLOY, LEARN)
  const [activeMode, setActiveMode] = useState(AGENT_MODES.PLAN);
  const [modeConfigModalOpen, setModeConfigModalOpen] = useState(false);

  // Permission Level State (0: Restricted, 1: Developer, 2: Administrator, 3: Superuser)
  const [permissionLevel, setPermissionLevel] = useState(1);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);

  // Settings
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [deepThinkingEnabled, setDeepThinkingEnabled] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [systemPrompt, setSystemPrompt] = useState(AGENT_MODES.PLAN.systemPrompt);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [vaultModalOpen, setVaultModalOpen] = useState(false);

  const { startStream, cancelStream } = useOptimizedStream();

  // Dynamically Fetch Workspace Metadata from Server on Mount
  useEffect(() => {
    const fetchWorkspaceInfo = async () => {
      try {
        const res = await fetch(getApiUrl('/api/workspace/info'));
        const data = await res.json();
        if (data.success && data.currentWorkspace) {
          const savedWs = localStorage.getItem('nexusai_current_workspace');
          // If saved workspace is missing or points to local WSL user path on VPS deployment
          if (!savedWs || savedWs.includes('/home/ahmed_alsaleh')) {
            setCurrentWorkspace(data.currentWorkspace);
            localStorage.setItem('nexusai_current_workspace', data.currentWorkspace);
          }
          if (data.bookmarks) {
            setWorkspaceBookmarks(data.bookmarks);
            localStorage.setItem('nexusai_workspace_bookmarks', JSON.stringify(data.bookmarks));
          }
        }
      } catch (err) {
        console.warn('Workspace info fetch warning:', err.message);
      }
    };
    fetchWorkspaceInfo();
  }, []);

  // Persist Workspace Path to LocalStorage
  useEffect(() => {
    if (currentWorkspace) {
      localStorage.setItem('nexusai_current_workspace', currentWorkspace);
    }
  }, [currentWorkspace]);

  // Mode Hotkeys: Ctrl+1 (PLAN), Ctrl+2 (BUILD), Ctrl+3 (REVIEW), Ctrl+4 (TEST), Ctrl+5 (DEPLOY), Ctrl+6 (LEARN)
  useEffect(() => {
    const handleModeHotkeys = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') { e.preventDefault(); setActiveMode(AGENT_MODES.PLAN); }
        if (e.key === '2') { e.preventDefault(); setActiveMode(AGENT_MODES.BUILD); }
        if (e.key === '3') { e.preventDefault(); setActiveMode(AGENT_MODES.REVIEW); }
        if (e.key === '4') { e.preventDefault(); setActiveMode(AGENT_MODES.TEST); }
        if (e.key === '5') { e.preventDefault(); setActiveMode(AGENT_MODES.DEPLOY); }
        if (e.key === '6') { e.preventDefault(); setActiveMode(AGENT_MODES.LEARN); }
      }
    };

    window.addEventListener('keydown', handleModeHotkeys);
    return () => window.removeEventListener('keydown', handleModeHotkeys);
  }, []);

  // Update system prompt and temperature when activeMode changes
  useEffect(() => {
    if (activeMode) {
      setSystemPrompt(activeMode.systemPrompt);
      setTemperature(activeMode.temperature);
      setMaxTokens(activeMode.maxTokens);
    }
  }, [activeMode]);

  const addWorkspaceBookmark = (bkmk) => {
    const updated = [...workspaceBookmarks.filter((b) => b.path !== bkmk.path), bkmk];
    setWorkspaceBookmarks(updated);
    localStorage.setItem('nexusai_workspace_bookmarks', JSON.stringify(updated));
  };

  // Load conversations from PostgreSQL REST API on mount
  useEffect(() => {
    const fetchDBConversations = async () => {
      try {
        const res = await fetchWithAuth('/api/conversations');
        const data = await res.json();
        if (data.success && data.conversations.length > 0) {
          const formatted = data.conversations.map((c) => ({
            ...c,
            date: c.date_group || 'Today',
            messages: []
          }));
          setConversations(formatted);
          setActiveThreadId(formatted[0].id);
        } else {
          createNewThread('Analytics Dashboard React Component');
        }
      } catch (err) {
        console.warn('DB Conversations fetch warning:', err.message);
      }
    };

    fetchDBConversations();
  }, []);

  // Fetch messages when activeThreadId changes
  useEffect(() => {
    if (!activeThreadId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetchWithAuth(`/api/conversations/${activeThreadId}/messages`);
        const data = await res.json();
        if (data.success) {
          setConversations((prev) =>
            prev.map((c) => (c.id === activeThreadId ? { ...c, messages: data.messages } : c))
          );
        }
      } catch (err) {
        console.warn('DB Messages fetch warning:', err.message);
      }
    };

    fetchMessages();
  }, [activeThreadId]);

  // Auto-pull local Ollama models on mount
  useEffect(() => {
    const fetchOllamaModels = async () => {
      try {
        const res = await fetchWithAuth('/api/ollama/models');
        const data = await res.json();
        if (data.success && data.models.length > 0) {
          const merged = [...data.models, ...DEFAULT_MODELS];
          setAvailableModels(merged);
          setSelectedModel(data.models[0]);
        }
      } catch (err) {
        console.warn('Ollama auto-detect warning:', err.message);
      }
    };

    fetchOllamaModels();
  }, []);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const activeThread = conversations.find((c) => c.id === activeThreadId) || conversations[0];

  const createNewThread = async (titleParam = null) => {
    const newId = 'thread-' + Date.now();
    const title = titleParam ? `${titleParam.slice(0, 30)}...` : 'New Session';
    const newThread = {
      id: newId,
      title: title,
      date: 'Today',
      model: selectedModel.id,
      pinned: false,
      messages: []
    };
    setConversations([newThread, ...conversations]);
    setActiveThreadId(newId);
    setActiveArtifact(null);

    try {
      await fetch(getApiUrl('/api/conversations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newId, title, model: selectedModel.id })
      });
    } catch (err) {
      console.warn('DB Create Thread warning:', err.message);
    }

    return newId;
  };

  const deleteThread = async (id, e) => {
    e?.stopPropagation();
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    if (activeThreadId === id && updated.length > 0) {
      setActiveThreadId(updated[0].id);
    }

    try {
      await fetch(getApiUrl(`/api/conversations/${id}`), { method: 'DELETE' });
    } catch (err) {
      console.warn('DB Delete Thread warning:', err.message);
    }
  };

  const togglePinThread = async (id, e) => {
    e?.stopPropagation();
    const target = conversations.find((c) => c.id === id);
    const newPinned = !target?.pinned;

    setConversations(
      conversations.map((c) => (c.id === id ? { ...c, pinned: newPinned } : c))
    );

    try {
      await fetch(getApiUrl(`/api/conversations/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: newPinned })
      });
    } catch (err) {
      console.warn('DB Pin Thread warning:', err.message);
    }
  };

  const sendMessage = async (content, attachments = []) => {
    if ((!content.trim() && attachments.length === 0) || isGenerating) return;

    let threadId = activeThreadId;
    const currentMessages = activeThread ? [...(activeThread.messages || [])] : [];

    // Auto update thread title if first message
    if (currentMessages.length === 0) {
      const autoTitle = content.slice(0, 32) + (content.length > 32 ? '...' : '');
      setConversations((prev) =>
        prev.map((c) => (c.id === threadId ? { ...c, title: autoTitle } : c))
      );

      fetch(getApiUrl(`/api/conversations/${threadId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: autoTitle })
      }).catch(() => {});
    }

    const userMessage = {
      id: 'user-msg-' + Date.now(),
      sender: 'user',
      content,
      attachments,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...currentMessages, userMessage];

    setConversations((prev) =>
      prev.map((c) => (c.id === threadId ? { ...c, messages: updatedMessages } : c))
    );

    setIsGenerating(true);

    const aiMessageId = 'ai-msg-' + Date.now();
    const placeholderAiMessage = {
      id: aiMessageId,
      sender: 'ai',
      model: selectedModel.id,
      content: '',
      thought: deepThinkingEnabled ? `[${activeMode.name}] Scope: ${currentWorkspace}...` : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === threadId ? { ...c, messages: [...updatedMessages, placeholderAiMessage] } : c
      )
    );

    await startStream({
      url: getApiUrl('/api/chat/stream'),
      body: {
        messages: updatedMessages,
        model: selectedModel.id,
        conversationId: threadId,
        mode: activeMode.id,
        workspace: currentWorkspace,
        systemPrompt: activeMode.systemPrompt,
        chatConfig: {
          ...chatConfig,
          effectiveDisplayMode: chatConfig.perModeOverrides?.[activeMode.id] || chatConfig.displayMode
        },
        options: {
          temperature: activeMode.temperature,
          maxTokens: activeMode.maxTokens
        }
      },
      onChunk: (accumulatedText) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== threadId) return c;
            const msgs = (c.messages || []).map((m) =>
              m.id === aiMessageId ? { ...m, content: accumulatedText } : m
            );
            return { ...c, messages: msgs };
          })
        );
      },
      onComplete: () => {
        setIsGenerating(false);
      },
      onError: (err) => {
        console.error('Stream error:', err);
        setIsGenerating(false);
      }
    });
  };

  const stopGenerating = () => {
    cancelStream();
    setIsGenerating(false);
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeThread,
        activeThreadId,
        setActiveThreadId,
        availableModels,
        selectedModel,
        setSelectedModel,
        activeWorkspace,
        setActiveWorkspace,
        isGenerating,
        theme,
        setTheme,
        sidebarOpen,
        setSidebarOpen,
        activeArtifact,
        setActiveArtifact,
        canvasOpen,
        setCanvasOpen,
        settingsModalOpen,
        setSettingsModalOpen,
        vaultModalOpen,
        setVaultModalOpen,

        // Workspace Directory Management
        currentWorkspace,
        setCurrentWorkspace,
        workspaceModalOpen,
        setWorkspaceModalOpen,
        workspaceBookmarks,
        addWorkspaceBookmark,

        // 6 Agentic Modes
        activeMode,
        setActiveMode,
        modeConfigModalOpen,
        setModeConfigModalOpen,

        // Permission System
        permissionLevel,
        setPermissionLevel,
        permissionsModalOpen,
        setPermissionsModalOpen,

        // Chat Configurations (Workspace Generation & Display Modes)
        chatConfig,
        updateChatConfig,
        resetChatConfigToDefaults,

        // Settings
        webSearchEnabled,
        setWebSearchEnabled,
        deepThinkingEnabled,
        setDeepThinkingEnabled,
        temperature,
        setTemperature,
        maxTokens,
        setMaxTokens,
        systemPrompt,
        setSystemPrompt,

        // Actions
        createNewThread,
        deleteThread,
        togglePinThread,
        sendMessage,
        stopGenerating,
        enhancePrompt
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
