import React, { useState, useEffect } from 'react';
import { Folder, CheckCircle, AlertTriangle, RefreshCw, ShieldCheck, FileText, Play } from 'lucide-react';
import { getApiUrl } from '../../context/ChatContext';

export function WorkspaceStatusPanel({ isOpen, onClose }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/workspace/status'));
      const data = await res.json();
      if (data.success) {
        setStatus(data);
      }
    } catch (err) {
      console.warn('Could not fetch workspace status:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    setTesting(true);
    try {
      const res = await fetch(getApiUrl('/api/workspace/test'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace: status?.workspacePath })
      });
      const data = await res.json();
      if (data.success) {
        setTestResults(data.summary);
        fetchStatus();
      }
    } catch (err) {
      console.warn('Test suite failed:', err.message);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111625] border border-cyan-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#171e31]">
          <div className="flex items-center space-x-3">
            <Folder className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white text-lg">Workspace Operation Monitor</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
              title="Refresh Diagnostic Status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl font-bold px-2"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Active Workspace Status Card */}
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Active Target Root</span>
              <span className="font-mono text-sm text-cyan-300 font-semibold">{status?.workspacePath || 'Loading...'}</span>
            </div>
            <div className="flex items-center space-x-2">
              {status?.healthy ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Healthy & Verified
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Issues Detected
                </span>
              )}
            </div>
          </div>

          {/* Test Suite Trigger */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Empirical Verification Test Suite
              </h4>
              <p className="text-xs text-gray-400 mt-1">Run post-write verification checks, stat assertions & path safety tests.</p>
            </div>
            <button
              onClick={runTests}
              disabled={testing}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-cyan-500/20"
            >
              {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {testing ? 'Running Tests...' : 'Run Test Suite'}
            </button>
          </div>

          {/* Test Results Summary */}
          {testResults && (
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
              <span>Test Summary: <strong>{testResults.passed} / {testResults.total} passed</strong> ({testResults.percentage}%)</span>
              <span className="font-semibold uppercase tracking-wider">{testResults.status}</span>
            </div>
          )}

          {/* Recent Operations Audit Log */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" /> Recent Verified File Operations
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {status?.recentOperations && status.recentOperations.length > 0 ? (
                status.recentOperations.map((op, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/80 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {op.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="text-gray-300 truncate">{op.path}</span>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0 text-gray-400">
                      <span className="uppercase text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-800">{op.type}</span>
                      <span>{new Date(op.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-xs rounded-lg border border-dashed border-gray-800">
                  No workspace file operations recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 bg-[#171e31] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
