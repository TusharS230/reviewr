// js/ui.js — navbar, sidebar, theme

import { getToken, clearToken, decodeJwtPayload } from './config.js';

// ── Theme ──────────────────────────────────────────────────────────────────

const THEME_KEY = 'reviewr_theme';

const ICON_MOON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75 9.75 9.75 0 0 1 8.25 6c0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 12c0 5.385 4.365 9.75 9.75 9.75 4.944 0 9.051-3.674 9.75-8.423-.249.175-.5.338-.748.425Z"/></svg>`;
const ICON_SUN  = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>`;

function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

export function initTheme() {
  applyTheme(getTheme());
}

export function initThemeToggle(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  const update = () => {
    const isDark = getTheme() === 'dark';
    btn.innerHTML = isDark ? ICON_SUN : ICON_MOON;
    btn.title     = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  };

  update();

  btn.addEventListener('click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    update();
  });
}

// ── Navbar ─────────────────────────────────────────────────────────────────

export function initNavbar() {
  const actionsEl = document.getElementById('navbar-actions');
  const token     = getToken();

  if (!actionsEl) return;

  if (token) {
    const payload = decodeJwtPayload(token);
    const name    = payload?.sub || payload?.username || payload?.email || 'User';

    actionsEl.innerHTML = `
      <span class="navbar__user">${name}</span>
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

export function initSidebar({ onAllSnippets, onMyReviews, onAddSnippet, onSettings }) {
  const allBtn      = document.getElementById('nav-all-snippets');
  const myBtn       = document.getElementById('nav-my-reviews');
  const addBtn      = document.getElementById('nav-add-btn');
  const settingsBtn = document.getElementById('nav-settings');

  const navItems = [allBtn, myBtn, settingsBtn];
  let prevActive = allBtn;

  function setActive(el) {
    navItems.forEach(b => b?.classList.remove('sidebar__item--active'));
    el?.classList.add('sidebar__item--active');
  }

  function restorePrev() {
    setActive(prevActive);
  }

  allBtn?.addEventListener('click', () => {
    prevActive = allBtn;
    setActive(allBtn);
    onAllSnippets?.();
  });

  myBtn?.addEventListener('click', () => {
    prevActive = myBtn;
    setActive(myBtn);
    onMyReviews?.();
  });

  addBtn?.addEventListener('click', () => { onAddSnippet?.(); });

  settingsBtn?.addEventListener('click', () => {
    setActive(settingsBtn);
    onSettings?.();
  });

  return { restorePrev };
}
