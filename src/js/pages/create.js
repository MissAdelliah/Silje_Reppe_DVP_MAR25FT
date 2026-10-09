import { requireAuth } from '../guards/requireAuth.js';
import { createArticle } from '../services/articles.js';
import { renderNavigation } from '../ui/navigation.js';
import { initSearchMenu } from '../ui/searchMenu.js';

const SUCCESS_REDIRECT_DELAY = 1200;
const navigation = document.querySelector('#main-navigation');
const form = document.querySelector('#create-article-form');
const feedback = document.querySelector('#create-article-feedback');
const imageInput = document.querySelector('#article-image');
const imagePreview = document.querySelector('#article-image-preview');
const imagePlaceholder = document.querySelector('#article-image-placeholder');

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

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
    resetImagePreview();
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

  if (!title) {
    feedback.textContent = 'Please enter an article title.';

    return;
  }

  if (!category) {
    feedback.textContent = 'Please select a category.';

    return;
  }

  if (!body) {
    feedback.textContent = 'Please enter the article text.';

    return;
  }

  feedback.textContent = 'Publishing your article...';

  setSubmitting(submitButton, true);

  try {
    const publishedArticle = await createArticle({
      title,
      body,
      category,
      image_url: imageUrl || null,
      tags,
      submitted_by: session.user.id,
    });

    feedback.textContent =
      'Article published successfully. Opening your article...';

    await wait(SUCCESS_REDIRECT_DELAY);

    window.location.assign(
      `./article.html?id=${encodeURIComponent(publishedArticle.id)}`,
    );
  } catch (error) {
    const isPermissionError =
      error?.code === '42501' ||
      String(error?.message ?? '')
        .toLowerCase()
        .includes('row-level security');

    feedback.textContent = isPermissionError
      ? 'You do not have permission to publish this article.'
      : 'Unable to publish the article. Please try again.';

    setSubmitting(submitButton, false);
  }
}

async function init() {
  const session = await requireAuth();

  if (!session) {
    return;
  }

  initSearchMenu();

  await renderNavigation(navigation, session);

  imageInput?.addEventListener('input', updateImagePreview);
  imagePreview?.addEventListener('error', resetImagePreview);
  form?.addEventListener('submit', (event) => handleSubmit(event, session));
}

init();
