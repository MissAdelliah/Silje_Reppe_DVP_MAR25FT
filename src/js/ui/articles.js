function formatClockTime(dateString) {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatRelativeTime(dateString) {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const difference = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(difference / 60000));

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}

function getArticleUrl(article) {
  return `/article.html?id=${encodeURIComponent(article.id)}`;
}

function isTopicSaved(savedTopics, type, value) {
  return savedTopics.some(
    (topic) => topic.type === type && topic.value === value,
  );
}

function createTopicElement(type, value, canSaveTopics, savedTopics) {
  if (!canSaveTopics) {
    const pill = document.createElement('span');

    pill.className = 'topic-pill';
    pill.textContent = value;

    return pill;
  }

  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'topic-pill';

  button.dataset.saveTopic = value;
  button.dataset.topicType = type;

  button.textContent = value;

  const saved = isTopicSaved(savedTopics, type, value);

  button.setAttribute('aria-pressed', String(saved));

  if (saved) {
    button.classList.add('topic-pill--selected');
  }

  button.setAttribute(
    'aria-label',
    saved
      ? `Remove ${value} from saved topics`
      : `Save ${value} to saved topics`,
  );

  return button;
}

function getArticleTopics(article) {
  const topics = [];

  if (article.category) {
    topics.push({
      type: 'category',
      value: article.category,
    });
  }

  if (Array.isArray(article.tags)) {
    article.tags.forEach((tag) => {
      const cleanTag = String(tag).trim();

      if (!cleanTag) {
        return;
      }

      topics.push({
        type: 'tag',
        value: cleanTag,
      });
    });
  }

  return topics.filter(
    (topic, index, allTopics) =>
      allTopics.findIndex(
        (candidate) =>
          candidate.type === topic.type && candidate.value === topic.value,
      ) === index,
  );
}

function createArticleTopics(article, canSaveTopics, savedTopics) {
  const topics = getArticleTopics(article);

  if (!topics.length) {
    return null;
  }

  const container = document.createElement('div');

  container.className = 'article-card__topics';

  topics.forEach((topic) => {
    container.append(
      createTopicElement(topic.type, topic.value, canSaveTopics, savedTopics),
    );
  });

  return container;
}

function createArticleImage(article) {
  if (!article.image_url) {
    return null;
  }

  const link = document.createElement('a');

  link.className = 'article-card__image-link';

  link.href = getArticleUrl(article);

  link.setAttribute('aria-label', `Read ${article.title}`);

  const image = document.createElement('img');

  image.className = 'article-card__image';

  image.src = article.image_url;
  image.alt = '';
  image.loading = 'lazy';

  image.addEventListener('error', () => {
    link.remove();
  });

  link.append(image);

  return link;
}

function createArticleMeta(article) {
  const meta = document.createElement('div');

  meta.className = 'article-card__meta';

  const published = document.createElement('span');

  const publishedTime = formatClockTime(article.created_at);

  published.textContent = publishedTime
    ? `Published ${publishedTime}`
    : 'Published';

  const updated = document.createElement('span');

  const updatedDate = article.updated_at ?? article.created_at;

  const relativeTime = formatRelativeTime(updatedDate);

  updated.textContent = relativeTime ? `Updated ${relativeTime}` : '';

  meta.append(published);

  if (relativeTime) {
    meta.append(updated);
  }

  return meta;
}

function createArticleContent(article, canSaveTopics, savedTopics) {
  const content = document.createElement('div');

  content.className = 'article-card__content';

  const title = document.createElement('h2');

  title.className = 'article-card__title';

  const titleLink = document.createElement('a');

  titleLink.href = getArticleUrl(article);

  titleLink.textContent = article.title;

  title.append(titleLink);

  content.append(title);

  const topics = createArticleTopics(article, canSaveTopics, savedTopics);

  if (topics) {
    content.append(topics);
  }

  content.append(createArticleMeta(article));

  return content;
}

function createFeaturedArticle(article, canSaveTopics, savedTopics) {
  const element = document.createElement('article');

  element.className = 'article-card article-card--featured';

  const image = createArticleImage(article);

  if (image) {
    element.append(image);
  }

  element.append(createArticleContent(article, canSaveTopics, savedTopics));

  return element;
}

function createStandardArticle(article, canSaveTopics, savedTopics) {
  const element = document.createElement('article');

  element.className = 'article-card article-card--horizontal';

  const image = createArticleImage(article);

  if (image) {
    element.append(image);
  }

  element.append(createArticleContent(article, canSaveTopics, savedTopics));

  return element;
}

export function renderArticles(
  container,
  articles,
  { canSaveTopics = false, savedTopics = [] } = {},
) {
  if (!container) {
    return;
  }

  container.replaceChildren();

  if (!articles.length) {
    return;
  }

  const [featuredArticle, ...remainingArticles] = articles;

  container.append(
    createFeaturedArticle(featuredArticle, canSaveTopics, savedTopics),
  );

  remainingArticles.forEach((article) => {
    container.append(
      createStandardArticle(article, canSaveTopics, savedTopics),
    );
  });
}

export function renderBreakingNews(linkElement, article) {
  if (!linkElement || !article) {
    return;
  }

  linkElement.textContent = article.title;

  linkElement.href = getArticleUrl(article);
}

export function renderLatestNews(container, articles) {
  if (!container) {
    return;
  }

  container.replaceChildren();

  articles.forEach((article) => {
    const card = document.createElement('article');

    card.className = 'latest-news-card';

    const time = document.createElement('time');

    time.className = 'latest-news-card__time';

    time.dateTime = article.created_at;

    time.textContent = formatRelativeTime(article.created_at);

    const heading = document.createElement('h3');

    heading.className = 'latest-news-card__title';

    const link = document.createElement('a');

    link.href = getArticleUrl(article);

    link.textContent = article.title;

    heading.append(link);

    card.append(time, heading);

    container.append(card);
  });
}
