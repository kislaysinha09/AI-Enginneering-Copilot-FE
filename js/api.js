/* ==========================================================================
   AI ENGINEERING COPILOT - BACKEND API INTERACTION
   ========================================================================== */

import { state } from './state.js';

export function setupServerPing() {
  const statusDot = document.getElementById('server-status-dot');
  const statusText = document.getElementById('server-status-text');

  async function checkConnection() {
    if (!state.backendUrl) {
      setOffline();
      return;
    }

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000); // 2 sec timeout

      const res = await fetch(`${state.backendUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(id);

      if (res.ok) {
        setOnline();
      } else {
        setOffline();
      }
    } catch (err) {
      setOffline();
    }
  }

  function setOnline() {
    state.isServerOnline = true;
    statusDot.className = 'status-dot online';
    statusText.innerText = 'Neural Engine Connected';
  }

  // Exposed for debugging/manual triggers
  window.triggerHealthCheck = checkConnection;

  function setOffline() {
    state.isServerOnline = false;
    statusDot.className = 'status-dot offline';
    statusText.innerText = 'Neural Engine Offline';
  }

  // Initial check and run checker every 10 seconds
  checkConnection();
  setInterval(checkConnection, 10000);
}
