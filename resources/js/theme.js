import { writable } from "svelte/store";

const theme = localStorage.getItem("theme")
    ? localStorage.getItem("theme") === "dark"
    : true;

export const dark = writable(theme);

dark.subscribe((value) => {
    localStorage.setItem("theme", value ? "dark" : "light");
});
