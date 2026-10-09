import { getSession, logout } from '../services/auth.js';

const ROUTES = {
  home: './',
  login: './login.html',
  create: './create.html',
};

function createLink(href, label) {
  const link = document.createElement('a');

  link.href = href;
  link.textContent = label;

  return link;
}

function createLogoutButton() {
  const button = document.createElement('button');

  button.type = 'button';
  button.textContent = 'Log out';
  button.dataset.logout = '';

  return button;
}

function renderHeaderNavigation(container, session) {
  if (!container) {
    return;
  }

  container.replaceChildren();

  if (!session) {
    container.append(createLink(ROUTES.login, 'Login'));
    return;
  }

  container.append(createLogoutButton());
}

function renderDesktopMegaNavigation(container, session) {
  if (!container) {
    return;
  }

  container.replaceChildren();

  if (session) {
    container.append(
      createLink(ROUTES.create, 'Create Article'),
      createLink('mailto:tip@pressly.no?subject=Pressly%20Information', 'Info'),
      createLink('mailto:tip@pressly.no?subject=Pressly%20Help', 'Help'),
    );

    return;
  }

  container.append(
    createLink('mailto:tip@pressly.no?subject=Pressly%20Information', 'Info'),
    createLink('mailto:tip@pressly.no?subject=Pressly%20Help', 'Help'),
  );
}

function renderMobileNavigation(container, session) {
  if (!container) {
    return;
  }

  container.replaceChildren();

  if (!session) {
    container.append(createLink(ROUTES.login, 'Login'));
    return;
  }

  container.append(
    createLink(ROUTES.create, 'Create Article'),
    createLogoutButton(),
  );
}

function bindLogoutButtons() {
  const logoutButtons = document.querySelectorAll('[data-logout]');

  logoutButtons.forEach((button) => {
    if (button.dataset.logoutBound === 'true') {
      return;
    }

    button.dataset.logoutBound = 'true';

    button.addEventListener('click', async () => {
      button.disabled = true;

      try {
        await logout();
        window.location.replace(ROUTES.home);
      } catch {
        button.disabled = false;
      }
    });
  });
}

export async function renderNavigation(container, providedSession = undefined) {
  let session = providedSession;

  if (session === undefined) {
    try {
      session = await getSession();
    } catch {
      session = null;
    }
  }

  const desktopMegaNavigation = document.querySelector(
    '#mega-account-navigation',
  );

  const mobileNavigation = document.querySelector('#mobile-navigation');

  renderHeaderNavigation(container, session);
  renderDesktopMegaNavigation(desktopMegaNavigation, session);
  renderMobileNavigation(mobileNavigation, session);

  bindLogoutButtons();

  return session;
}
