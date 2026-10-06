import { getArticles } from '../services/articles.js';

async function init() {
  try {
    const articles = await getArticles();

    console.log('Articles:', articles);
  } catch (error) {
    console.error('Failed to load articles:', error);
  }
}

init();
