// js/ui.js — navbar and sidebar

import { getToken, clearToken, decodeJwtPayload, escapeHtml } from './config.js';

// ── Navbar ─────────────────────────────────────────────────────────────────

export function initNavbar() {
  const actionsEl = document.getElementById('navbar-actions');
  const token     = getToken();

  if (!actionsEl) return;

  if (token) {
    const payload = decodeJwtPayload(token);
    const name    = payload?.sub || payload?.username || payload?.email || 'User';

    actionsEl.innerHTML = `
      <span class="navbar__user">${escapeHtml(name)}</span>
      <button class="btn btn--ghost" id="logout-btn">Sign out</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', () => {
      clearToken();
      window.location.reload();
    });
  } else {
    actionsEl.innerHTML = `<button class="btn btn--primary" id="signin-btn">Sign in</button>`;
    document.getElementById('signin-btn').addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }
}

// ── Mobile sidebar ─────────────────────────────────────────────────────────

export function initMobileSidebar() {
  const hamburger = document.getElementById('hamburger-btn');
  const sidebar   = document.querySelector('.sidebar');
  const overlay   = document.getElementById('sidebar-overlay');

  if (!hamburger || !sidebar || !overlay) return;

  const open  = () => { sidebar.classList.add('is-open'); overlay.classList.add('is-open'); };
  const close = () => { sidebar.classList.remove('is-open'); overlay.classList.remove('is-open'); };

  hamburger.addEventListener('click', open);
  overlay.addEventListener('click', close);

  // Close sidebar on nav item click (mobile UX)
  sidebar.querySelectorAll('.sidebar__item').forEach(item => {
    item.addEventListener('click', close);
  });
}

// ── Sidebar nav ────────────────────────────────────────────────────────────

export function initSidebar({ onAllSnippets, onMySnippets, onMyReviews, onAddSnippet, onSettings }) {
  const allBtn      = document.getElementById('nav-all-snippets');
  const mySnipBtn   = document.getElementById('nav-my-snippets');
  const myBtn       = document.getElementById('nav-my-reviews');
  const addBtn      = document.getElementById('nav-add-btn');
  const settingsBtn = document.getElementById('nav-settings');

  const navItems = [allBtn, mySnipBtn, myBtn, settingsBtn];
  let prevActive = allBtn;

  function setActive(el) {
    navItems.forEach(b => b?.classList.remove('sidebar__item--active'));
    el?.classList.add('sidebar__item--active');
  }

  function restorePrev() { setActive(prevActive); }

  allBtn?.addEventListener('click', () => {
    prevActive = allBtn; setActive(allBtn); onAllSnippets?.();
  });
  mySnipBtn?.addEventListener('click', () => {
    prevActive = mySnipBtn; setActive(mySnipBtn); onMySnippets?.();
  });
  myBtn?.addEventListener('click', () => {
    prevActive = myBtn; setActive(myBtn); onMyReviews?.();
  });
  addBtn?.addEventListener('click',      () => { onAddSnippet?.(); });
  settingsBtn?.addEventListener('click', () => {
    // Remember the page that is really active now, so closing Settings highlights it again
    prevActive = navItems.find(b => b && b !== settingsBtn && b.classList.contains('sidebar__item--active')) || prevActive;
    setActive(settingsBtn); onSettings?.();
  });

  return { restorePrev };
}
