const FEEDBACK_ICONS = {
  error: 'error',
  success: 'check_circle',
  info: 'info',
};

function getFeedbackState(state) {
  return Object.hasOwn(FEEDBACK_ICONS, state) ? state : 'info';
}

function createFeedbackIcon(iconName, className) {
  const icon = document.createElement('span');

  icon.className = `material-symbols-rounded ${className}`;
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = iconName;

  return icon;
}

export function clearFeedback(element) {
  if (!element) {
    return;
  }

  element.replaceChildren();
  element.removeAttribute('data-state');
  element.setAttribute('role', 'status');
}

export function showFeedback(element, message, state = 'info') {
  if (!element) {
    return;
  }

  const feedbackState = getFeedbackState(state);

  element.replaceChildren();
  element.dataset.state = feedbackState;

  element.setAttribute('role', feedbackState === 'error' ? 'alert' : 'status');

  const icon = createFeedbackIcon(
    FEEDBACK_ICONS[feedbackState],
    'feedback__icon',
  );

  const text = document.createElement('span');
  text.textContent = message;

  element.append(icon, text);
}

export function clearFieldState(input, messageElement) {
  if (!input || !messageElement) {
    return;
  }

  input.removeAttribute('aria-invalid');
  input.removeAttribute('data-state');

  messageElement.replaceChildren();
  messageElement.removeAttribute('data-state');
}

export function showFieldState(input, messageElement, { state, message }) {
  if (!input || !messageElement) {
    return;
  }

  const fieldState = state === 'success' ? 'success' : 'error';

  input.dataset.state = fieldState;
  messageElement.dataset.state = fieldState;

  if (fieldState === 'error') {
    input.setAttribute('aria-invalid', 'true');
  } else {
    input.removeAttribute('aria-invalid');
  }

  messageElement.replaceChildren();

  const icon = createFeedbackIcon(
    fieldState === 'success' ? FEEDBACK_ICONS.success : FEEDBACK_ICONS.error,
    'field-message__icon',
  );

  const text = document.createElement('span');
  text.textContent = message;

  messageElement.append(icon, text);
}
