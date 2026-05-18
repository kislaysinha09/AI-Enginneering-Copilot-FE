/* ==========================================================================
   AI ENGINEERING COPILOT - DYNAMIC RUNTIME CONFIGURATION
   ========================================================================== */

import { state } from './state.js';

export async function loadEnv() {
  try {
    const res = await fetch('/.env');
    if (res.ok) {
      const text = await res.text();
      const env = {};
      text.split('\n').forEach(line => {
        // Skip comments and empty lines
        if (!line || line.trim().startsWith('#')) return;
        
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
          env[key] = value;
        }
      });
      
      if (env.BACKEND_URL) {
        state.backendUrl = env.BACKEND_URL;
        console.log('Loaded backend URL from .env:', state.backendUrl);
      } else {
        console.error('Error: BACKEND_URL key is missing in the .env file!');
      }
    } else {
      console.error('Error: Failed to fetch the .env configuration file!');
    }
  } catch (err) {
    console.error('Error loading .env file:', err);
  }
}
