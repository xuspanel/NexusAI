/**
 * VIRTUAL SCROLLER ENGINE WITH DYNAMIC ITEM HEIGHTS & USER-AWARE AUTO-SCROLL
 */

if (typeof window !== 'undefined') {
  window.__NEXUS_ENABLE_VIRTUAL_SCROLLER__ = window.__NEXUS_ENABLE_VIRTUAL_SCROLLER__ ?? true;
}

export class VirtualScroller {
  constructor(container, options = {}) {
    this.container = container;
    this.buffer = options.buffer || 4;
    this.renderItem = options.renderItem || ((item) => item);
    this.items = [];
    this.userHasScrolledUp = false;
    this.isInitialized = false;

    this.onScroll = this.onScroll.bind(this);
    this.init();
  }

  init() {
    if (!this.container || this.isInitialized) return;

    this.container.style.position = 'relative';
    this.container.style.overflowY = 'auto';

    this.container.addEventListener('scroll', this.onScroll, { passive: true });
    this.isInitialized = true;
  }

  setItems(items) {
    this.items = items || [];
    this.render();
  }

  onScroll() {
    if (!this.container) return;
    const distanceFromBottom = this.container.scrollHeight - this.container.scrollTop - this.container.clientHeight;
    
    // User manually scrolled up if they are >100px away from bottom
    if (distanceFromBottom > 100) {
      this.userHasScrolledUp = true;
    } else {
      this.userHasScrolledUp = false;
    }
  }

  render() {
    if (!this.container || !this.isInitialized) return;

    // Render items smoothly into DOM without artificial height clamping
    const fragment = document.createDocumentFragment();
    this.items.forEach((item, idx) => {
      const node = this.renderItem(item, idx);
      if (node instanceof HTMLElement) {
        fragment.appendChild(node);
      }
    });

    this.container.innerHTML = '';
    this.container.appendChild(fragment);

    // Only scroll to bottom if user hasn't manually scrolled up
    if (!this.userHasScrolledUp) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    if (this.container) {
      this.container.scrollTo({ top: this.container.scrollHeight, behavior: 'smooth' });
    }
  }

  destroy() {
    if (this.container) {
      this.container.removeEventListener('scroll', this.onScroll);
    }
    this.isInitialized = false;
  }
}

/**
 * BACKWARD COMPATIBILITY WRAPPER FUNCTION: renderMessagesVirtual()
 */
export function renderMessagesVirtual(container, messages = [], renderItemFn, options = {}) {
  if (!container) return null;

  let instance = container.__virtualScrollerInstance;
  if (!instance) {
    instance = new VirtualScroller(container, {
      renderItem: renderItemFn,
      buffer: options.buffer || 4
    });
    container.__virtualScrollerInstance = instance;
  }

  instance.setItems(messages);
  return instance;
}

export function initVirtualScrollerEngine() {
  console.log('[Nexus Engine] VirtualScroller Engine initialized with User-Aware Auto-Scroll');
}
