const FEEDBACK_ICONS = {
  error: 'error',
  success: 'check_circle',
  info: 'info',
};

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

  element.replaceChildren();
  element.dataset.state = state;
  element.setAttribute('role', state === 'error' ? 'alert' : 'status');

  const icon = document.createElement('span');
  icon.className = 'material-symbols-rounded feedback__icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = FEEDBACK_ICONS[state] ?? FEEDBACK_ICONS.info;

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

  input.dataset.state = state;
  messageElement.dataset.state = state;

  if (state === 'error') {
    input.setAttribute('aria-invalid', 'true');
  } else {
    input.removeAttribute('aria-invalid');
  }

  messageElement.replaceChildren();

  const icon = document.createElement('span');
  icon.className = 'material-symbols-rounded field-message__icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = state === 'success' ? 'check_circle' : 'error';

  const text = document.createElement('span');
  text.textContent = message;
  messageElement.append(icon, text);
}
