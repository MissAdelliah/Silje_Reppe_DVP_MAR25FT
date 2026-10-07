import { getSession } from '../services/auth.js';

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    window.location.replace('/login.html');
    return null;
  }

  return session;
}
