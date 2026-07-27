import React, { useState, useEffect } from 'react';
import { Layers, Play, CheckCircle, RefreshCw, Sliders, Database } from 'lucide-react';
import { getApiUrl, useChat } from '../../context/ChatContext';

export function CompactionModal({ isOpen, onClose }) {
  const { currentConversation, activeMessages } = useChat();
  const [stats, setStats] = useState(null);
  const [compacting, setCompacting] = useState(false);
  const [message, setMessage] = useState('');
  const [maxMessages, setMaxMessages] = useState(50);
  const [summaryLength, setSummaryLength] = useState(3);
  const [autoCompaction, setAutoCompaction] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch(getApiUrl('/api/compaction/stats'));
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.warn('Could not fetch compaction stats:', err.message);
    }
  };

  const handleManualCompact = async () => {
    if (!activeMessages || activeMessages.length < 15) {
      setMessage('ℹ️ Conversation is already compact (< 15 messages).');
      return;
    }

    setCompacting(true);
    setMessage('Compacting conversation in background...');

    try {
      const res = await fetch(getApiUrl('/api/compaction/compact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: {
            id: currentConversation || 'active-session',
            messages: activeMessages
          },
          options: { maxMessagesBeforeCompaction: 15, summaryLength }
        })
      });

      const data = await res.json();
      if (data.success && data.result.compacted) {
        setMessage(`✅ Compacted ${data.result.originalCount} → ${data.result.newCount} messages (Saved ${data.result.compactedCount} msgs).`);
        fetchStats();
      } else {
        setMessage(`ℹ️ ${data.result.reason || 'No compaction performed.'}`);
      }
    } catch (err) {
      setMessage(`⚠️ Compaction Error: ${err.message}`);
    } finally {
      setCompacting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
      const interval = setInterval(fetchStats, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111625] border border-cyan-500/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#171e31]">
          <div className="flex items-center space-x-3">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white text-lg">Conversation Compaction & Memory</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl font-bold px-2"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {message && (
            <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-300">
              {message}
            </div>
          )}

          {/* Settings Section */}
          <div className="space-y-3 p-4 rounded-xl bg-gray-900/60 border border-gray-800">
            <h4 className="font-semibold text-gray-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Compaction Thresholds
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 block mb-1">Trigger Threshold (Messages)</label>
                <input
                  type="number"
                  value={maxMessages}
                  onChange={(e) => setMaxMessages(parseInt(e.target.value) || 50)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Summary Length (Sentences)</label>
                <input
                  type="number"
                  value={summaryLength}
                  onChange={(e) => setSummaryLength(parseInt(e.target.value) || 3)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="autoCompactionCheck"
                checked={autoCompaction}
                onChange={(e) => setAutoCompaction(e.target.checked)}
                className="rounded border-gray-700 text-cyan-500 focus:ring-cyan-500"
              />
              <label htmlFor="autoCompactionCheck" className="text-gray-300 font-medium">
                Enable Idle Background Compaction (non-disruptive)
              </label>
            </div>
          </div>

          {/* Live Statistics */}
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-3">
            <h4 className="font-semibold text-gray-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" /> Compaction Statistics
            </h4>
            <div className="grid grid-cols-2 gap-3 text-gray-300">
              <div className="p-2.5 rounded-lg bg-gray-800/60">
                <span className="text-gray-400 block">Total Compactions</span>
                <span className="text-lg font-bold font-mono text-white">{stats?.totalCompactions || 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-800/60">
                <span className="text-gray-400 block">Messages Compacted</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{stats?.messagesCompacted || 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-800/60">
                <span className="text-gray-400 block">Memory Saved</span>
                <span className="text-lg font-bold font-mono text-cyan-400">
                  {((stats?.memorySavedBytes || 0) / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-800/60">
                <span className="text-gray-400 block">Avg Duration</span>
                <span className="text-lg font-bold font-mono text-white">{stats?.avgCompactionTimeMs || 0} ms</span>
              </div>
            </div>
          </div>

          {/* Trigger Action */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Manual Conversation Compaction</h4>
              <p className="text-gray-400">Compress active session history and summarize older context immediately.</p>
            </div>
            <button
              onClick={handleManualCompact}
              disabled={compacting}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-cyan-500/20"
            >
              {compacting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {compacting ? 'Compacting...' : 'Compact Now'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 bg-[#171e31] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
