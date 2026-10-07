export function initSearchMenu() {
  const toggleButton = document.querySelector('#search-menu-toggle');
  const menu = document.querySelector('#search-menu');
  const searchInput = document.querySelector('#site-search');

  if (!toggleButton || !menu) {
    return;
  }

  function openMenu() {
    menu.hidden = false;
    toggleButton.setAttribute('aria-expanded', 'true');

    searchInput?.focus();
  }

  function closeMenu({ restoreFocus = true } = {}) {
    menu.hidden = true;
    toggleButton.setAttribute('aria-expanded', 'false');

    if (restoreFocus) {
      toggleButton.focus();
    }
  }

  function toggleMenu() {
    const isOpen = toggleButton.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      closeMenu();
      return;
    }

    openMenu();
  }

  toggleButton.addEventListener('click', toggleMenu);

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
    const clickedToggle = toggleButton.contains(event.target);

    if (!clickedInsideMenu && !clickedToggle) {
      closeMenu({ restoreFocus: false });
    }
  });
}
