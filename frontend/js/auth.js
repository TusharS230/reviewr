// js/auth.js — login page logic

import API_BASE_URL from './config.js';
import { initPasswordToggles, getToken, readError } from './config.js';

// Already signed in? Go straight to the dashboard.
if (getToken()) window.location.replace('index.html');

document.addEventListener('DOMContentLoaded', () => initPasswordToggles());

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('error-message');

  const submitBtn = e.target.querySelector('button[type="submit"]');
  errorEl.textContent = '';
  submitBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      errorEl.textContent = await readError(res, 'Invalid email or password.');
      return;
    }

    const { token } = await res.json();
    localStorage.setItem('reviewr_jwt', token);
    window.location.href = 'index.html';
  } catch {
    errorEl.textContent = 'Could not reach the server. Please try again in a moment.';
  } finally {
    submitBtn.disabled = false;
  }
});
