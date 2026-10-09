import { requireAuth } from '../guards/requireAuth.js';
import { createArticle, getArticles } from '../services/articles.js';
import { renderBreakingNews, renderLatestNews } from '../ui/articles.js';
import { clearFeedback, showFeedback } from '../ui/feedback.js';
import { initMobileMenu } from '../ui/mobileMenu.js';
import { renderNavigation } from '../ui/navigation.js';
import { initSearchMenu } from '../ui/searchMenu.js';

const SUCCESS_REDIRECT_DELAY = 1200;
const LATEST_NEWS_PAGE_SIZE = 4;
const navigation = document.querySelector('#main-navigation');
const form = document.querySelector('#create-article-form');
const feedback = document.querySelector('#create-article-feedback');
const imageInput = document.querySelector('#article-image');
const imagePreview = document.querySelector('#article-image-preview');
const imagePlaceholder = document.querySelector('#article-image-placeholder');
const breakingNewsLink = document.querySelector('#breaking-news-link');
const latestNewsList = document.querySelector('#latest-news-list');
const latestNewsMoreButton = document.querySelector('#latest-news-more');

let allArticles = [];
let latestNewsOffset = 0;

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

function resetImagePreview() {
  imagePreview.hidden = true;
  imagePreview.removeAttribute('src');
  imagePlaceholder.hidden = false;
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

function setSubmitting(button, isSubmitting) {
  button.disabled = isSubmitting;

  button.textContent = isSubmitting ? 'Publishing...' : 'Publish';
}

function renderBreakingNewsBar() {
  if (!allArticles.length) {
    breakingNewsLink.textContent = 'No breaking news yet';

    breakingNewsLink.href = './';

    return;
  }

  renderBreakingNews(breakingNewsLink, allArticles[0]);
}

function renderLatestNewsPanel() {
  latestNewsList.replaceChildren();

  if (!allArticles.length) {
    latestNewsMoreButton.hidden = true;
    return;
  }

  const latestArticles = allArticles.slice(
    latestNewsOffset,
    latestNewsOffset + LATEST_NEWS_PAGE_SIZE,
  );

  renderLatestNews(latestNewsList, latestArticles, {
    newestArticleId: allArticles[0].id,
  });

  latestNewsMoreButton.hidden = allArticles.length <= LATEST_NEWS_PAGE_SIZE;

  if (latestNewsMoreButton.hidden) {
    return;
  }

  const reachedEnd =
    latestNewsOffset + LATEST_NEWS_PAGE_SIZE >= allArticles.length;

  latestNewsMoreButton.textContent = reachedEnd ? 'Back to latest' : 'More';
}

function handleMoreLatestNews() {
  const nextOffset = latestNewsOffset + LATEST_NEWS_PAGE_SIZE;

  latestNewsOffset = nextOffset >= allArticles.length ? 0 : nextOffset;

  renderLatestNewsPanel();
}

async function loadSupportingArticles() {
  try {
    allArticles = await getArticles();

    renderBreakingNewsBar();
    renderLatestNewsPanel();
  } catch {
    allArticles = [];

    breakingNewsLink.textContent = 'Latest news is currently unavailable.';

    breakingNewsLink.href = './';

    latestNewsList.replaceChildren();
    latestNewsMoreButton.hidden = true;
  }
}

async function handleSubmit(event, session) {
  event.preventDefault();
  clearFeedback(feedback);
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const imageUrl = String(formData.get('image_url') ?? '').trim();
  const tags = parseTags(String(formData.get('tags') ?? ''));

  if (!title) {
    showFeedback(feedback, 'Please enter an article title.', 'error');

    return;
  }

  if (!category) {
    showFeedback(feedback, 'Please select a category.', 'error');

    return;
  }

  if (!body) {
    showFeedback(feedback, 'Please enter the article text.', 'error');

    return;
  }

  if (imageUrl && !imageInput.validity.valid) {
    showFeedback(feedback, 'Please enter a valid image URL.', 'error');

    return;
  }

  showFeedback(feedback, 'Publishing your article...', 'info');

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

    showFeedback(
      feedback,
      'Article published successfully. Opening your article...',
      'success',
    );

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

    showFeedback(
      feedback,
      isPermissionError
        ? 'You do not have permission to publish this article.'
        : 'Unable to publish the article. Please try again.',
      'error',
    );

    setSubmitting(submitButton, false);
  }
}

function bindEvents(session) {
  imageInput.addEventListener('input', updateImagePreview);

  imagePreview.addEventListener('error', resetImagePreview);

  latestNewsMoreButton.addEventListener('click', handleMoreLatestNews);

  form.addEventListener('submit', (event) => handleSubmit(event, session));
}

async function init() {
  const session = await requireAuth();

  if (!session) {
    return;
  }

  initSearchMenu();
  initMobileMenu();

  await renderNavigation(navigation, session);

  bindEvents(session);

  await loadSupportingArticles();
}

init();
