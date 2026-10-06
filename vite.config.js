import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
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
