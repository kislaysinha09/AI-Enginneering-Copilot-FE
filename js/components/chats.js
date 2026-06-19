/* ==========================================================================
   AI ENGINEERING COPILOT - CHAT WORKSPACE COMPONENT
   ========================================================================== */
   
import { state } from '../state.js';
import { scrollToBottom } from '../router.js';

export function setupChats() {
  const directInput = document.getElementById('direct-chat-input');
  const directSendBtn = document.getElementById('direct-chat-send-btn');
  const ragInput = document.getElementById('rag-chat-input');
  const ragSendBtn = document.getElementById('rag-chat-send-btn');

  if (!directInput || !directSendBtn || !ragInput || !ragSendBtn) return;

  // Load chat history if present
  renderChatHistory('direct');
  renderChatHistory('rag');

  // Input text area auto-expand & send buttons validation
  [
    { input: directInput, btn: directSendBtn },
    { input: ragInput, btn: ragSendBtn }
  ].forEach(pair => {
    pair.input.addEventListener('input', () => {
      // Auto expand vertical height
      pair.input.style.height = 'auto';
      pair.input.style.height = Math.min(pair.input.scrollHeight, 150) + 'px';
      
      // Enable/disable send button
      pair.btn.disabled = pair.input.value.trim().length === 0;
    });

    // Press Shift + Enter for new line, plain Enter to submit
    pair.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        pair.btn.click();
      }
    });
  });

  // Prompt suggestion cards injection auto-fill
  document.addEventListener('click', (e) => {
    const suggestBtn = e.target.closest('.suggest-btn');
    if (!suggestBtn) return;

    const query = suggestBtn.getAttribute('data-query');
    if (!query) return;

    if (state.activeView === 'chat-direct' || suggestBtn.closest('#view-chat-direct')) {
      const chatBtn = document.querySelector('.nav-btn[data-view="chat-direct"]');
      if (chatBtn) chatBtn.click();
      
      directInput.value = query;
      directInput.style.height = 'auto';
      directInput.style.height = Math.min(directInput.scrollHeight, 150) + 'px';
      directSendBtn.disabled = false;
      directInput.focus();
    } else if (state.activeView === 'chat-rag' || suggestBtn.closest('#view-chat-rag') || suggestBtn.closest('#view-dashboard')) {
      const copilotBtn = document.querySelector('.nav-btn[data-view="chat-rag"]');
      if (copilotBtn) copilotBtn.click();

      ragInput.value = query;
      ragInput.style.height = 'auto';
      ragInput.style.height = Math.min(ragInput.scrollHeight, 150) + 'px';
      ragSendBtn.disabled = false;
      ragInput.focus();
    }
  });

  // DIRECT CHAT SUBMISSION
  directSendBtn.addEventListener('click', async () => {
    const queryText = directInput.value.trim();
    if (!queryText) return;

    // Reset Input Box
    directInput.value = '';
    directInput.style.height = '48px';
    directSendBtn.disabled = true;

    // Add User bubble
    appendMessageBubble('direct', 'user', queryText);
    state.chatHistoryDirect.push({ sender: 'user', text: queryText, timestamp: new Date().toISOString() });
    saveChatHistory('direct');

    // Add Typing indicator bubble
    const typingId = appendTypingIndicator('direct');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (state.session?.access_token) {
        headers['Authorization'] = `Bearer ${state.session.access_token}`;
      }

      const response = await fetch(`${state.backendUrl}/api/ask`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ question: queryText })
      });

      removeTypingIndicator('direct', typingId);

      if (!response.ok) throw new Error('API failed to respond');
      const data = await response.json();
      
      // Add AI bubble
      appendMessageBubble('direct', 'ai', data.answer);
      state.chatHistoryDirect.push({ sender: 'ai', text: data.answer, timestamp: new Date().toISOString() });
      saveChatHistory('direct');
    } catch (err) {
      console.error(err);
      removeTypingIndicator('direct', typingId);
      appendMessageBubble('direct', 'ai', '⚠️ Error contacting the generative direct LLM hub. Please verify that the backend engine is running locally.');
    }
  });

  // RAG CHAT SUBMISSION
  ragSendBtn.addEventListener('click', async () => {
    const queryText = ragInput.value.trim();
    if (!queryText) return;

    // Reset Input Box
    ragInput.value = '';
    ragInput.style.height = '48px';
    ragSendBtn.disabled = true;

    // Add User bubble
    appendMessageBubble('rag', 'user', queryText);
    state.chatHistoryRag.push({ sender: 'user', text: queryText, timestamp: new Date().toISOString() });
    saveChatHistory('rag');

    // Add Typing indicator bubble
    const typingId = appendTypingIndicator('rag');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (state.session?.access_token) {
        headers['Authorization'] = `Bearer ${state.session.access_token}`;
      }

      const response = await fetch(`${state.backendUrl}/api/query`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ query: queryText })
      });

      removeTypingIndicator('rag', typingId);

      if (!response.ok) throw new Error('RAG search failed');
      const data = await response.json();
      
      // Add AI bubble with Pinecone sources
      appendMessageBubble('rag', 'ai', data.answer, data.sources);
      state.chatHistoryRag.push({ 
        sender: 'ai', 
        text: data.answer, 
        sources: data.sources, 
        timestamp: new Date().toISOString() 
      });
      saveChatHistory('rag');
    } catch (err) {
      console.error(err);
      removeTypingIndicator('rag', typingId);
      appendMessageBubble('rag', 'ai', '⚠️ Search failed. Please check backend Pinecone settings or upload a document first to query.');
    }
  });
}

// Render existing chat logs from storage
function renderChatHistory(type) {
  const viewportId = type === 'direct' ? 'direct-chat-viewport' : 'rag-chat-viewport';
  const viewport = document.getElementById(viewportId);
  const history = type === 'direct' ? state.chatHistoryDirect : state.chatHistoryRag;

  if (!viewport || history.length === 0) return;

  // Clear greeting splash if history has messages
  const greeting = viewport.querySelector('.ai-greeting');
  if (greeting) greeting.style.display = 'none';

  history.forEach(msg => {
    appendMessageBubble(type, msg.sender, msg.text, msg.sources, true);
  });
  
  scrollToBottom(viewportId);
}

// Append Chat message to UI
export function appendMessageBubble(type, sender, text, sources = [], isInitialLoad = false) {
  const viewportId = type === 'direct' ? 'direct-chat-viewport' : 'rag-chat-viewport';
  const viewport = document.getElementById(viewportId);
  if (!viewport) return;

  // Hide greeting splash if visible
  const greeting = viewport.querySelector('.ai-greeting');
  if (greeting && greeting.style.display !== 'none') {
    greeting.style.display = 'none';
  }

  const msgDiv = document.createElement('div');
  const avatarChar = sender === 'user' ? 'U' : (type === 'direct' ? 'A' : 'R');
  const themeClass = type === 'rag' ? 'teal' : '';
  
  msgDiv.className = `chat-msg ${sender} ${sender === 'ai' ? themeClass : ''}`;
  
  const formattedText = formatChatMessageText(text);

  msgDiv.innerHTML = `
    <div class="msg-avatar">${avatarChar}</div>
    <div class="msg-bubble">
      ${formattedText}
      ${sender === 'ai' && sources && sources.length > 0 ? buildSourcesUiMarkup(sources) : ''}
    </div>
  `;

  viewport.appendChild(msgDiv);
  
  if (!isInitialLoad) {
    scrollToBottom(viewportId);
  }

  // Bind code block copy and source tag toggle click events
  bindBubbleInteractions(msgDiv);
}

// Helper to render glowing source elements
function buildSourcesUiMarkup(sources) {
  const randomMsgId = Math.random().toString(36).substring(2, 9);
  
  let tagsHtml = '';
  let detailsHtml = '';

  sources.forEach((src, idx) => {
    const scorePct = (src.score ? src.score * 100 : 95.0).toFixed(1) + '%';
    const cleanFileName = src.metadata?.fileName || 'Extracted Document';
    const textChunk = src.text || src.metadata?.text || 'No text segment extracted.';
    
    tagsHtml += `
      <button class="source-tag" data-toggle-id="src-${randomMsgId}-${idx}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <span>Chunk-${idx + 1} (${scorePct})</span>
      </button>
    `;

    detailsHtml += `
      <div class="source-detail-card" id="src-${randomMsgId}-${idx}">
        <div class="source-card-header">
          <span class="source-card-file">📂 ${cleanFileName} (Segment ${src.metadata?.chunkIndex || idx + 1})</span>
          <span class="source-score-badge">${scorePct} Relevance Match</span>
        </div>
        <div class="source-card-text">${escapeHtml(textChunk)}</div>
      </div>
    `;
  });

  return `
    <div class="msg-sources">
      <div class="sources-title">Verified Knowledge Sources:</div>
      <div class="sources-tags">${tagsHtml}</div>
      <div class="source-details-container">${detailsHtml}</div>
    </div>
  `;
}

// Bind clicks for copying code or viewing expandable Pinecone chunks
function bindBubbleInteractions(msgContainer) {
  // 1. Copy Code Blocks
  const copyButtons = msgContainer.querySelectorAll('.btn-copy-code');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const codeBlock = btn.closest('.msg-bubble').querySelector('pre code');
      if (!codeBlock) return;

      navigator.clipboard.writeText(codeBlock.innerText).then(() => {
        btn.innerText = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerText = 'Copy Code';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });

  // 2. Collapsible RAG Sources panels
  const sourceTags = msgContainer.querySelectorAll('.source-tag');
  const detailsContainer = msgContainer.querySelector('.source-details-container');
  
  if (!detailsContainer) return;
  
  sourceTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const targetId = tag.getAttribute('data-toggle-id');
      const detailCard = msgContainer.querySelector(`#${targetId}`);
      
      // Close all other cards first
      const allCards = msgContainer.querySelectorAll('.source-detail-card');
      allCards.forEach(card => {
        if (card.id !== targetId) card.classList.remove('active');
      });

      const allTags = msgContainer.querySelectorAll('.source-tag');
      allTags.forEach(t => {
        if (t !== tag) t.classList.remove('active');
      });

      // Toggle current target
      const isActive = detailCard.classList.toggle('active');
      tag.classList.toggle('active');

      if (isActive) {
        detailsContainer.classList.add('active');
      } else {
        // If no details cards are active, hide the main wrapper
        const activeCards = detailsContainer.querySelectorAll('.source-detail-card.active');
        if (activeCards.length === 0) {
          detailsContainer.classList.remove('active');
        }
      }
    });
  });
}

// Typing indicators
export function appendTypingIndicator(type) {
  const viewportId = type === 'direct' ? 'direct-chat-viewport' : 'rag-chat-viewport';
  const viewport = document.getElementById(viewportId);
  if (!viewport) return;
  
  const uniqueId = 'typing-' + Math.random().toString(36).substring(2, 9);

  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = 'chat-msg ai typing-indicator-bubble';
  bubbleDiv.id = uniqueId;
  bubbleDiv.innerHTML = `
    <div class="msg-avatar">${type === 'direct' ? 'A' : 'R'}</div>
    <div class="msg-bubble">
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    </div>
  `;

  viewport.appendChild(bubbleDiv);
  scrollToBottom(viewportId);
  return uniqueId;
}

export function removeTypingIndicator(type, id) {
  const bubble = document.getElementById(id);
  if (bubble) bubble.remove();
}

export function saveChatHistory(type) {
  if (type === 'direct') {
    localStorage.setItem('aether_chat_direct', JSON.stringify(state.chatHistoryDirect));
  } else {
    localStorage.setItem('aether_chat_rag', JSON.stringify(state.chatHistoryRag));
  }
}

// ==========================================================================
// STRING & MARKDOWN PARSING HELPERS
// ==========================================================================
function formatChatMessageText(text) {
  if (!text) return '';
  
  // Escape HTML tags to prevent cross-site scripting
  let escaped = escapeHtml(text);

  // Parse ```code blocks```
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  escaped = escaped.replace(codeBlockRegex, (match, lang, code) => {
    const displayLang = lang || 'javascript';
    return `
      <div class="code-header">
        <span>${displayLang.toUpperCase()}</span>
        <button class="btn-copy-code">Copy Code</button>
      </div>
      <pre><code class="language-${displayLang}">${code.trim()}</code></pre>
    `;
  });

  // Parse inline `code`
  escaped = escaped.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // Parse bold **text**
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Convert double newlines to breaks
  escaped = escaped.replace(/\n\n/g, '<br><br>');

  return escaped;
}

function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
