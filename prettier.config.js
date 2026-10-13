/** @type {import("prettier").Config} */
const config = {
    tabWidth: 4,
    trailingComma: "all",
    printWidth: 100,
    plugins: ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
    overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
    tailwindStylesheet: "./src/routes/layout.css",
};

export default config;
