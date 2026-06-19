/* ==========================================================================
   AI ENGINEERING COPILOT - CENTRAL STATE MANAGEMENT
   ========================================================================== */

export const state = {
  activeView: 'dashboard',
  isServerOnline: false,
  backendUrl: '', // Configured dynamically via .env
  supabaseUrl: '', // Configured dynamically via .env
  supabaseAnonKey: '', // Configured dynamically via .env
  user: null, // Populated upon successful login
  session: null, // Stores active jwt credentials
  documents: [], // Array of { name, size, type, chunks, date }
  chatHistoryDirect: [], // Array of { sender: 'user'|'ai', text: string, timestamp: string }
  chatHistoryRag: [], // Array of { sender: 'user'|'ai', text: string, sources: array, timestamp: string }
};
