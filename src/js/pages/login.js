import { getSession, login, register } from '../services/auth.js';
import { initSearchMenu } from '../ui/searchMenu.js';

const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');

const loginFeedback = document.querySelector('#login-feedback');
const registerFeedback = document.querySelector('#register-feedback');

const authHeading = document.querySelector('#auth-heading');
const authSwitchButtons = document.querySelectorAll('[data-auth-view]');

function showAuthView(view) {
  const showRegister = view === 'register';

  loginForm.hidden = showRegister;
  registerForm.hidden = !showRegister;

  authHeading.textContent = showRegister
    ? 'Create an account'
    : 'Log in to continue';

  loginFeedback.textContent = '';
  registerFeedback.textContent = '';
}

async function redirectAuthenticatedUser() {
  const session = await getSession();

  if (session) {
    window.location.replace('/');
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    loginFeedback.textContent = 'Please fill in all fields.';
    return;
  }

  const submitButton = loginForm.querySelector('button[type="submit"]');

  try {
    submitButton.disabled = true;
    loginFeedback.textContent = 'Logging in...';

    await login(email, password);

    window.location.replace('/');
  } catch (error) {
    loginFeedback.textContent =
      error.message || 'Unable to log in. Please try again.';
  } finally {
    submitButton.disabled = false;
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(registerForm);

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!name || !email || !password) {
    registerFeedback.textContent = 'Please fill in all fields.';
    return;
  }

  if (password.length < 6) {
    registerFeedback.textContent = 'Password must be at least 6 characters.';
    return;
  }

  const submitButton = registerForm.querySelector('button[type="submit"]');

  try {
    submitButton.disabled = true;
    registerFeedback.textContent = 'Creating account...';

    await register(name, email, password);

    registerForm.reset();

    registerFeedback.textContent =
      'Account created. Check your email to confirm your account.';
  } catch (error) {
    registerFeedback.textContent =
      error.message || 'Unable to create account. Please try again.';
  } finally {
    submitButton.disabled = false;
  }
});

authSwitchButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showAuthView(button.dataset.authView);
  });
});

async function init() {
  initSearchMenu();
  await redirectAuthenticatedUser();
}

init();
