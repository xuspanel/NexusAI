/**
 * NEXUS AI - BACKEND READY API SERVICE LAYER
 * 
 * Configured for seamless backend integration.
 * Supports OpenAI, Anthropic, Ollama, custom REST/SSE streams, or built-in high-fidelity mock stream.
 */

export const AI_MODELS = [
  {
    id: 'nexus-4.5-turbo',
    name: 'Nexus 4.5 Turbo',
    tagline: 'Multimodal Flagship • 2M Token Context',
    badge: 'Flagship',
    badgeColor: 'badge-purple',
    latency: '180ms',
    maxTokens: 16384,
    features: ['Multimodal', 'Real-time Web', 'Vision', 'Code Execution'],
    description: 'Our most capable general-purpose intelligence model with ultra-fast inference and deep reasoning.'
  },
  {
    id: 'nexus-coder-pro',
    name: 'Nexus Coder Pro',
    tagline: 'Specialized Full-Stack Dev Engine',
    badge: 'Code Engine',
    badgeColor: 'badge-cyan',
    latency: '140ms',
    maxTokens: 32768,
    features: ['React/Vite', 'Python/Rust', 'Refactoring', 'Bug Hunter'],
    description: 'Trained on billions of lines of high quality code with built-in AST synthesis & live sandbox preview.'
  },
  {
    id: 'deep-nexus-reasoning',
    name: 'DeepNexus v2.1',
    tagline: 'Chain-of-Thought Deep Problem Solver',
    badge: 'Deep Think',
    badgeColor: 'badge-emerald',
    latency: '420ms',
    maxTokens: 65536,
    features: ['Math/Logic', 'System Design', 'Step-by-step CoT'],
    description: 'Deconstructs complex engineering, mathematical, and architectural problems into explicit steps.'
  },
  {
    id: 'nexus-vision-3d',
    name: 'Nexus Vision 3D',
    tagline: 'Visual Analytics & Scene Understanding',
    badge: 'Vision',
    badgeColor: 'badge-cyan',
    latency: '220ms',
    maxTokens: 16384,
    features: ['UI Mockup Analysis', 'OCR', 'Diagram Synthesis'],
    description: 'Reads technical diagrams, UI mockups, and wireframes to generate clean production code.'
  }
];

export const MOCK_STARTER_PROMPTS = [
  {
    title: 'Interactive Dashboard Component',
    category: 'Full-Stack UI',
    icon: 'Layout',
    prompt: 'Build a futuristic analytics dashboard component in React with SVG charts, metric cards, and clean hover animations.',
    model: 'nexus-coder-pro'
  },
  {
    title: 'Analyze Microservices Architecture',
    category: 'System Design',
    icon: 'Cpu',
    prompt: 'Design an ultra-scalable event-driven architecture for real-time video processing with Kafka, Go, and Redis.',
    model: 'deep-nexus-reasoning'
  },
  {
    title: 'Generate Synthetic Dataset API',
    category: 'Data Science',
    icon: 'Database',
    prompt: 'Write a Python FastAPI service that generates 100,000 realistic e-commerce transaction logs with edge-case anomalies.',
    model: 'nexus-4.5-turbo'
  },
  {
    title: 'Quantum Computing Explanation',
    category: 'Deep Tech',
    icon: 'Zap',
    prompt: 'Explain Quantum Key Distribution (QKD) using an intuitive analogy, mathematical breakdown, and potential security vectors.',
    model: 'deep-nexus-reasoning'
  }
];

/**
 * Enhanced mock response generator simulating realistic stream chunks & code artifacts
 */
export async function streamChatResponse({
  messages,
  model = 'nexus-4.5-turbo',
  settings = {},
  onChunk,
  onThought,
  onArtifact
}) {
  const userMessage = messages[messages.length - 1]?.content || '';

  // Simulate initial thinking process
  if (settings.deepThinking || model === 'deep-nexus-reasoning') {
    onThought?.('Thinking Process initialized...\n- Parsing user intent & domain tags\n- Fetching structural context & system instructions\n- Verifying syntax constraints for artifacts...');
    await new Promise((r) => setTimeout(r, 600));
    onThought?.('Checking knowledge base index for optimum code architecture...\n- Formulating clean modular structure\n- Preparing live interactive artifact view...');
    await new Promise((r) => setTimeout(r, 800));
  }

  // Pre-generate response content based on query keywords
  let fullText = '';
  let artifact = null;

  if (userMessage.toLowerCase().includes('dashboard') || userMessage.toLowerCase().includes('ui') || userMessage.toLowerCase().includes('react')) {
    artifact = {
      id: 'artifact-' + Date.now(),
      type: 'react',
      title: 'Analytics Dashboard Component',
      language: 'jsx',
      code: `import React, { useState } from 'react';

export default function AnalyticsWidget() {
  const [activeTab, setActiveTab] = useState('weekly');
  const metrics = [
    { title: 'Total Revenue', value: '$128,420', change: '+14.2%', isUp: true },
    { title: 'Active Users', value: '42,890', change: '+8.7%', isUp: true },
    { title: 'Server Latency', value: '18ms', change: '-4.1%', isUp: true },
    { title: 'Error Rate', value: '0.02%', change: '-0.01%', isUp: true }
  ];

  return (
    <div style={{ padding: '24px', background: '#111827', color: '#f9fafb', borderRadius: '16px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Nexus Operations Metric</h2>
          <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: '13px' }}>Real-time telemetry telemetry stream</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: '#1f2937', padding: '4px', borderRadius: '8px' }}>
          {['daily', 'weekly', 'monthly'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                background: activeTab === tab ? '#6366f1' : 'transparent',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                textTransform: 'capitalize',
                fontWeight: 600
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {metrics.map((m, idx) => (
          <div key={idx} style={{ background: '#1f2937', padding: '16px', borderRadius: '12px', border: '1px solid #374151' }}>
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>{m.title}</span>
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0', color: '#f3f4f6' }}>{m.value}</div>
            <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600 }}>{m.change} vs last period</span>
          </div>
        ))}
      </div>
    </div>
  );
}`
    };

    fullText = `I have designed a sleek, high-performance **Analytics Dashboard Component** tailored for real-time telemetry tracking.

### Key Highlights:
1. **Responsive Card Grid**: Auto-fits screen resolutions with glassmorphic depth.
2. **Stateful Controls**: Interactive filter tabs for Daily, Weekly, and Monthly aggregations.
3. **Clean Inline Styling**: Standalone React JSX ready to be dropped directly into your project.

\`\`\`jsx
${artifact.code}
\`\`\`

> 💡 **Artifact Ready**: Click **"Open Artifact"** in the panel to preview or edit this component live!`;
  } else if (userMessage.toLowerCase().includes('architecture') || userMessage.toLowerCase().includes('kafka') || userMessage.toLowerCase().includes('system')) {
    fullText = `Here is a production-ready **Event-Driven Architecture** for high-throughput stream ingestion.

### Architectural Overview

\`\`\`mermaid
flowchart TD
    Client[Mobile / Web Clients] -->|gRPC / WebSockets| Gateway[API Gateway Layer]
    Gateway -->|Publish Event| Kafka[Apache Kafka Cluster]
    Kafka -->|Topic: Telemetry| IngestionWorker[Go Ingestion Workers]
    IngestionWorker -->|Cache Hot Data| Redis[(Redis Enterprise)]
    IngestionWorker -->|Batch Write| Scylla[(ScyllaDB / Cassandra)]
    Kafka -->|Topic: Analytics| Flink[Apache Flink Real-time Analytics]
    Flink -->|Push Alert| Webhook[Notification Engine]
\`\`\``;
  } else {
    fullText = `Welcome to **NexusAI Studio**. I am running model **${model}** with high-speed streaming capabilities.

### How I Can Help You Today:
- **Full-Stack Application Generation**: Write React, Vue, Svelte, or Python services.
- **Deep Reasoning & Math**: Quantum mechanics, system architecture, or algorithm optimization.
- **Knowledge RAG Vault**: Upload custom documentation or PDF contracts for grounded vector retrieval.

Here is a quick Python code example demonstrating backend integration with standard REST or Server-Sent Events (SSE):

\`\`\`python
import time
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI(title="NexusAI Custom Gateway")

async def mock_ai_stream(prompt: str):
    tokens = f"Echoing prompt: {prompt}".split()
    for token in tokens:
        yield f"data: {token} \\n\\n"
        time.sleep(0.05)

@app.post("/v1/chat/completions")
async def chat_endpoint(payload: dict):
    return StreamingResponse(
        mock_ai_stream(payload.get("prompt", "")), 
        media_type="text/event-stream"
    )
\`\`\`

Feel free to ask follow-up questions or refine your prompt!`;
  }

  // Stream text character by character / token by token
  const words = fullText.split(' ');
  let currentOutput = '';

  for (let i = 0; i < words.length; i++) {
    currentOutput += (i === 0 ? '' : ' ') + words[i];
    onChunk(currentOutput);
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 25));
  }

  if (artifact) {
    onArtifact?.(artifact);
  }
}

/**
 * Supercharge Prompt Enhancer Mock
 */
export async function enhancePrompt(originalPrompt) {
  await new Promise((r) => setTimeout(r, 400));
  return `Act as a Principal Software Architect & UI Designer. Analyze the following request in depth and produce modular, clean production-ready code with edge case handling: "${originalPrompt}"`;
}
