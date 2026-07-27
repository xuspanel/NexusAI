import React, { useState, useEffect } from 'react';
import { Zap, HardDrive, Database, Activity, RefreshCw, Trash2, Shield, Download } from 'lucide-react';
import { getApiUrl } from '../../context/ChatContext';

export function PerformanceDashboard({ isOpen, onClose }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/performance/metrics'));
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.warn('Could not fetch performance metrics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForceGC = async () => {
    setActionMessage('Triggering Garbage Collection...');
    try {
      const res = await fetch(getApiUrl('/api/performance/gc'), { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✅ GC Freed ${data.after.heapUsedMB ? (data.before.heapUsedMB - data.after.heapUsedMB).toFixed(1) : 0} MB`);
        fetchMetrics();
      }
    } catch (err) {
      setActionMessage(`⚠️ GC Error: ${err.message}`);
    }
  };

  const handleClearCache = async () => {
    setActionMessage('Clearing Response Cache...');
    try {
      const res = await fetch(getApiUrl('/api/performance/cache/clear'), { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionMessage('✅ Response Caches Cleared');
        fetchMetrics();
      }
    } catch (err) {
      setActionMessage(`⚠️ Clear Cache Error: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMetrics();
      const interval = setInterval(fetchMetrics, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const memoryPercentage = metrics?.memory?.current?.heapTotalMB 
    ? Math.min(100, Math.round((metrics.memory.current.heapUsedMB / metrics.memory.current.heapTotalMB) * 100))
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111625] border border-indigo-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#171e31]">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white text-lg">Performance & Memory Dashboard</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
              title="Refresh Performance Telemetry"
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
          {actionMessage && (
            <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-300">
              {actionMessage}
            </div>
          )}

          {/* Metric Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Heap Memory Card */}
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-indigo-400" /> Heap Memory Usage
                </span>
                <span className="text-xs font-mono text-indigo-300 font-bold">{metrics?.memory?.current?.heapUsedMB || 0} MB</span>
              </div>
              <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    memoryPercentage > 85 ? 'bg-rose-500' : memoryPercentage > 65 ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${memoryPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>Used: {metrics?.memory?.current?.heapUsedMB || 0} MB</span>
                <span>Total: {metrics?.memory?.current?.heapTotalMB || 0} MB</span>
              </div>
            </div>

            {/* Cache Hit Rate Card */}
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-400" /> Cache Hit Rate
                </span>
                <span className="text-xs font-mono text-emerald-300 font-bold">{metrics?.cache?.hitRate || 0}%</span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">{metrics?.cache?.hitRate || 0}%</div>
              <div className="text-[11px] text-gray-500 flex justify-between">
                <span>Hits: {metrics?.cache?.hits || 0}</span>
                <span>Misses: {metrics?.cache?.misses || 0}</span>
              </div>
            </div>

            {/* Event Listeners Card */}
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-400" /> Active Event Listeners
                </span>
                <span className="text-xs font-mono text-purple-300 font-bold">{metrics?.listeners?.active || 0}</span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">{metrics?.listeners?.active || 0}</div>
              <div className="text-[11px] text-gray-500">Total Tracked: {metrics?.listeners?.total || 0}</div>
            </div>

            {/* Stream Latency Card */}
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-cyan-400" /> System Leak Status
                </span>
                <span className="text-xs font-mono text-cyan-300 font-bold">
                  {metrics?.memory?.leakDetected ? '⚠️ Leak Alert' : '✅ Stable'}
                </span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {metrics?.memory?.leakDetected ? 'POTENTIAL LEAK' : 'STABLE & VERIFIED'}
              </div>
              <div className="text-[11px] text-gray-500">Auto Cleanups: {metrics?.memory?.cleanupCount || 0}</div>
            </div>
          </div>

          {/* Action Control Panel */}
          <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Manual Performance Controls</h4>
              <p className="text-xs text-gray-400">Trigger explicit memory garbage collection or clear LRU caches.</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleForceGC}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Force GC
              </button>
              <button
                onClick={handleClearCache}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Caches
              </button>
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
