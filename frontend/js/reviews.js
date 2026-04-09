// js/reviews.js — review fetch, render, post

import { API_BASE, getToken, escapeHtml, handleAuthError } from './config.js';

export function initReviewsModal() {
  const modal    = document.getElementById('reviews-modal');
  const closeBtn = document.getElementById('close-reviews-modal');
  const form     = document.getElementById('add-review-form');

  const close = () => modal.classList.add('u-hidden');
  closeBtn?.addEventListener('click', close);
  modal?.addEventListener('click', e => { if (e.target === modal) close(); });

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const token = getToken();
    if (!token) { window.location.href = 'login.html'; return; }

    const snippetId = document.getElementById('review-snippet-id').value;
    const payload = {
      rating:  parseInt(document.getElementById('review-rating').value),
      comment: document.getElementById('review-comment').value,
      snippet: { id: parseInt(snippetId) },
    };

    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) { form.reset(); loadReviews(snippetId); }
      else if (!handleAuthError(res.status)) throw new Error(`${res.status}`);
    } catch (err) {
      console.error('Save review failed:', err);
    }
  });
}

export async function openReviews(id) {
  document.getElementById('review-snippet-id').value = id;
  document.getElementById('reviews-modal').classList.remove('u-hidden');
  loadReviews(id);
}

async function loadReviews(id) {
  const container = document.getElementById('reviews-container');
  container.innerHTML = `<div class="state-empty"><p>Loading reviews...</p></div>`;

  try {
    const res = await fetch(`${API_BASE}/reviews/snippet/${id}`);
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
          <span class="badge badge--rating">${r.rating} / 5</span>
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
