import tailwindcss from "@tailwindcss/vite";
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { sveltePhosphorOptimize } from "phosphor-svelte/vite";
import { daemonProxy } from "./src/lib/hive/daemon-proxy.ts";

export default defineConfig({
    server: {
        port: 5510,
    },
    plugins: [
        daemonProxy(),
        tailwindcss(),
        sveltekit({
            compilerOptions: {
                // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
                runes: ({ filename }) =>
                    filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
            },
            adapter: adapter({
                fallback: "index.html",
            }),
        }),
        sveltePhosphorOptimize(),
    ],
});
