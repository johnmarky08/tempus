/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.js",
        "./resources/**/*.svelte",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                jetbrainsMono: ["JetBrains Mono", "monospace"],
                spaceGrotesk: ["Space Grotesk", "sans-serif"],
            },
        },
    },
    plugins: [],
};
