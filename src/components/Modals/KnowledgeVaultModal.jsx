import React, { useState } from 'react';
import { 
  X, 
  Database, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  Layers, 
  HardDrive,
  Cpu
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export default function KnowledgeVaultModal() {
  const { vaultModalOpen, setVaultModalOpen } = useChat();

  const [documents, setDocuments] = useState([
    { id: '1', name: 'Nexus_Architecture_Specs.pdf', size: '2.4 MB', chunks: 142, status: 'Indexed' },
    { id: '2', name: 'API_Gateway_Endpoints.json', size: '890 KB', chunks: 56, status: 'Indexed' },
    { id: '3', name: 'Security_Compliance_2026.docx', size: '1.1 MB', chunks: 88, status: 'Indexed' }
  ]);

  if (!vaultModalOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel fade-in" style={{
        width: '620px',
        maxWidth: '100%',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-active)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Knowledge Vault (Vector RAG)</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ground your AI responses with custom vector-indexed files</span>
            </div>
          </div>
          <button onClick={() => setVaultModalOpen(false)} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Dropzone */}
        <div style={{
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '2px dashed var(--border-active)',
          background: 'var(--bg-tertiary)',
          textAlign: 'center',
          marginBottom: '20px',
          cursor: 'pointer'
        }}>
          <UploadCloud size={32} style={{ color: 'var(--accent-primary)', marginBottom: '8px' }} />
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
            Drag & drop files to ingest into Vector Index
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Embedding Model: text-embedding-3-large (1536 dimensions)
          </div>
        </div>

        {/* Documents Table */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-subtle)', uppercase: 'true', marginBottom: '8px' }}>
            Active Grounded Knowledge Files ({documents.length})
          </div>
          {documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                marginBottom: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={16} style={{ color: 'var(--accent-cyan)' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{doc.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {doc.size} • {doc.chunks} vector chunks
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge badge-emerald" style={{ fontSize: '9px' }}>
                  <CheckCircle2 size={10} /> {doc.status}
                </span>
                <button
                  onClick={() => setDocuments(documents.filter((d) => d.id !== doc.id))}
                  className="btn-icon"
                  style={{ width: 26, height: 26 }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setVaultModalOpen(false)} className="btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
