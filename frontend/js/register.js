// js/register.js — registration page logic

import { API_BASE, initPasswordToggles } from './config.js';

document.addEventListener('DOMContentLoaded', () => initPasswordToggles());

document.getElementById('register-form').addEventListener('submit', async e => {
  e.preventDefault();

  const username  = document.getElementById('reg-username').value;
  const email     = document.getElementById('reg-email').value;
  const password  = document.getElementById('reg-password').value;
  const messageEl = document.getElementById('reg-message');

  messageEl.textContent = '';
  messageEl.className   = 'auth-card__error';

  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) throw new Error('Registration failed. Email might already be in use.');

    messageEl.className   = 'auth-card__success';
    messageEl.textContent = 'Account created! Redirecting to sign in...';

    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
  } catch (err) {
    console.error('Registration error:', err);
    messageEl.textContent = err.message;
  }
});
