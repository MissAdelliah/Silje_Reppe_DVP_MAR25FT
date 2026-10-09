export function initSearchMenu() {
  const toggle = document.querySelector('#search-menu-toggle');
  const menu = document.querySelector('#search-menu');
  const searchInput = document.querySelector('#site-search');

  if (!toggle || !menu) {
    return;
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
    if (menu.hidden) {
      openMenu();
      return;
    }

    closeMenu();
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      closeMenu({
        restoreFocus: false,
      });
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      closeMenu();
    }
  });
}
