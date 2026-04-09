// js/auth.js — login page logic

import { API_BASE, initPasswordToggles } from './config.js';

document.addEventListener('DOMContentLoaded', () => initPasswordToggles());

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();

  const email    = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('error-message');

  errorEl.textContent = '';

  try {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error('Invalid credentials');

    const { token } = await res.json();
    localStorage.setItem('reviewr_jwt', token);
    window.location.href = 'index.html';
  } catch {
    errorEl.textContent = 'Invalid email or password. Please try again.';
  }
});
