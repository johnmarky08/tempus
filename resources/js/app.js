import { createInertiaApp } from "@inertiajs/svelte";
import { router } from "@inertiajs/svelte";
import initScrollReveal from "./scrollReveal";
import {
    beginGlobalLoad,
    endGlobalLoad,
    resetGlobalLoad,
    setGlobalLoaderSubtitle,
} from "./loaderState";
import { defaultLoaderSubtitle, getNavItemByPath } from "./nav.js";

router.on("start", ({ detail }) => {
    const targetPath = detail?.visit?.url?.pathname ?? "/";
    const targetNavItem = getNavItemByPath(targetPath);

    beginGlobalLoad();
    setGlobalLoaderSubtitle(
        targetNavItem?.loaderDescription ?? defaultLoaderSubtitle,
    );
});

router.on("finish", () => {
    if (endGlobalLoad() === 0) {
        setGlobalLoaderSubtitle(defaultLoaderSubtitle);
    }
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
