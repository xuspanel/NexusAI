import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { initVirtualScrollerEngine } from './utils/VirtualScroller';

// Initialize VirtualScroller Engine
initVirtualScrollerEngine();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
