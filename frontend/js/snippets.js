// js/snippets.js — snippet fetch, render, post

import API_BASE_URL from './config.js';
import { getToken, escapeHtml, handleAuthError, readError, timeAgo } from './config.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function getFilters() {
  return {
    lang: document.getElementById('filter-language')?.value || '',
    sort: document.getElementById('filter-sort')?.value    || 'newest',
  };
}

function sortSnippets(snippets, sort) {
  return [...snippets].sort((a, b) => {
    if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === 'title')  return (a.snippet_title || a.title || '').localeCompare(b.snippet_title || b.title || '');
    // newest (default)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

function renderGrid(snippets, emptyMsg = 'No snippets found.') {
  const grid = document.getElementById('snippets-grid');
  grid.innerHTML = '';

  if (!snippets.length) {
    grid.innerHTML = `<div class="state-empty"><p class="state-empty__title">${escapeHtml(emptyMsg)}</p></div>`;
    return;
  }

  snippets.forEach(s => grid.appendChild(buildCard(s)));
}

// ── Load all snippets (with filter + sort) ─────────────────────────────────

export async function loadSnippets() {
  const grid = document.getElementById('snippets-grid');
  grid.innerHTML = `<div class="state-empty"><p>Loading snippets...</p></div>`;

  const { lang, sort } = getFilters();
  const url = lang ? `${API_BASE_URL}/snippets?lang=${encodeURIComponent(lang)}` : `${API_BASE_URL}/snippets`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status}`);

    const snippets = sortSnippets(await res.json(), sort);
    renderGrid(snippets, 'No snippets yet. Be the first to add one.');
  } catch {
    document.getElementById('snippets-grid').innerHTML = `
      <div class="state-empty">
        <p class="state-empty__title">Connection failed</p>
        <p>Could not load snippets. Please try again in a moment.</p>
      </div>`;
  }
}

// ── Load my snippets (with filter + sort) ──────────────────────────────────

export async function loadMySnippets() {
  const token = getToken();
  if (!token) { window.location.href = 'login.html'; return; }

  const grid = document.getElementById('snippets-grid');
  grid.innerHTML = `<div class="state-empty"><p>Loading your snippets...</p></div>`;

  const { lang, sort } = getFilters();
  const url = lang
    ? `${API_BASE_URL}/snippets/my-snippets?lang=${encodeURIComponent(lang)}`
    : `${API_BASE_URL}/snippets/my-snippets`;

  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      if (handleAuthError(res.status)) return;
      throw new Error(`${res.status}`);
    }

    const snippets = sortSnippets(await res.json(), sort);
    renderGrid(snippets, "You haven't added any snippets yet.");
  } catch (err) {
    console.error('Load my snippets failed:', err);
    document.getElementById('snippets-grid').innerHTML = `
      <div class="state-empty">
        <p class="state-empty__title">Failed to load</p>
        <p>Could not fetch your snippets. Please try again.</p>
      </div>`;
  }
}

// ── Card builder ───────────────────────────────────────────────────────────

function buildCard(snippet) {
  const title   = escapeHtml(snippet.snippet_title || snippet.title || 'Untitled');
  const lang    = escapeHtml(snippet.language);
  const content = escapeHtml(snippet.content);
  const meta    = [snippet.authorName && `by ${snippet.authorName}`, timeAgo(snippet.createdAt)]
    .filter(Boolean).join(' · ');

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card__header">
      <span class="card__title">${title}</span>
      <span class="badge badge--lang">${lang}</span>
    </div>
    ${meta ? `<p class="card__meta">${escapeHtml(meta)}</p>` : ''}
    <pre class="card__code">${content}</pre>
    <div class="card__footer card__footer--row">
      <button class="btn btn--ghost" data-view-code data-snippet-id="${snippet.id}"
        data-title="${title}" data-lang="${lang}" data-content="${content}">View Code</button>
      <button class="btn btn--ghost" data-snippet-id="${snippet.id}" data-title="${title}">View Reviews</button>
    </div>
  `;
  return card;
}

// ── Add Snippet Modal ──────────────────────────────────────────────────────

export function initAddSnippetModal(onSuccess) {
  const modal    = document.getElementById('add-modal');
  const closeBtn = document.getElementById('close-add-modal');
  const form     = document.getElementById('add-snippet-form');
  const msgEl    = document.getElementById('add-snippet-message');
  const showMsg  = text => {
    if (!msgEl) return;
    msgEl.className   = 'settings-msg settings-msg--error';
    msgEl.textContent = text;
  };

  const open  = () => {
    if (!getToken()) { window.location.href = 'login.html'; return; }
    modal.classList.remove('u-hidden');
  };
  const close = () => { modal.classList.add('u-hidden'); form.reset(); showMsg(''); };

  closeBtn?.addEventListener('click', close);
  modal?.addEventListener('click', e => { if (e.target === modal) close(); });

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const token = getToken();
    if (!token) { window.location.href = 'login.html'; return; }

    const payload = {
      snippet_title: document.getElementById('input-title').value,
      language:      document.getElementById('input-language').value,
      content:       document.getElementById('input-content').value,
    };
    payload.snippet_title = payload.snippet_title.trim();

    if (!payload.snippet_title || !payload.content.trim()) {
      showMsg('Please add a title and some code.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    showMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/snippets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) { close(); onSuccess?.(); }
      else if (!handleAuthError(res.status)) showMsg(await readError(res, 'Could not save the snippet.'));
    } catch (err) {
      console.error('Save snippet failed:', err);
      showMsg('Could not reach the server. Please try again.');
    } finally {
      submitBtn.disabled = false;
    }
  });

  return { open, close };
}
