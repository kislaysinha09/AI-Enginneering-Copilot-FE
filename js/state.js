/* ==========================================================================
   AI ENGINEERING COPILOT - CENTRAL STATE MANAGEMENT
   ========================================================================== */

export const state = {
  activeView: 'dashboard',
  isServerOnline: false,
  backendUrl: '', // Configured dynamically via .env
  documents: [], // Array of { name, size, type, chunks, date }
  chatHistoryDirect: [], // Array of { sender: 'user'|'ai', text: string, timestamp: string }
  chatHistoryRag: [], // Array of { sender: 'user'|'ai', text: string, sources: array, timestamp: string }
};
