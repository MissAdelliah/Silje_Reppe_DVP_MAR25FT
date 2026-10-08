export function initSearchMenu() {
  const desktopToggle = document.querySelector('#search-menu-toggle');
  const mobileToggle = document.querySelector('#mobile-menu-toggle');
  const menu = document.querySelector('#search-menu');
  const searchInput = document.querySelector('#site-search');
  const toggleButtons = [desktopToggle, mobileToggle].filter(Boolean);

  if (!menu || !toggleButtons.length) {
    return;
  }

  let lastTrigger = null;

  function setExpandedState(isExpanded) {
    toggleButtons.forEach((button) => {
      button.setAttribute('aria-expanded', String(isExpanded));
    });

    if (mobileToggle) {
      mobileToggle.setAttribute(
        'aria-label',
        isExpanded ? 'Close menu' : 'Open menu',
      );
    }
  }

  function openMenu(trigger) {
    lastTrigger = trigger;

    menu.hidden = false;
    document.body.classList.add('menu-open');

    setExpandedState(true);

    if (trigger === desktopToggle) {
      searchInput?.focus();
    }
  }

  function closeMenu({ restoreFocus = true } = {}) {
    menu.hidden = true;
    document.body.classList.remove('menu-open');

    setExpandedState(false);

    if (restoreFocus && lastTrigger && document.contains(lastTrigger)) {
      lastTrigger.focus();
    }

    lastTrigger = null;
  }

  function toggleMenu(event) {
    if (!menu.hidden) {
      closeMenu();
      return;
    }

    openMenu(event.currentTarget);
  }

  toggleButtons.forEach((button) => {
    button.addEventListener('click', toggleMenu);
  });

  menu.addEventListener('click', (event) => {
    const link = event.target.closest('a');

    if (link) {
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

  document.addEventListener('click', (event) => {
    if (menu.hidden) {
      return;
    }

    const clickedInsideMenu = menu.contains(event.target);

    const clickedToggle = toggleButtons.some((button) =>
      button.contains(event.target),
    );

    if (!clickedInsideMenu && !clickedToggle) {
      closeMenu({
        restoreFocus: false,
      });
    }
  });
}
