import React, { useState, useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import { renderMessagesVirtual, VirtualScroller } from '../../utils/VirtualScroller';

/**
 * FIXED VIRTUAL / HYBRID CHAT SCROLLER
 * 
 * Fixes:
 * 1. Solves the issue where scrolling up/down snaps back up after AI finishes response.
 * 2. User-Aware Auto-Scroll: Auto-scrolls only if user is near bottom.
 * 3. Dynamic Height Handling: No rigid container height capping that constrains long code blocks.
 */
export default function VirtualMessageList({ messages = [] }) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const userScrolledRef = useRef(false);

  const isVirtualEnabled = typeof window !== 'undefined' ? window.__NEXUS_ENABLE_VIRTUAL_SCROLLER__ : true;

  // Track user manual scrolling
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    // If user scrolled up more than 100px from bottom, mark userScrolledRef as true
    if (distanceFromBottom > 100) {
      userScrolledRef.current = true;
    } else {
      userScrolledRef.current = false;
    }
  };

  // Auto-scroll to bottom ONLY if user hasn't manually scrolled up
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!userScrolledRef.current) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length, messages[messages.length - 1]?.content]);

  // When a new user message is sent, reset scroll lock to force scroll to bottom
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'user') {
      userScrolledRef.current = false;
      const container = containerRef.current;
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages.length]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        flex: 1,
        overflowY: 'auto',
        position: 'relative',
        height: '100%',
        willChange: 'scroll-position'
      }}
    >
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '16px', minHeight: '100%' }}>
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} style={{ height: '1px' }} />
      </div>
    </div>
  );
}

// Re-export backward compatibility wrapper
export { renderMessagesVirtual, VirtualScroller };
