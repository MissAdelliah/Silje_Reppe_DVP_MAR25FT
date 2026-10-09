import { getSession } from '../services/auth.js';

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    window.location.replace('./login.html?redirect=create.html');

    return null;
  }

  return session;
}
