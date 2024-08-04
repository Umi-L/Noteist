// vite.config.ts
import { defineConfig } from "file:///C:/Users/julia/Projects/Noteist/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///C:/Users/julia/Projects/Noteist/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { vitePreprocess } from "file:///C:/Users/julia/Projects/Noteist/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
var vite_config_default = defineConfig({
    plugins: [svelte()],
    preprocess: vitePreprocess(),
    build: {
        rollupOptions: {
            external: [
                "/js/neutralino.js"
            ]
        }
    }
});
export {
    vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxqdWxpYVxcXFxQcm9qZWN0c1xcXFx3cml0ZW92ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGp1bGlhXFxcXFByb2plY3RzXFxcXHdyaXRlb3ZlclxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvanVsaWEvUHJvamVjdHMvd3JpdGVvdmVyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSAnQHN2ZWx0ZWpzL3ZpdGUtcGx1Z2luLXN2ZWx0ZSdcclxuaW1wb3J0IHsgdml0ZVByZXByb2Nlc3MgfSBmcm9tICdAc3ZlbHRlanMvdml0ZS1wbHVnaW4tc3ZlbHRlJztcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW3N2ZWx0ZSgpIF0sXHJcbiAgcHJlcHJvY2Vzczogdml0ZVByZXByb2Nlc3MoKSxcclxuICBidWlsZDoge1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBleHRlcm5hbDogW1xyXG4gICAgICAgICAgXCIvanMvbmV1dHJhbGluby5qc1wiXHJcbiAgICAgIF1cclxuICAgIH1cclxuICB9XHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1IsU0FBUyxvQkFBb0I7QUFDNVQsU0FBUyxjQUFjO0FBQ3ZCLFNBQVMsc0JBQXNCO0FBRy9CLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxPQUFPLENBQUU7QUFBQSxFQUNuQixZQUFZLGVBQWU7QUFBQSxFQUMzQixPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDTjtBQUFBLE1BQ0o7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
