import { createInertiaApp } from "@inertiajs/svelte";
import initScrollReveal from "./scrollReveal";

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob("../pages/**/*.svelte", { eager: true });
        return pages[`../pages/${name}.svelte`];
    },
    setup({ el, App, props }) {
        const app = new App({ target: el, props });
        initScrollReveal();
        return app;
    },
});
