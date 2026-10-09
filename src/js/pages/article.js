import { getArticleById, getArticles } from '../services/articles.js';
import { getSession } from '../services/auth.js';
import {
  renderArticleDetail,
  renderBreakingNews,
  renderLatestNews,
} from '../ui/articles.js';
import { initMobileMenu } from '../ui/mobileMenu.js';
import { renderNavigation } from '../ui/navigation.js';
import { initSearchMenu } from '../ui/searchMenu.js';
import { isValidUuid } from '../utils/validation.js';

const SAVED_TOPICS_KEY = 'pressly:saved-topics';
const LATEST_NEWS_PAGE_SIZE = 4;
const navigation = document.querySelector('#main-navigation');
const articleLayout = document.querySelector('#article-layout');
const articleDetail = document.querySelector('#article-detail');
const savedTopicsPanel = document.querySelector('#saved-topics');
const savedTopicsList = document.querySelector('#saved-topics-list');
const clearSavedTopicsButton = document.querySelector('#clear-saved-topics');
const browseSavedTopicsButton = document.querySelector('#browse-saved-topics');
const breakingNewsLink = document.querySelector('#breaking-news-link');
const latestNewsList = document.querySelector('#latest-news-list');
const latestNewsMoreButton = document.querySelector('#latest-news-more');

let session = null;
let currentArticle = null;
let allArticles = [];
let savedTopics = [];
let latestNewsOffset = 0;

function getArticleId() {
  const params = new URLSearchParams(window.location.search);

  return params.get('id')?.trim() ?? '';
}

function getSavedTopics() {
  try {
    const storedTopics = localStorage.getItem(SAVED_TOPICS_KEY);

    if (!storedTopics) {
      return [];
    }

    const parsedTopics = JSON.parse(storedTopics);

    if (!Array.isArray(parsedTopics)) {
      return [];
    }

    return parsedTopics.filter(
      (topic) =>
        topic &&
        typeof topic.type === 'string' &&
        typeof topic.value === 'string',
    );
  } catch {
    return [];
  }
}

function saveTopics(topics) {
  localStorage.setItem(SAVED_TOPICS_KEY, JSON.stringify(topics));

  savedTopics = topics;
}

function toggleSavedTopic(topic) {
  const topicExists = savedTopics.some(
    (savedTopic) =>
      savedTopic.type === topic.type && savedTopic.value === topic.value,
  );

  if (topicExists) {
    saveTopics(
      savedTopics.filter(
        (savedTopic) =>
          !(savedTopic.type === topic.type && savedTopic.value === topic.value),
      ),
    );

    return;
  }

  saveTopics([...savedTopics, topic]);
}

function createSavedTopicButton(topic) {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'topic-pill';
  button.dataset.removeTopic = topic.value;
  button.dataset.topicType = topic.type;
  button.textContent = topic.value;
  button.setAttribute('aria-label', `Remove ${topic.value} from saved topics`);

  return button;
}

function createSavedTopicGroup(title, topics) {
  const section = document.createElement('section');
  section.className = 'saved-topics__group';

  const heading = document.createElement('h3');
  heading.textContent = title;

  const list = document.createElement('div');
  list.className = 'saved-topics__pills';

  topics.forEach((topic) => {
    list.append(createSavedTopicButton(topic));
  });

  section.append(heading, list);

  return section;
}

function renderSavedTopics() {
  savedTopicsList.replaceChildren();

  if (!savedTopics.length) {
    const emptyState = document.createElement('p');

    emptyState.className = 'saved-topics__empty';

    emptyState.textContent =
      'Save categories or tags from articles to see them here.';

    savedTopicsList.append(emptyState);

    return;
  }

  const categories = savedTopics.filter((topic) => topic.type === 'category');

  const tags = savedTopics.filter((topic) => topic.type === 'tag');

  if (categories.length) {
    savedTopicsList.append(createSavedTopicGroup('Categories', categories));
  }

  if (tags.length) {
    savedTopicsList.append(createSavedTopicGroup('Saved Tags', tags));
  }
}

function renderAuthenticatedLayout() {
  if (!session) {
    savedTopicsPanel.hidden = true;

    articleLayout.classList.remove('article-layout--authenticated');

    return;
  }

  savedTopicsPanel.hidden = false;

  articleLayout.classList.add('article-layout--authenticated');

  renderSavedTopics();
}

function getAuthorName() {
  if (!session || !currentArticle) {
    return 'Pressly contributor';
  }

  if (session.user.id !== currentArticle.submitted_by) {
    return 'Pressly contributor';
  }

  const displayName = session.user.user_metadata?.display_name?.trim();

  return displayName || 'Pressly contributor';
}

function renderCurrentArticle() {
  if (!currentArticle) {
    return;
  }

  renderArticleDetail(articleDetail, currentArticle, {
    canSaveTopics: Boolean(session),
    savedTopics,
    authorName: getAuthorName(),
  });
}

function renderArticleMessage(message) {
  articleDetail.replaceChildren();

  articleDetail.setAttribute('aria-busy', 'false');

  const feedback = document.createElement('p');

  feedback.className = 'page-feedback';

  feedback.textContent = message;

  articleDetail.append(feedback);
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

function handleArticleTopicClick(event) {
  if (!session) {
    return;
  }

  const button = event.target.closest('[data-save-topic]');

  if (!button) {
    return;
  }

  toggleSavedTopic({
    type: button.dataset.topicType,
    value: button.dataset.saveTopic,
  });

  renderSavedTopics();
  renderCurrentArticle();
}

function handleSavedTopicClick(event) {
  const button = event.target.closest('[data-remove-topic]');

  if (!button) {
    return;
  }

  toggleSavedTopic({
    type: button.dataset.topicType,
    value: button.dataset.removeTopic,
  });

  renderSavedTopics();
  renderCurrentArticle();
}

function handleClearSavedTopics() {
  localStorage.removeItem(SAVED_TOPICS_KEY);

  savedTopics = [];

  renderSavedTopics();
  renderCurrentArticle();
}

function handleBrowseSavedTopics() {
  window.location.assign('./');
}
function bindEvents() {
  articleDetail.addEventListener('click', handleArticleTopicClick);
  savedTopicsList.addEventListener('click', handleSavedTopicClick);
  clearSavedTopicsButton.addEventListener('click', handleClearSavedTopics);
  browseSavedTopicsButton.addEventListener('click', handleBrowseSavedTopics);
  latestNewsMoreButton.addEventListener('click', handleMoreLatestNews);
}

async function loadAuthentication() {
  try {
    session = await getSession();
  } catch {
    session = null;
  }

  await renderNavigation(navigation, session);

  savedTopics = session ? getSavedTopics() : [];

  renderAuthenticatedLayout();
}

async function loadArticle(articleId) {
  articleDetail.setAttribute('aria-busy', 'true');

  try {
    const article = await getArticleById(articleId);

    if (!article) {
      renderArticleMessage('The requested article could not be found.');

      return;
    }

    currentArticle = article;

    document.title = `${article.title} | Pressly`;

    renderCurrentArticle();
  } catch {
    renderArticleMessage('Unable to load this article. Please try again.');
  }
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

async function init() {
  initSearchMenu();
  initMobileMenu();
  bindEvents();

  const articleId = getArticleId();

  if (!isValidUuid(articleId)) {
    renderArticleMessage('The article link is invalid.');

    await loadAuthentication();
    await loadSupportingArticles();

    return;
  }

  await loadAuthentication();

  await Promise.all([loadArticle(articleId), loadSupportingArticles()]);
}

init();
