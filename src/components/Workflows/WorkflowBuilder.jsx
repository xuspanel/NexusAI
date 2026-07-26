import React, { useState } from 'react';
import { 
  Workflow, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Cpu, 
  Globe, 
  Code, 
  ShieldCheck, 
  Terminal,
  RotateCw
} from 'lucide-react';

export default function WorkflowBuilder() {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(2);

  const steps = [
    {
      id: 1,
      title: 'Web & Documentation Scraper Agent',
      model: 'Nexus 4.5 Multimodal',
      icon: Globe,
      status: 'completed',
      log: 'Crawled 4 API reference pages. Extracted OpenAPI schema specifications.'
    },
    {
      id: 2,
      title: 'Code Synthesis Agent',
      model: 'Nexus Coder Pro',
      icon: Code,
      status: 'running',
      log: 'Generating TypeScript interfaces and React Query hooks...'
    },
    {
      id: 3,
      title: 'AST & Lint Validation Agent',
      model: 'DeepNexus Reasoning',
      icon: ShieldCheck,
      status: 'pending',
      log: 'Waiting for code stream completion...'
    },
    {
      id: 4,
      title: 'Automated Deployment Agent',
      model: 'Nexus Executor',
      icon: Terminal,
      status: 'pending',
      log: 'Standby for sandbox container initialization.'
    }
  ];

  const handleRunWorkflow = () => {
    setIsRunning(true);
    setActiveStep(2);
    setTimeout(() => setActiveStep(3), 2500);
    setTimeout(() => {
      setActiveStep(4);
      setIsRunning(false);
    }, 5000);
  };

  return (
    <div style={{
      flex: 1,
      overflow: 'auto',
      padding: '30px',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '800px', width: '100%', marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
          <Workflow size={14} /> Agentic Pipeline Studio
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>
          Autonomous Multi-Agent Workflow
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
          Coordinate multiple specialized AI models to perform complex research, coding, validation, and deployment tasks concurrently.
        </p>
      </div>

      {/* Control Bar */}
      <div className="glass-card" style={{ maxWidth: '800px', width: '100%', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>Pipeline: Full-Stack Feature Generator</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>4 Agents • Estimated Runtime: 12 seconds</div>
        </div>
        <button onClick={handleRunWorkflow} disabled={isRunning} className="btn-primary">
          {isRunning ? <RotateCw size={14} className="animate-spin-slow" /> : <Play size={14} />}
          <span>{isRunning ? 'Executing Agents...' : 'Execute Agent Pipeline'}</span>
        </button>
      </div>

      {/* Workflow Nodes Grid */}
      <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {steps.map((step) => {
          const IconComp = step.icon;
          const isCurrent = activeStep === step.id;
          const isDone = activeStep > step.id;

          return (
            <div
              key={step.id}
              className="glass-panel fade-in"
              style={{
                padding: '18px 20px',
                borderRadius: 'var(--radius-lg)',
                borderColor: isCurrent ? 'var(--border-active)' : isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)',
                boxShadow: isCurrent ? 'var(--shadow-neon)' : 'none',
                transition: 'all 0.25s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: isDone ? 'rgba(16, 185, 129, 0.15)' : isCurrent ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDone ? 'var(--accent-emerald)' : isCurrent ? 'var(--accent-cyan)' : 'var(--text-muted)'
                  }}>
                    <IconComp size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                      Step {step.id}: {step.title}
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                      Engine: {step.model}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isDone && (
                    <span className="badge badge-emerald">
                      <CheckCircle2 size={11} /> Passed
                    </span>
                  )}
                  {isCurrent && (
                    <span className="badge badge-purple animate-pulse">
                      <RotateCw size={11} className="animate-spin-slow" /> Running
                    </span>
                  )}
                  {!isDone && !isCurrent && (
                    <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                      <Clock size={11} /> Standby
                    </span>
                  )}
                </div>
              </div>

              {/* Execution Log Snippet */}
              <div style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#090d16',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: isDone ? '#9ca3af' : isCurrent ? 'var(--accent-cyan)' : '#4b5563',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                &gt; {step.log}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
