import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Activity, Server, Zap } from 'lucide-react';
import { getApiUrl } from '../../context/ChatContext';

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState({
    cpuCount: 8,
    cpuModel: 'Intel / AMD Core',
    systemMemoryMB: 8420,
    totalMemoryMB: 16384,
    heapUsedMB: 124,
    rssMB: 280,
    ollamaOnline: true
  });

  useEffect(() => {
    let intervalId = null;

    const fetchMetrics = async () => {
      if (document.hidden) return; // Skip if tab is inactive
      try {
        const res = await fetch(getApiUrl('/api/system/metrics'));
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch {
        // quiet fallback
      }
    };

    fetchMetrics();
    intervalId = setInterval(fetchMetrics, 2000);

    const handleVisibilityChange = () => {
      if (!document.hidden) fetchMetrics();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const ramUsagePercent = Math.round((metrics.systemMemoryMB / metrics.totalMemoryMB) * 100) || 45;

  return (
    <div
      className="glass-card"
      style={{
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Cpu size={14} style={{ color: 'var(--accent-cyan)' }} />
        <span>CPU ({metrics.cpuCount} cores):</span>
        <strong style={{ color: 'var(--text-main)' }}>Active</strong>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <HardDrive size={14} style={{ color: 'var(--accent-secondary)' }} />
        <span>RAM:</span>
        <strong style={{ color: 'var(--text-main)' }}>
          {metrics.systemMemoryMB} MB ({ramUsagePercent}%)
        </strong>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Zap size={14} style={{ color: 'var(--accent-emerald)' }} />
        <span>Ollama GPU:</span>
        <span className={metrics.ollamaOnline ? 'badge badge-emerald' : 'badge badge-cyan'}>
          {metrics.ollamaOnline ? 'Connected' : 'Standby'}
        </span>
      </div>
    </div>
  );
}
