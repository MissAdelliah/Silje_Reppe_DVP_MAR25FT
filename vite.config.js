import { defineConfig } from 'vite';
import { resolve } from 'path';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];

const base =
  process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/';

export default defineConfig({
  base,

  build: {
    rollupOptions: {
      input: {
        home: resolve(process.cwd(), 'index.html'),
        article: resolve(process.cwd(), 'article.html'),
        create: resolve(process.cwd(), 'create.html'),
        login: resolve(process.cwd(), 'login.html'),
      },
    },
  },
});
