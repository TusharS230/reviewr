// js/app.js — main entry point

import API_BASE_URL from './config.js';
import { getToken, escapeHtml, handleAuthError, initPasswordToggles } from './config.js';
import { initTheme, initThemeToggle, initNavbar, initSidebar, initMobileSidebar } from './ui.js';
import { loadSnippets, loadMySnippets, initAddSnippetModal } from './snippets.js';
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

  const { open: openAddModal } = initAddSnippetModal(showAllSnippets);

  const { restorePrev } = initSidebar({
    onAllSnippets:  showAllSnippets,
    onMySnippets:   loadMySnippetsView,
    onMyReviews:    loadMyReviews,
    onAddSnippet:   openAddModal,
    onSettings:     () => openSettingsModal(),
  });

  const { open: openSettingsModal } = initSettingsModal(restorePrev);

  initReviewsModal();
  initFilterBar();
  showAllSnippets();

  document.getElementById('snippets-grid').addEventListener('click', e => {
    const reviewBtn = e.target.closest('[data-snippet-id]:not([data-view-code])');
    const codeBtn   = e.target.closest('[data-view-code]');
    if (reviewBtn) openReviews(reviewBtn.dataset.snippetId);
    if (codeBtn)   openCodeViewer(codeBtn);
  });

  initCodeViewer();
});

// current view tracker — used by filter bar to re-run the right loader
let currentView = 'all'; // 'all' | 'mine'

function showFilterBar(show) {
  const bar = document.getElementById('filter-bar');
  if (bar) bar.style.display = show ? '' : 'none';
}

function initFilterBar() {
  const langEl  = document.getElementById('filter-language');
  const sortEl  = document.getElementById('filter-sort');
  const resetEl = document.getElementById('filter-reset');

  const apply = () => { currentView === 'mine' ? loadMySnippets() : loadSnippets(); };

  langEl?.addEventListener('change', apply);
  sortEl?.addEventListener('change', apply);
  resetEl?.addEventListener('click', () => {
    if (langEl) langEl.value = '';
    if (sortEl) sortEl.value = 'newest';
    apply();
  });
}

function showAllSnippets() {
  currentView = 'all';
  document.getElementById('page-title').textContent    = 'Community Snippets';
  document.getElementById('page-subtitle').textContent = 'Browse and review code shared by other developers.';
  const allBtn = document.getElementById('nav-all-snippets');
  document.querySelectorAll('.sidebar__item').forEach(b => b.classList.remove('sidebar__item--active'));
  allBtn?.classList.add('sidebar__item--active');
  showFilterBar(true);
  loadSnippets();
}

function loadMySnippetsView() {
  currentView = 'mine';
  document.getElementById('page-title').textContent    = 'My Snippets';
  document.getElementById('page-subtitle').textContent = 'Code snippets you have shared.';
  const myBtn = document.getElementById('nav-my-snippets');
  document.querySelectorAll('.sidebar__item').forEach(b => b.classList.remove('sidebar__item--active'));
  myBtn?.classList.add('sidebar__item--active');
  showFilterBar(true);
  loadMySnippets();
}

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
  showFilterBar(false);
  grid.innerHTML = `<div class="state-empty"><p>Loading your reviews...</p></div>`;

  try {
    const res = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
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
