import { getArticles } from '../services/articles.js';
import { initSearchMenu } from '../ui/searchMenu.js';
import { renderNavigation } from '../ui/navigation.js';

const navigation = document.querySelector('#main-navigation');

async function init() {
  initSearchMenu();

  await renderNavigation(navigation);

  try {
    const articles = await getArticles();

    // Article rendering will be handled by ui/articles.js.
  } catch {
    const feedback = document.querySelector('#articles-feedback');

    if (feedback) {
      feedback.textContent = 'Unable to load articles.';
    }
  }
}

init();
