// js/settings.js — settings modal (change password)

import API_BASE_URL from './config.js';
import { getToken, handleAuthError, readError } from './config.js';

export function initSettingsModal(onClose) {
  const modal    = document.getElementById('settings-modal');
  const closeBtn = document.getElementById('close-settings-modal');
  const form     = document.getElementById('change-password-form');
  const msgEl    = document.getElementById('settings-message');

  const open  = () => {
    if (!getToken()) { window.location.href = 'login.html'; return; }
    form.reset();
    msgEl.textContent = '';
    msgEl.className   = 'settings-msg';
    modal.classList.remove('u-hidden');
  };
  const close = () => {
    modal.classList.add('u-hidden');
    onClose?.();
  };

  closeBtn?.addEventListener('click', close);
  modal?.addEventListener('click', e => { if (e.target === modal) close(); });

  form?.addEventListener('submit', async e => {
    e.preventDefault();

    const token = getToken();
    if (!token) { window.location.href = 'login.html'; return; }

    const currentPassword = document.getElementById('current-password').value;
    const newPassword     = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    msgEl.textContent = '';

    if (newPassword !== confirmPassword) {
      msgEl.className   = 'settings-msg settings-msg--error';
      msgEl.textContent = 'New passwords do not match.';
      return;
    }

    if (newPassword === currentPassword) {
      msgEl.className   = 'settings-msg settings-msg--error';
      msgEl.textContent = 'New password must be different from the current one.';
      return;
    }

    if (newPassword.length < 6) {
      msgEl.className   = 'settings-msg settings-msg--error';
      msgEl.textContent = 'New password must be at least 6 characters.';
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        msgEl.className   = 'settings-msg settings-msg--success';
        msgEl.textContent = 'Password updated successfully.';
        form.reset();
      } else if (!handleAuthError(res.status)) {
        msgEl.className   = 'settings-msg settings-msg--error';
        msgEl.textContent = await readError(res, 'Failed to update password. Please try again.');
      }
    } catch (err) {
      console.error('Change password failed:', err);
      msgEl.className   = 'settings-msg settings-msg--error';
      msgEl.textContent = 'Could not reach the server. Please try again.';
    }
  });

  return { open, close };
}
