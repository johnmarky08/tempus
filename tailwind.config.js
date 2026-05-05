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
                comfortaa: ["Comfortaa", "sans-serif"],
            },
        },
    },
    plugins: [],
};
