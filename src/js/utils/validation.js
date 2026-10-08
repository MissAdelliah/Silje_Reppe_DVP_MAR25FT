const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MIN_PASSWORD_LENGTH = 6;

/**
 * Validate a user's display name.
 *
 * @param {string} value
 * @returns {string}
 */
export function validateName(value) {
  const name = String(value ?? '').trim();

  if (!name) {
    return 'Enter your name.';
  }

  if (name.length < 2) {
    return 'Name must contain at least 2 characters.';
  }

  if (name.length > 60) {
    return 'Name must be 60 characters or fewer.';
  }

  return '';
}

/**
 * Validate an email address.
 *
 * @param {string} value
 * @returns {string}
 */
export function validateEmail(value) {
  const email = String(value ?? '').trim();

  if (!email) {
    return 'Enter your email address.';
  }

  if (!EMAIL_PATTERN.test(email)) {
    return 'Enter a valid email address.';
  }

  return '';
}

/**
 * Return a useful password-length message.
 *
 * @param {string} value
 * @returns {string}
 */
function validatePasswordLength(value) {
  const password = String(value ?? '');

  if (!password) {
    return 'Enter your password.';
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    const missingCharacters = MIN_PASSWORD_LENGTH - password.length;
    const characterWord = missingCharacters === 1 ? 'character' : 'characters';

    return `Password must contain at least ${MIN_PASSWORD_LENGTH} characters. Add ${missingCharacters} more ${characterWord}.`;
  }

  return '';
}

/**
 * Validate a password entered during login.
 *
 * @param {string} value
 * @returns {string}
 */
export function validateLoginPassword(value) {
  return validatePasswordLength(value);
}

/**
 * Validate a password entered during registration.
 *
 * @param {string} value
 * @returns {string}
 */
export function validateRegistrationPassword(value) {
  const password = String(value ?? '');

  if (!password) {
    return 'Create a password.';
  }

  return validatePasswordLength(password);
}

/**
 * Check whether a value is a valid UUID.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isValidUuid(value) {
  return UUID_PATTERN.test(String(value ?? '').trim());
}
