/* ==========================================================================
   AI ENGINEERING COPILOT - MODULAR INITIALIZER ENTRYPOINT
   ========================================================================== */

import { state } from './js/state.js';
import { loadEnv } from './js/config.js';
import { setupRouter } from './js/router.js';
import { setupServerPing } from './js/api.js';
import { renderDashboard } from './js/components/dashboard.js';
import { setupDocumentIngestion, renderDocumentLedger } from './js/components/manager.js';
import { setupChats } from './js/components/chats.js';

// Expose state globally for browser console access & debugging comfort
window.state = state;

document.addEventListener('DOMContentLoaded', async () => {
  await loadEnv();
  initLocalStorage();
  setupRouter();
  setupServerPing();
  setupDocumentIngestion();
  setupChats();
  renderDashboard();
  renderDocumentLedger();
});

// Load variables from localStorage to persist user history
function initLocalStorage() {
  const storedDocs = localStorage.getItem('aether_rag_docs');
  if (storedDocs) {
    state.documents = JSON.parse(storedDocs);
  }

  const storedDirectChat = localStorage.getItem('aether_chat_direct');
  if (storedDirectChat) {
    state.chatHistoryDirect = JSON.parse(storedDirectChat);
  }

  const storedRagChat = localStorage.getItem('aether_chat_rag');
  if (storedRagChat) {
    state.chatHistoryRag = JSON.parse(storedRagChat);
  }
}
