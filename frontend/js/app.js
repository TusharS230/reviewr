// js/app.js — main entry point

import { getToken, API_BASE, escapeHtml, handleAuthError, initPasswordToggles } from './config.js';
import { initTheme, initThemeToggle, initNavbar, initSidebar, initMobileSidebar } from './ui.js';
import { loadSnippets, initAddSnippetModal } from './snippets.js';
import { initReviewsModal, openReviews } from './reviews.js';
import { initSettingsModal } from './settings.js';

// Apply theme before paint to avoid flash
initTheme();

window.openReviews = openReviews;

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle('theme-toggle-btn');
  initNavbar();
  initMobileSidebar();
  initPasswordToggles();

  const { open: openAddModal }      = initAddSnippetModal(loadSnippets);

  const { restorePrev } = initSidebar({
    onAllSnippets: loadSnippets,
    onMyReviews:   loadMyReviews,
    onAddSnippet:  openAddModal,
    onSettings:    () => openSettingsModal(),
  });

  const { open: openSettingsModal } = initSettingsModal(restorePrev);

  initReviewsModal();
  loadSnippets();

  document.getElementById('snippets-grid').addEventListener('click', e => {
    const reviewBtn = e.target.closest('[data-snippet-id]:not([data-view-code])');
    const codeBtn   = e.target.closest('[data-view-code]');
    if (reviewBtn) openReviews(reviewBtn.dataset.snippetId);
    if (codeBtn)   openCodeViewer(codeBtn);
  });

  initCodeViewer();
});

function initCodeViewer() {
  const modal    = document.getElementById('code-modal');
  const closeBtn = document.getElementById('close-code-modal');
  const copyBtn  = document.getElementById('code-copy-btn');

  const close = () => modal.classList.add('u-hidden');
  closeBtn?.addEventListener('click', close);
  modal?.addEventListener('click', e => { if (e.target === modal) close(); });

  copyBtn?.addEventListener('click', () => {
    const text = document.getElementById('code-modal-content').textContent;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
    });
  });
}

function openCodeViewer(btn) {
  document.getElementById('code-modal-title').textContent   = btn.dataset.title;
  document.getElementById('code-modal-lang').textContent    = btn.dataset.lang;
  document.getElementById('code-modal-content').textContent = btn.dataset.content;
  document.getElementById('code-modal').classList.remove('u-hidden');
}

async function loadMyReviews() {
  const token = getToken();
  if (!token) { window.location.href = 'login.html'; return; }

  const grid = document.getElementById('snippets-grid');
  document.getElementById('page-title').textContent    = 'My Reviews';
  document.getElementById('page-subtitle').textContent = 'Reviews you have left on snippets.';
  grid.innerHTML = `<div class="state-empty"><p>Loading your reviews...</p></div>`;

  try {
    const res = await fetch(`${API_BASE}/reviews/my-reviews`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) { handleAuthError(res.status); throw new Error(`${res.status}`); }

    const reviews = await res.json();
    grid.innerHTML = '';

    if (!reviews.length) {
      grid.innerHTML = `
        <div class="state-empty">
          <p class="state-empty__title">No reviews yet</p>
          <p>You haven't reviewed any snippets yet.</p>
        </div>`;
      return;
    }

    reviews.forEach(r => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card__header">
          <span class="card__title">${escapeHtml(r.snippetTitle || 'Untitled Snippet')}</span>
          <span class="badge badge--rating">${r.rating} / 5</span>
        </div>
        <div class="card__footer">
          <p class="review-card__comment">${escapeHtml(r.comment)}</p>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('Load my reviews failed:', err);
    grid.innerHTML = `
      <div class="state-empty">
        <p class="state-empty__title">Failed to load</p>
        <p>Could not fetch your reviews. Please try again.</p>
      </div>`;
  }
}
