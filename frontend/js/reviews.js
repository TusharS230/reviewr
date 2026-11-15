// js/reviews.js — review fetch, render, post

import API_BASE_URL from './config.js';
import { getToken, escapeHtml, handleAuthError, readError } from './config.js';

export function initReviewsModal() {
  const modal    = document.getElementById('reviews-modal');
  const closeBtn = document.getElementById('close-reviews-modal');
  const form     = document.getElementById('add-review-form');
  const msgEl    = document.getElementById('review-message');
  const showMsg  = (text, ok = false) => {
    if (!msgEl) return;
    msgEl.className   = `settings-msg ${ok ? 'settings-msg--success' : 'settings-msg--error'}`;
    msgEl.textContent = text;
  };

  const close = () => { modal.classList.add('u-hidden'); form.reset(); showMsg(''); };
  closeBtn?.addEventListener('click', close);
  modal?.addEventListener('click', e => { if (e.target === modal) close(); });

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const token = getToken();
    if (!token) { window.location.href = 'login.html'; return; }

    const snippetId = document.getElementById('review-snippet-id').value;
    const payload = {
      rating:  parseInt(document.getElementById('review-rating').value, 10),
      comment: document.getElementById('review-comment').value.trim(),
      snippet: { id: parseInt(snippetId, 10) },
    };

    if (!payload.comment) { showMsg('Please write a comment.'); return; }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    showMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) { form.reset(); showMsg('Review added.', true); loadReviews(snippetId); }
      else if (!handleAuthError(res.status)) showMsg(await readError(res, 'Could not save the review.'));
    } catch (err) {
      console.error('Save review failed:', err);
      showMsg('Could not reach the server. Please try again.');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

export async function openReviews(id) {
  document.getElementById('add-review-form').reset();
  document.getElementById('review-snippet-id').value = id;
  const msgEl = document.getElementById('review-message');
  if (msgEl) msgEl.textContent = '';
  document.getElementById('reviews-modal').classList.remove('u-hidden');
  loadReviews(id);
}

async function loadReviews(id) {
  const container = document.getElementById('reviews-container');
  container.innerHTML = `<div class="state-empty"><p>Loading reviews...</p></div>`;

  try {
    const res = await fetch(`${API_BASE_URL}/reviews/snippet/${id}`);
    if (!res.ok) throw new Error(`${res.status}`);

    const reviews = await res.json();
    container.innerHTML = '';

    if (!reviews.length) {
      container.innerHTML = `<div class="state-empty"><p>No reviews yet for this snippet.</p></div>`;
      return;
    }

    reviews.forEach(r => {
      const el = document.createElement('div');
      el.className = 'review-card';
      el.innerHTML = `
        <div class="review-card__header">
          <span class="review-card__author">${escapeHtml(r.authorName)}</span>
          <span class="badge badge--rating">${Number(r.rating)} / 5</span>
        </div>
        <p class="review-card__comment">${escapeHtml(r.comment)}</p>
      `;
      container.appendChild(el);
    });
  } catch (err) {
    console.error('Load reviews failed:', err);
    document.getElementById('reviews-container').innerHTML =
      `<div class="state-empty"><p class="text-danger">Could not load reviews.</p></div>`;
  }
}
