/* ==========================================================================
   AI ENGINEERING COPILOT - DASHBOARD COMPONENT
   ========================================================================== */

import { state } from '../state.js';

export function renderDashboard() {
  const statFiles = document.getElementById('stat-files-count');
  const statChunks = document.getElementById('stat-chunks-count');
  
  if (!statFiles || !statChunks) return;

  // Update Stats row counters
  const docCount = state.documents.length;
  let chunkCount = 0;
  state.documents.forEach(doc => {
    chunkCount += (doc.chunks || 0);
  });

  statFiles.innerText = docCount;
  statChunks.innerText = chunkCount;

  // Build Ingested Ledger Table
  const tableBody = document.getElementById('dashboard-ledger-body');
  if (!tableBody) return;

  if (state.documents.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-state">
        <td colspan="4" style="text-align: center; padding: 3rem 0; color: var(--text-sub);">
          <div class="empty-animation">📁</div>
          No files stored yet. Navigate to <strong>Document Manager</strong> to upload.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = '';
  state.documents.slice().reverse().forEach(doc => {
    const row = document.createElement('tr');
    
    // File Type badge
    let badgeClass = 'badge-txt';
    let typeName = 'TXT';
    if (doc.name.endsWith('.pdf')) {
      badgeClass = 'badge-pdf';
      typeName = 'PDF';
    } else if (doc.name.endsWith('.docx') || doc.name.endsWith('.doc')) {
      badgeClass = 'badge-doc';
      typeName = 'WORD';
    }

    row.innerHTML = `
      <td><div class="doc-name" title="${doc.name}">${doc.name}</div></td>
      <td><span class="badge ${badgeClass}">${typeName}</span></td>
      <td><strong>${doc.chunks || 0}</strong> chunks</td>
      <td style="color: var(--text-sub); font-size: 0.85rem;">${formatDate(doc.date)}</td>
    `;
    tableBody.appendChild(row);
  });
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
