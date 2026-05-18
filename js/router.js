/* ==========================================================================
   AI ENGINEERING COPILOT - CLIENT SIDE ROUTER
   ========================================================================== */

import { state } from './state.js';

export function setupRouter() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const views = document.querySelectorAll('.view');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetViewId = btn.getAttribute('data-view');
      
      // Update sidebar buttons active state
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Transition Views
      views.forEach(view => {
        view.classList.remove('active');
        if (view.id === `view-${targetViewId}`) {
          // Trigger slight fade-in delay
          setTimeout(() => {
            view.classList.add('active');
          }, 50);
        }
      });

      state.activeView = targetViewId;
      
      // If switching to chat views, auto-scroll to bottom of chats
      if (targetViewId === 'chat-direct') {
        scrollToBottom('direct-chat-viewport');
      } else if (targetViewId === 'chat-rag') {
        scrollToBottom('rag-chat-viewport');
      }
    });
  });

  // Dashboard link click to documents
  const goToUploadBtn = document.getElementById('btn-go-to-upload');
  if (goToUploadBtn) {
    goToUploadBtn.addEventListener('click', () => {
      const docNavBtn = document.querySelector('.nav-btn[data-view="documents"]');
      if (docNavBtn) docNavBtn.click();
    });
  }
}

export function scrollToBottom(elementId) {
  const container = document.getElementById(elementId);
  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  }
}
