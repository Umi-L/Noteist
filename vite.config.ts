import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte()],
    preprocess: vitePreprocess(),
    build: {
        minify: false,
        terserOptions: {
            compress: false,
            mangle: false,
        },
    }
})
