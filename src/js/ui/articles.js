function parseDate(dateString) {
  if (!dateString) {
    return null;
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatClockTime(dateString) {
  const date = parseDate(dateString);

  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatArticleDate(dateString) {
  const date = parseDate(dateString);

  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatRelativeTime(dateString) {
  const date = parseDate(dateString);

  if (!date) {
    return '';
  }

  const difference = Math.max(0, Date.now() - date.getTime());

  const minutes = Math.floor(difference / 60000);

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
  if (!article?.id) {
    return './article.html';
  }

  return `./article.html?id=${encodeURIComponent(article.id)}`;
}

function isTopicSaved(savedTopics, type, value) {
  if (!Array.isArray(savedTopics)) {
    return false;
  }

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

  if (article?.category) {
    const category = String(article.category).trim();

    if (category) {
      topics.push({
        type: 'category',
        value: category,
      });
    }
  }

  if (Array.isArray(article?.tags)) {
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

function createTopicsContainer(article, canSaveTopics, savedTopics, className) {
  const topics = getArticleTopics(article);

  if (!topics.length) {
    return null;
  }

  const container = document.createElement('div');

  container.className = className;

  topics.forEach((topic) => {
    container.append(
      createTopicElement(topic.type, topic.value, canSaveTopics, savedTopics),
    );
  });

  return container;
}

function createArticleImage(article) {
  if (!article?.image_url) {
    return null;
  }

  const link = document.createElement('a');

  link.className = 'article-card__image-link';

  link.href = getArticleUrl(article);

  link.setAttribute('aria-label', `Read ${article.title || 'article'}`);

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

  const published = document.createElement('time');

  published.dateTime = article?.created_at ?? '';

  const publishedTime = formatClockTime(article?.created_at);

  published.textContent = publishedTime
    ? `Published ${publishedTime}`
    : 'Published';

  meta.append(published);

  const updatedDate = article?.updated_at ?? article?.created_at;

  const relativeTime = formatRelativeTime(updatedDate);

  if (relativeTime) {
    const updated = document.createElement('time');

    updated.dateTime = updatedDate ?? '';

    updated.textContent = `Updated ${relativeTime}`;

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

  titleLink.textContent = article?.title || 'Untitled article';

  title.append(titleLink);
  content.append(title);

  const topics = createTopicsContainer(
    article,
    canSaveTopics,
    savedTopics,
    'article-card__topics',
  );

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

function createArticleBody(body) {
  const container = document.createElement('div');

  container.className = 'article-detail__body';

  const paragraphs = String(body ?? '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    const paragraph = document.createElement('p');

    paragraph.textContent = 'No article content is available.';

    container.append(paragraph);

    return container;
  }

  paragraphs.forEach((paragraphText) => {
    const paragraph = document.createElement('p');

    paragraph.textContent = paragraphText;

    container.append(paragraph);
  });

  return container;
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

  const articleList = Array.isArray(articles) ? articles.filter(Boolean) : [];

  if (!articleList.length) {
    return;
  }

  const [featuredArticle, ...remainingArticles] = articleList;

  container.append(
    createFeaturedArticle(featuredArticle, canSaveTopics, savedTopics),
  );

  remainingArticles.forEach((article) => {
    container.append(
      createStandardArticle(article, canSaveTopics, savedTopics),
    );
  });
}

export function renderArticleDetail(
  container,
  article,
  {
    canSaveTopics = false,
    savedTopics = [],
    authorName = 'Pressly contributor',
  } = {},
) {
  if (!container || !article) {
    return;
  }

  container.replaceChildren();

  container.setAttribute('aria-busy', 'false');

  if (article.image_url) {
    const image = document.createElement('img');

    image.className = 'article-detail__image';

    image.src = article.image_url;
    image.alt = '';

    image.addEventListener('error', () => {
      image.remove();
    });

    container.append(image);
  }

  const content = document.createElement('div');

  content.className = 'article-detail__content';

  const title = document.createElement('h1');

  title.className = 'article-detail__title';

  title.textContent = article.title || 'Untitled article';

  content.append(title);

  const topics = createTopicsContainer(
    article,
    canSaveTopics,
    savedTopics,
    'article-detail__topics',
  );

  if (topics) {
    content.append(topics);
  }

  const byline = document.createElement('p');

  byline.className = 'article-detail__byline';

  byline.textContent = `Published by ${authorName}`;

  content.append(byline);

  const meta = document.createElement('div');

  meta.className = 'article-detail__meta';

  const published = document.createElement('time');

  published.dateTime = article.created_at ?? '';

  const publishedDate = formatArticleDate(article.created_at);

  published.textContent = publishedDate
    ? `Published ${publishedDate}`
    : 'Published';

  meta.append(published);

  const updatedDate = article.updated_at ?? article.created_at;

  const updatedTime = formatRelativeTime(updatedDate);

  if (updatedTime) {
    const updated = document.createElement('time');

    updated.dateTime = updatedDate ?? '';

    updated.textContent = `Updated ${updatedTime}`;

    meta.append(updated);
  }

  content.append(meta);

  content.append(createArticleBody(article.body));

  container.append(content);
}

export function renderBreakingNews(linkElement, article) {
  if (!linkElement || !article) {
    return;
  }

  linkElement.textContent = article.title || 'Latest article';

  linkElement.href = getArticleUrl(article);
}

export function renderLatestNews(
  container,
  articles,
  { newestArticleId = null } = {},
) {
  if (!container) {
    return;
  }

  container.replaceChildren();

  const articleList = Array.isArray(articles) ? articles.filter(Boolean) : [];

  articleList.forEach((article, index) => {
    const card = document.createElement('article');

    card.className = 'latest-news-card';

    const isNewest = newestArticleId
      ? article.id === newestArticleId
      : index === 0;

    if (isNewest) {
      card.classList.add('latest-news-card--newest');
    }

    const time = document.createElement('time');

    time.className = 'latest-news-card__time';

    time.dateTime = article.created_at ?? '';

    time.textContent = formatRelativeTime(article.created_at);

    const heading = document.createElement('h3');

    heading.className = 'latest-news-card__title';

    const link = document.createElement('a');

    link.href = getArticleUrl(article);

    link.textContent = article.title || 'Untitled article';

    heading.append(link);

    card.append(time, heading);

    container.append(card);
  });
}
