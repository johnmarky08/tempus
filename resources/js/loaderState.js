import { derived, writable } from "svelte/store";

const activeVisits = writable(0);

export const globalLoaderActive = derived(activeVisits, (count) => count > 0);

export function beginGlobalLoad() {
    activeVisits.update((count) => count + 1);
}

export function endGlobalLoad() {
    activeVisits.update((count) => Math.max(0, count - 1));
}

export function resetGlobalLoad() {
    activeVisits.set(0);
}
