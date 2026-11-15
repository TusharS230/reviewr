// js/register.js — registration page logic

import API_BASE_URL from './config.js';
import { initPasswordToggles, readError } from './config.js';

document.addEventListener('DOMContentLoaded', () => initPasswordToggles());

document.getElementById('register-form').addEventListener('submit', async e => {
  e.preventDefault();

  const username  = document.getElementById('reg-username').value.trim();
  const email     = document.getElementById('reg-email').value.trim();
  const password  = document.getElementById('reg-password').value;
  const messageEl = document.getElementById('reg-message');

  messageEl.textContent = '';
  messageEl.className   = 'auth-card__error';

  if (!username) { messageEl.textContent = 'Please enter a username.'; return; }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  let created = false;

  try {
    const res = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) {
      messageEl.textContent = await readError(res, 'Registration failed. Please try again.');
      return;
    }

    created = true;
    messageEl.className   = 'auth-card__success';
    messageEl.textContent = 'Account created! Redirecting to sign in...';

    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
  } catch (err) {
    console.error('Registration error:', err);
    messageEl.textContent = 'Could not reach the server. Please try again in a moment.';
  } finally {
    if (!created) submitBtn.disabled = false;
  }
});
