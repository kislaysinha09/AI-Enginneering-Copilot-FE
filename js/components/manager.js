/* ==========================================================================
   AI ENGINEERING COPILOT - DOCUMENT MANAGER COMPONENT
   ========================================================================== */

import { state } from '../state.js';
import { renderDashboard, formatDate } from './dashboard.js';

export function setupDocumentIngestion() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const selectedFileName = document.getElementById('selected-file-name');
  const uploadForm = document.getElementById('upload-form');
  const btnSubmitUpload = document.getElementById('btn-submit-upload');
  const clearLedgerBtn = document.getElementById('btn-clear-ledger');

  if (!dropZone || !fileInput || !uploadForm) return;

  // Drag over effects
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-active');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-active');
    }, false);
  });

  // Handle file drop
  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      fileInput.files = files;
      updateFileLabel(files[0]);
    }
  });

  // Handle file browsing select
  fileInput.addEventListener('change', (e) => {
    if (fileInput.files.length > 0) {
      updateFileLabel(fileInput.files[0]);
    }
  });

  function updateFileLabel(file) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    selectedFileName.innerHTML = `<strong>${file.name}</strong> (${sizeMB} MB)`;
    selectedFileName.style.color = 'var(--text-main)';
    btnSubmitUpload.disabled = false;
  }

  // Clear Ledger Handler
  if (clearLedgerBtn) {
    clearLedgerBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your local document history index? This will reset the UI, but vectors stored on Pinecone remain unless purged directly.')) {
        state.documents = [];
        localStorage.setItem('aether_rag_docs', JSON.stringify([]));
        renderDashboard();
        renderDocumentLedger();
      }
    });
  }

  // Handle Form Submission / API call / Step Animations
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!fileInput.files || fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    btnSubmitUpload.disabled = true;

    // Display Progress pipeline
    const pipeline = document.getElementById('processing-pipeline');
    if (!pipeline) return;
    
    pipeline.classList.remove('hidden');

    const steps = {
      extract: document.getElementById('step-extract'),
      chunk: document.getElementById('step-chunk'),
      embed: document.getElementById('step-embed'),
      store: document.getElementById('step-store')
    };

    // Reset pipeline state
    Object.values(steps).forEach(s => {
      if (s) s.className = 'pipeline-step';
    });

    let isRequestDone = false;
    let responseData = null;
    let requestError = null;

    // Sequence progress stages
    async function animateSteps() {
      // 1. Text Extraction
      if (steps.extract) steps.extract.className = 'pipeline-step active';
      await sleep(1000);
      if (requestError) return;
      if (steps.extract) steps.extract.className = 'pipeline-step completed';

      // 2. Semantic Chunking
      if (steps.chunk) steps.chunk.className = 'pipeline-step active';
      await sleep(1000);
      if (requestError) return;
      if (steps.chunk) steps.chunk.className = 'pipeline-step completed';

      // 3. Vector Embeddings
      if (steps.embed) steps.embed.className = 'pipeline-step active';
      await sleep(1200);
      if (requestError) return;
      if (steps.embed) steps.embed.className = 'pipeline-step completed';

      // 4. Storing in Index
      if (steps.store) steps.store.className = 'pipeline-step active';
      
      // Keep pulsing until request is actually finished
      while (!isRequestDone) {
        await sleep(200);
      }

      if (requestError) {
        if (steps.store) steps.store.className = 'pipeline-step';
        alert(`Ingestion failed: ${requestError}`);
        pipeline.classList.add('hidden');
        btnSubmitUpload.disabled = false;
        return;
      }

      // Complete last step
      if (steps.store) steps.store.className = 'pipeline-step completed';
      await sleep(500);

      // Register successfully parsed file
      const newDoc = {
        name: responseData.fileName || file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type || 'text/plain',
        chunks: responseData.totalChunks || 1,
        date: new Date().toISOString()
      };

      state.documents.push(newDoc);
      localStorage.setItem('aether_rag_docs', JSON.stringify(state.documents));

      // Reset Form and update UI
      uploadForm.reset();
      selectedFileName.innerText = 'No file chosen';
      selectedFileName.style.color = 'var(--text-muted)';
      pipeline.classList.add('hidden');
      
      renderDashboard();
      renderDocumentLedger();
    }

    // Parallel execution: Start stepper animations AND backend fetch request
    const backendPromise = (async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${state.backendUrl}/api/documents/upload`, {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.details || errData.error || 'Server error');
        }

        responseData = await res.json();
      } catch (err) {
        console.error("Upload error details:", err);
        requestError = err.message;
      } finally {
        isRequestDone = true;
      }
    })();

    // Start UI animations
    animateSteps();
  });
}

// Render document registry ledger cards on Document manager view
export function renderDocumentLedger() {
  const ledgerList = document.getElementById('documents-ledger-list');
  if (!ledgerList) return;

  if (state.documents.length === 0) {
    ledgerList.innerHTML = `
      <div class="empty-ledger-card">
        <p>No documents found in vector registry.</p>
      </div>
    `;
    return;
  }

  ledgerList.innerHTML = '';
  state.documents.slice().reverse().forEach((doc, idx) => {
    // Reverse index calculation
    const originalIdx = state.documents.length - 1 - idx;
    
    // File Type Icons
    let fileSvg = `
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent-teal);">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    `;
    if (doc.name.endsWith('.pdf')) {
      fileSvg = `
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent-pink);">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 15h3a2 2 0 0 0 0-4H9v4z" />
        </svg>
      `;
    } else if (doc.name.endsWith('.docx') || doc.name.endsWith('.doc')) {
      fileSvg = `
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent-purple);">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="12" x2="12" y2="18" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      `;
    }

    const card = document.createElement('div');
    card.className = 'doc-ledger-card';
    card.innerHTML = `
      <div class="doc-card-info">
        <div style="display: flex; align-items: center; gap: 8px;">
          ${fileSvg}
          <span class="doc-card-title" title="${doc.name}">${doc.name}</span>
        </div>
        <div class="doc-card-meta">
          <div class="meta-item">
            <span>Size:</span>
            <span class="meta-accent">${doc.size}</span>
          </div>
          <div class="meta-item">
            <span>Chunks:</span>
            <span class="meta-accent">${doc.chunks || 0}</span>
          </div>
          <div class="meta-item">
            <span>Date:</span>
            <span>${formatDate(doc.date)}</span>
          </div>
        </div>
      </div>
      <button class="btn-delete-doc" data-index="${originalIdx}" title="Delete document tracking">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>
    `;
    ledgerList.appendChild(card);
  });

  // Attach delete events
  const deleteButtons = ledgerList.querySelectorAll('.btn-delete-doc');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetIdx = parseInt(btn.getAttribute('data-index'));
      state.documents.splice(targetIdx, 1);
      localStorage.setItem('aether_rag_docs', JSON.stringify(state.documents));
      renderDashboard();
      renderDocumentLedger();
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
