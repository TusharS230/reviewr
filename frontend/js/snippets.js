// js/snippets.js — snippet fetch, render, post

import { API_BASE, getToken, escapeHtml, handleAuthError } from './config.js';

export async function loadSnippets() {
  const grid = document.getElementById('snippets-grid');
  grid.innerHTML = `<div class="state-empty"><p>Loading snippets...</p></div>`;

  try {
    const res = await fetch(`${API_BASE}/snippets`);
    if (!res.ok) throw new Error(`${res.status}`);

    const snippets = await res.json();
    grid.innerHTML = '';

    if (!snippets.length) {
      grid.innerHTML = `
        <div class="state-empty">
          <p class="state-empty__title">No snippets yet</p>
          <p>Be the first to add one.</p>
        </div>`;
      return;
    }

    snippets.forEach(s => grid.appendChild(buildCard(s)));
  } catch {
    document.getElementById('snippets-grid').innerHTML = `
      <div class="state-empty">
        <p class="state-empty__title">Connection failed</p>
        <p>Could not reach the backend. Is Spring Boot running on port 8080?</p>
      </div>`;
  }
}

function buildCard(snippet) {
  const title   = escapeHtml(snippet.snippet_title || snippet.title || 'Untitled');
  const lang    = escapeHtml(snippet.language);
  const content = escapeHtml(snippet.content);

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card__header">
      <span class="card__title">${title}</span>
      <span class="badge badge--lang">${lang}</span>
    </div>
    <pre class="card__code">${content}</pre>
    <div class="card__footer card__footer--row">
      <button class="btn btn--ghost" data-view-code data-snippet-id="${snippet.id}"
        data-title="${title}" data-lang="${lang}" data-content="${content}">View Code</button>
      <button class="btn btn--ghost" data-snippet-id="${snippet.id}">View Reviews</button>
    </div>
  `;
  return card;
}

export function initAddSnippetModal(onSuccess) {
  const modal    = document.getElementById('add-modal');
  const closeBtn = document.getElementById('close-add-modal');
  const form     = document.getElementById('add-snippet-form');

  const open  = () => modal.classList.remove('u-hidden');
  const close = () => { modal.classList.add('u-hidden'); form.reset(); };

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

    try {
      const res = await fetch(`${API_BASE}/snippets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) { close(); onSuccess?.(); }
      else if (!handleAuthError(res.status)) throw new Error(`${res.status}`);
    } catch (err) {
      console.error('Save snippet failed:', err);
    }
  });

  return { open, close };
}
