export function initSearchMenu() {
  const toggle = document.querySelector('#search-menu-toggle');
  const menu = document.querySelector('#search-menu');
  const searchInput = document.querySelector('#site-search');

  if (!toggle || !menu) {
    return;
  }

  if (toggle.dataset.searchMenuInitialized === 'true') {
    return;
  }

  toggle.dataset.searchMenuInitialized = 'true';

  function isOpen() {
    return !menu.hidden;
  }

  function openMenu() {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('search-menu-open');
    window.requestAnimationFrame(() => {
      searchInput?.focus();
    });
  }

  function closeMenu({ restoreFocus = true } = {}) {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('search-menu-open');

    if (restoreFocus) {
      toggle.focus();
    }
  }

  toggle.addEventListener('click', () => {
    if (isOpen()) {
      closeMenu();
      return;
    }

    openMenu();
  });

  menu.addEventListener('click', (event) => {
    const link = event.target.closest('a');

    if (!link) {
      return;
    }

    closeMenu({
      restoreFocus: false,
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      closeMenu();
    }
  });

  const mobileQuery = window.matchMedia('(max-width: 43.75rem)');

  mobileQuery.addEventListener('change', (event) => {
    if (event.matches && isOpen()) {
      closeMenu({
        restoreFocus: false,
      });
    }
  });
}
