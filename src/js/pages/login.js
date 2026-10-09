import { getSession, login, register } from '../services/auth.js';

import {
  validateEmail,
  validateLoginPassword,
  validateName,
  validateRegistrationPassword,
} from '../utils/validation.js';

import {
  clearFeedback,
  clearFieldState,
  showFeedback,
  showFieldState,
} from '../ui/feedback.js';

import { initSearchMenu } from '../ui/searchMenu.js';

const LOGIN_REDIRECT_DELAY = 1500;
const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const authHeading = document.querySelector('#auth-heading');
const authIntro = document.querySelector('#auth-intro');
const loginFeedback = document.querySelector('#login-feedback');
const registerFeedback = document.querySelector('#register-feedback');
const loginEmail = document.querySelector('#login-email');
const loginPassword = document.querySelector('#login-password');
const registerName = document.querySelector('#register-name');
const registerEmail = document.querySelector('#register-email');
const registerPassword = document.querySelector('#register-password');
const loginEmailMessage = document.querySelector('#login-email-message');
const loginPasswordMessage = document.querySelector('#login-password-message');
const registerNameMessage = document.querySelector('#register-name-message');
const registerEmailMessage = document.querySelector('#register-email-message');
const registerPasswordMessage = document.querySelector(
  '#register-password-message',
);

const authSwitchButtons = document.querySelectorAll('[data-auth-view]');
const passwordToggleButtons = document.querySelectorAll(
  '[data-password-toggle]',
);

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function setFieldValidation(
  input,
  messageElement,
  errorMessage,
  successMessage,
) {
  if (errorMessage) {
    showFieldState(input, messageElement, {
      state: 'error',
      message: errorMessage,
    });

    return false;
  }

  showFieldState(input, messageElement, {
    state: 'success',
    message: successMessage,
  });

  return true;
}

function validateLoginEmailField() {
  return setFieldValidation(
    loginEmail,
    loginEmailMessage,
    validateEmail(loginEmail.value),
    'Email looks good.',
  );
}

function validateLoginPasswordField() {
  return setFieldValidation(
    loginPassword,
    loginPasswordMessage,
    validateLoginPassword(loginPassword.value),
    'Password entered.',
  );
}

function validateRegisterNameField() {
  return setFieldValidation(
    registerName,
    registerNameMessage,
    validateName(registerName.value),
    'Name looks good.',
  );
}

function validateRegisterEmailField() {
  return setFieldValidation(
    registerEmail,
    registerEmailMessage,
    validateEmail(registerEmail.value),
    'Email format looks good.',
  );
}

function validateRegisterPasswordField() {
  return setFieldValidation(
    registerPassword,
    registerPasswordMessage,
    validateRegistrationPassword(registerPassword.value),
    'Password meets the requirements.',
  );
}

function validateLoginForm() {
  const emailValid = validateLoginEmailField();
  const passwordValid = validateLoginPasswordField();
  return emailValid && passwordValid;
}

function validateRegisterForm() {
  const nameValid = validateRegisterNameField();
  const emailValid = validateRegisterEmailField();
  const passwordValid = validateRegisterPasswordField();
  return nameValid && emailValid && passwordValid;
}

function resetLoginFormState() {
  clearFieldState(loginEmail, loginEmailMessage);
  clearFieldState(loginPassword, loginPasswordMessage);
  clearFeedback(loginFeedback);
}

function resetRegisterFormState() {
  clearFieldState(registerName, registerNameMessage);
  clearFieldState(registerEmail, registerEmailMessage);
  clearFieldState(registerPassword, registerPasswordMessage);
  clearFeedback(registerFeedback);
}

function showAuthView(view) {
  const showRegister = view === 'register';
  loginForm.hidden = showRegister;
  registerForm.hidden = !showRegister;

  resetLoginFormState();
  resetRegisterFormState();

  if (showRegister) {
    authHeading.textContent = 'Create an account';

    authIntro.textContent =
      'Create your Pressly account and confirm your email to continue.';

    registerName.focus();

    return;
  }

  authHeading.textContent = 'Log in to continue';
  authIntro.textContent = 'Enter your Pressly account details.';
  loginEmail.focus();
}

function setSubmitting(form, isSubmitting, labels) {
  const button = form.querySelector('button[type="submit"]');

  if (!button) {
    return;
  }

  button.disabled = isSubmitting;
  button.dataset.loading = String(isSubmitting);
  button.textContent = isSubmitting ? labels.loading : labels.idle;
}

function getLoginErrorMessage(error) {
  const message = String(error?.message ?? '').toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'The email or password is incorrect. Check your details and try again.';
  }

  if (message.includes('email not confirmed')) {
    return 'Your email has not been confirmed yet. Open the confirmation email from Pressly before logging in.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'Pressly could not connect to the server. Check your internet connection and try again.';
  }

  return 'We could not log you in. Please try again.';
}

function getRegisterErrorMessage(error) {
  const message = String(error?.message ?? '').toLowerCase();

  if (
    message.includes('already registered') ||
    message.includes('already exists')
  ) {
    return 'An account may already exist for this email. Try logging in instead.';
  }

  if (message.includes('password')) {
    return 'This password cannot be used. Please choose another password.';
  }

  if (message.includes('invalid email')) {
    return 'The email address is not valid. Check it and try again.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'Pressly could not connect to the server. Check your internet connection and try again.';
  }

  return 'We could not create your account. Please try again.';
}

function togglePasswordVisibility(button) {
  const input = document.getElementById(button.dataset.passwordToggle);

  const icon = button.querySelector('.material-symbols-rounded');

  if (!input || !icon) {
    return;
  }

  const passwordIsHidden = input.type === 'password';
  input.type = passwordIsHidden ? 'text' : 'password';
  button.setAttribute('aria-pressed', String(passwordIsHidden));
  button.setAttribute(
    'aria-label',
    passwordIsHidden ? 'Hide password' : 'Show password',
  );

  icon.textContent = passwordIsHidden ? 'visibility_off' : 'visibility';
}

function revalidateIfTouched(input, validationFunction) {
  if (input.hasAttribute('data-state')) {
    validationFunction();
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  clearFeedback(loginFeedback);

  if (!validateLoginForm()) {
    showFeedback(
      loginFeedback,
      'Please correct the highlighted fields before logging in.',
      'error',
    );

    return;
  }

  setSubmitting(loginForm, true, {
    idle: 'Log in',
    loading: 'Logging in...',
  });

  showFeedback(loginFeedback, 'Checking your account details...', 'info');

  try {
    await login(loginEmail.value.trim(), loginPassword.value);

    showFeedback(
      loginFeedback,
      'Login successful. Welcome back to Pressly.',
      'success',
    );

    await wait(LOGIN_REDIRECT_DELAY);

    window.location.replace('/');
  } catch (error) {
    showFeedback(loginFeedback, getLoginErrorMessage(error), 'error');

    setSubmitting(loginForm, false, {
      idle: 'Log in',
      loading: 'Logging in...',
    });
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  clearFeedback(registerFeedback);

  if (!validateRegisterForm()) {
    showFeedback(
      registerFeedback,
      'Please correct the highlighted fields before creating your account.',
      'error',
    );

    return;
  }

  setSubmitting(registerForm, true, {
    idle: 'Register',
    loading: 'Creating account...',
  });

  showFeedback(registerFeedback, 'Creating your Pressly account...', 'info');

  try {
    await register(
      registerName.value.trim(),
      registerEmail.value.trim(),
      registerPassword.value,
    );

    showFeedback(
      registerFeedback,
      'Account created successfully. Check your inbox and confirm your email before logging in.',
      'success',
    );

    registerForm.reset();

    clearFieldState(registerName, registerNameMessage);
    clearFieldState(registerEmail, registerEmailMessage);
    clearFieldState(registerPassword, registerPasswordMessage);

    setSubmitting(registerForm, false, {
      idle: 'Register',
      loading: 'Creating account...',
    });
  } catch (error) {
    showFeedback(registerFeedback, getRegisterErrorMessage(error), 'error');

    setSubmitting(registerForm, false, {
      idle: 'Register',
      loading: 'Creating account...',
    });
  }
});

loginEmail.addEventListener('blur', validateLoginEmailField);
loginPassword.addEventListener('blur', validateLoginPasswordField);
registerName.addEventListener('blur', validateRegisterNameField);
registerEmail.addEventListener('blur', validateRegisterEmailField);
registerPassword.addEventListener('blur', validateRegisterPasswordField);

loginEmail.addEventListener('input', () => {
  clearFeedback(loginFeedback);

  revalidateIfTouched(loginEmail, validateLoginEmailField);
});

loginPassword.addEventListener('input', () => {
  clearFeedback(loginFeedback);

  revalidateIfTouched(loginPassword, validateLoginPasswordField);
});

registerName.addEventListener('input', () => {
  clearFeedback(registerFeedback);

  revalidateIfTouched(registerName, validateRegisterNameField);
});

registerEmail.addEventListener('input', () => {
  clearFeedback(registerFeedback);

  revalidateIfTouched(registerEmail, validateRegisterEmailField);
});

registerPassword.addEventListener('input', () => {
  clearFeedback(registerFeedback);

  revalidateIfTouched(registerPassword, validateRegisterPasswordField);
});

authSwitchButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showAuthView(button.dataset.authView);
  });
});

passwordToggleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    togglePasswordVisibility(button);
  });
});

async function init() {
  initSearchMenu();

  try {
    const session = await getSession();

    if (session) {
      window.location.replace('/');
    }
  } catch {
    // Leave the login page usable if the
    // initial session request fails.
  }
}

init();
