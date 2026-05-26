import { createInertiaApp } from "@inertiajs/svelte";
import { router } from "@inertiajs/svelte";
import initScrollReveal from "./scrollReveal";
import { beginGlobalLoad, endGlobalLoad, resetGlobalLoad } from "./loaderState";

router.on("start", () => {
    beginGlobalLoad();
});

router.on("finish", () => {
    endGlobalLoad();
});

router.on("invalid", () => {
    resetGlobalLoad();
});

router.on("exception", () => {
    resetGlobalLoad();
});

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
    progress: {
        delay: 250,
        color: "#5B8DEF",
        includeCSS: true,
        showSpinner: false,
    },
});
