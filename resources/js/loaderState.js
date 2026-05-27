import { derived, writable } from "svelte/store";
import { defaultLoaderSubtitle } from "./nav.js";

const activeVisits = writable(0);
const loaderSubtitle = writable(defaultLoaderSubtitle);

export const globalLoaderActive = derived(activeVisits, (count) => count > 0);
export const globalLoaderSubtitle = {
    subscribe: loaderSubtitle.subscribe,
};

export function beginGlobalLoad() {
    activeVisits.update((count) => count + 1);
}

export function endGlobalLoad() {
    return activeVisits.update((count) => Math.max(0, count - 1));
}

export function resetGlobalLoad() {
    activeVisits.set(0);
    loaderSubtitle.set(defaultLoaderSubtitle);
}

export function setGlobalLoaderSubtitle(subtitle) {
    loaderSubtitle.set(subtitle || defaultLoaderSubtitle);
}
