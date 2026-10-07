import { getSession, logout } from '../services/auth.js';

export async function renderNavigation(container) {
  if (!container) {
    return;
  }

  const session = await getSession();
  const createArticleLink = document.querySelector('#mega-create-link');

  if (!session) {
    container.innerHTML = `
      <a href="/login.html">Login</a>
    `;

    createArticleLink?.setAttribute('hidden', '');
    return;
  }

  container.innerHTML = `
    <button type="button" id="logout-button">
      Log out
    </button>
  `;

  createArticleLink?.removeAttribute('hidden');

  const logoutButton = container.querySelector('#logout-button');

  logoutButton.addEventListener('click', async () => {
    try {
      await logout();
      window.location.replace('/');
    } catch {
      // Keep the user on the current page if logout fails.
    }
  });
}
