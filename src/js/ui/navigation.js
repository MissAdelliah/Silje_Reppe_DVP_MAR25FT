import { getSession, logout } from '../services/auth.js';

function createLink(href, label) {
  const link = document.createElement('a');

  link.href = href;
  link.textContent = label;

  return link;
}

function createLabel(label) {
  const element = document.createElement('span');

  element.className = 'mega-account-navigation__label';
  element.textContent = label;

  return element;
}

function createLogoutButton() {
  const button = document.createElement('button');

  button.type = 'button';
  button.dataset.logout = '';
  button.textContent = 'Log out';

  return button;
}

function renderHeaderNavigation(container, session) {
  if (!container) {
    return;
  }

  container.replaceChildren();

  if (!session) {
    container.append(createLink('/login.html', 'Login'));
    return;
  }

  container.append(createLogoutButton());
}

function renderMegaNavigation(container, session) {
  if (!container) {
    return;
  }

  container.replaceChildren();

  if (session) {
    container.append(
      createLabel('My account'),
      createLink('mailto:tip@pressly.no?subject=Pressly%20Information', 'Info'),
      createLink('mailto:tip@pressly.no?subject=Pressly%20Help', 'Help'),
      createLink('/create.html', 'Create Article'),
    );

    return;
  }

  container.append(
    createLink('/login.html', 'My account'),
    createLink('mailto:tip@pressly.no?subject=Pressly%20Information', 'Info'),
    createLink('mailto:tip@pressly.no?subject=Pressly%20Help', 'Help'),
  );
}

function bindLogoutButtons() {
  const logoutButtons = document.querySelectorAll('[data-logout]');

  logoutButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      button.disabled = true;

      try {
        await logout();
        window.location.replace('/');
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

  const megaNavigation = document.querySelector('#mega-account-navigation');

  renderHeaderNavigation(container, session);
  renderMegaNavigation(megaNavigation, session);

  bindLogoutButtons();

  return session;
}
