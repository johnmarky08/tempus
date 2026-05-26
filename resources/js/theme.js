import { writable } from "svelte/store";

const storedTheme = localStorage.getItem("theme")
    ? localStorage.getItem("theme") === "dark"
    : true;
export const dark = writable(storedTheme);

dark.subscribe((value) => {
    localStorage.setItem("theme", value ? "dark" : "light");
});
