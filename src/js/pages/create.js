import { requireAuth } from '../guards/requireAuth.js';
import { createArticle } from '../services/articles.js';
import { renderNavigation } from '../ui/navigation.js';
import { initSearchMenu } from '../ui/searchMenu.js';

const navigation = document.querySelector('#main-navigation');
const form = document.querySelector('#create-article-form');
const feedback = document.querySelector('#create-article-feedback');
const imageInput = document.querySelector('#article-image');
const imagePreview = document.querySelector('#article-image-preview');
const imagePlaceholder = document.querySelector('#article-image-placeholder');

function parseTags(value) {
  return [
    ...new Set(
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}

function updateImagePreview() {
  const imageUrl = imageInput.value.trim();

  if (!imageUrl) {
    imagePreview.hidden = true;
    imagePreview.removeAttribute('src');
    imagePlaceholder.hidden = false;

    return;
  }

  imagePreview.src = imageUrl;
  imagePreview.hidden = false;
  imagePlaceholder.hidden = true;
}

function resetImagePreview() {
  imagePreview.hidden = true;
  imagePreview.removeAttribute('src');
  imagePlaceholder.hidden = false;
}

function setSubmitting(button, isSubmitting) {
  button.disabled = isSubmitting;
  button.textContent = isSubmitting ? 'Publishing...' : 'Publish';
}

async function handleSubmit(event, session) {
  event.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const imageUrl = String(formData.get('image_url') ?? '').trim();
  const tags = parseTags(String(formData.get('tags') ?? ''));

  if (!title || !body || !category) {
    feedback.textContent =
      'Please complete the title, category and article text.';

    return;
  }

  feedback.textContent = '';

  setSubmitting(submitButton, true);

  try {
    await createArticle({
      title,
      body,
      category,
      image_url: imageUrl || null,
      tags,
      submitted_by: session.user.id,
    });

    form.reset();
    resetImagePreview();

    feedback.textContent = 'Article published successfully.';

    window.location.assign('/');
  } catch {
    feedback.textContent = 'Unable to publish the article. Please try again.';

    setSubmitting(submitButton, false);
  }
}

async function init() {
  const session = await requireAuth();

  if (!session) {
    return;
  }

  initSearchMenu();

  await renderNavigation(navigation);

  imageInput?.addEventListener('input', updateImagePreview);

  imagePreview?.addEventListener('error', () => {
    imagePreview.hidden = true;
    imagePlaceholder.hidden = false;
  });

  form?.addEventListener('submit', (event) => handleSubmit(event, session));
}

init();
