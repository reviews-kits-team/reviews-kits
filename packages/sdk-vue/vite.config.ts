import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReviewsKit',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', '@tanstack/vue-query'],
      output: {
        globals: {
          vue: 'Vue',
          '@tanstack/vue-query': 'VueQuery',
        },
      },
    },
  },
});
