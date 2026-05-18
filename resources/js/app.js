import { createInertiaApp } from "@inertiajs/svelte";
import initScrollReveal from "./scrollReveal";

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob("./Pages/**/*.svelte", { eager: true });
        return pages[`./Pages/${name}.svelte`];
    },
    setup({ el, App, props }) {
        const app = new App({ target: el, props });
        // initialize scroll reveal for elements with `data-sr`
        initScrollReveal();
        return app;
    },
});
