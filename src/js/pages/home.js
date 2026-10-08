import { getArticles } from '../services/articles.js';
import { getSession } from '../services/auth.js';

import {
  renderArticles,
  renderBreakingNews,
  renderLatestNews,
} from '../ui/articles.js';

import { renderNavigation } from '../ui/navigation.js';
import { initSearchMenu } from '../ui/searchMenu.js';

const SAVED_TOPICS_KEY = 'pressly:saved-topics';
const LATEST_NEWS_PAGE_SIZE = 4;
const navigation = document.querySelector('#main-navigation');
const homeLayout = document.querySelector('#home-layout');
const savedTopicsPanel = document.querySelector('#saved-topics');
const savedTopicsList = document.querySelector('#saved-topics-list');
const clearSavedTopicsButton = document.querySelector('#clear-saved-topics');
const browseSavedTopicsButton = document.querySelector('#browse-saved-topics');
const articlesList = document.querySelector('#articles-list');
const articlesFeedback = document.querySelector('#articles-feedback');
const breakingNewsLink = document.querySelector('#breaking-news-link');
const latestNewsList = document.querySelector('#latest-news-list');
const latestNewsMoreButton = document.querySelector('#latest-news-more');

let session = null;
let allArticles = [];
let savedTopics = [];
let browseSavedOnly = false;
let latestNewsOffset = 0;

function normalise(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
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
  const exists = savedTopics.some(
    (savedTopic) =>
      savedTopic.type === topic.type && savedTopic.value === topic.value,
  );

  if (exists) {
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

function clearSavedTopics() {
  localStorage.removeItem(SAVED_TOPICS_KEY);

  savedTopics = [];
  browseSavedOnly = false;
}

function getPageFilters() {
  const params = new URLSearchParams(window.location.search);

  return {
    query: normalise(params.get('q')),
    category: normalise(params.get('category')),
    tag: normalise(params.get('tag')),
  };
}

function articleMatchesPageFilters(article) {
  const { query, category, tag } = getPageFilters();
  const articleCategory = normalise(article.category);
  const articleTags = Array.isArray(article.tags)
    ? article.tags.map(normalise)
    : [];

  if (category && articleCategory !== category) {
    return false;
  }

  if (tag && !articleTags.includes(tag)) {
    return false;
  }

  if (!query) {
    return true;
  }

  const searchableContent = [
    article.title,
    article.body,
    article.category,
    ...articleTags,
  ]
    .map(normalise)
    .join(' ');

  return searchableContent.includes(query);
}

function articleMatchesSavedTopics(article) {
  if (!savedTopics.length) {
    return false;
  }

  const category = normalise(article.category);
  const tags = Array.isArray(article.tags) ? article.tags.map(normalise) : [];

  return savedTopics.some((topic) => {
    const topicValue = normalise(topic.value);

    if (topic.type === 'category') {
      return category === topicValue;
    }

    if (topic.type === 'tag') {
      return tags.includes(topicValue);
    }

    return false;
  });
}

function getVisibleArticles() {
  let articles = allArticles.filter(articleMatchesPageFilters);

  if (browseSavedOnly) {
    articles = articles.filter(articleMatchesSavedTopics);
  }

  return articles;
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
    browseSavedTopicsButton.disabled = true;

    return;
  }

  browseSavedTopicsButton.disabled = false;

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

    homeLayout.classList.remove('home-layout--authenticated');

    return;
  }

  savedTopicsPanel.hidden = false;
  homeLayout.classList.add('home-layout--authenticated');

  renderSavedTopics();

  browseSavedTopicsButton.setAttribute('aria-pressed', String(browseSavedOnly));
  browseSavedTopicsButton.textContent = browseSavedOnly ? 'Show all' : 'Browse';
}

function renderArticleFeed() {
  const visibleArticles = getVisibleArticles();

  renderArticles(articlesList, visibleArticles, {
    canSaveTopics: Boolean(session),
    savedTopics,
  });

  if (visibleArticles.length) {
    articlesFeedback.textContent = '';
    return;
  }

  if (browseSavedOnly) {
    articlesFeedback.textContent = 'No articles match your saved topics.';

    return;
  }

  articlesFeedback.textContent = 'No articles match this view.';
}

function renderBreakingNewsBar() {
  if (!allArticles.length) {
    breakingNewsLink.textContent = 'No breaking news yet';

    breakingNewsLink.href = '/';

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

  renderAuthenticatedLayout();
  renderArticleFeed();
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

  renderAuthenticatedLayout();
  renderArticleFeed();
}

function handleClearSavedTopics() {
  clearSavedTopics();

  renderAuthenticatedLayout();
  renderArticleFeed();
}

function handleBrowseSavedTopics() {
  if (!savedTopics.length) {
    return;
  }

  browseSavedOnly = !browseSavedOnly;

  renderAuthenticatedLayout();
  renderArticleFeed();
}

function handleMoreLatestNews() {
  const nextOffset = latestNewsOffset + LATEST_NEWS_PAGE_SIZE;
  latestNewsOffset = nextOffset >= allArticles.length ? 0 : nextOffset;
  renderLatestNewsPanel();
}

function bindEvents() {
  articlesList.addEventListener('click', handleArticleTopicClick);
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

async function loadArticles() {
  articlesFeedback.textContent = 'Loading articles...';

  try {
    allArticles = await getArticles();

    articlesFeedback.textContent = '';

    renderBreakingNewsBar();
    renderArticleFeed();
    renderLatestNewsPanel();
  } catch {
    articlesFeedback.textContent = 'Unable to load articles. Please try again.';
  }
}

async function init() {
  initSearchMenu();
  bindEvents();

  await loadAuthentication();
  await loadArticles();
}

init();
