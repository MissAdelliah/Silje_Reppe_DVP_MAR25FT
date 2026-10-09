export function initMobileMenu() {
  const toggle = document.querySelector('#mobile-menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  const backdrop = document.querySelector('#mobile-menu-backdrop');

  if (!toggle || !menu || !backdrop) {
    return;
  }

  function isOpen() {
    return toggle.getAttribute('aria-expanded') === 'true';
  }

  function openMenu() {
    menu.hidden = false;
    backdrop.hidden = false;

    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');

    document.body.classList.add('mobile-menu-open');
  }

  function closeMenu({ restoreFocus = true } = {}) {
    menu.hidden = true;
    backdrop.hidden = true;

    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');

    document.body.classList.remove('mobile-menu-open');

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

  backdrop.addEventListener('click', () => {
    closeMenu();
  });

  menu.addEventListener('click', (event) => {
    const navigationItem = event.target.closest('a, [data-logout]');

    if (navigationItem) {
      closeMenu({
        restoreFocus: false,
      });
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      closeMenu();
    }
  });

  const desktopQuery = window.matchMedia('(min-width: 43.8125rem)');

  desktopQuery.addEventListener('change', (event) => {
    if (event.matches && isOpen()) {
      closeMenu({
        restoreFocus: false,
      });
    }
  });
}
