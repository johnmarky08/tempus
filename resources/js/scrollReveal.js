const DEFAULTS = {
    selector: "[data-sr]",
    root: null,
    rootMargin: "0px 0px -10% 0px",
    threshold: 0.05,
    revealClass: "is-revealed",
    hiddenClass: "is-hidden",
    unobserveOnReveal: true,
    duration: 900,
    easing: "cubic-bezier(.16,.84,.4,1)",
};

let observer = null;
let mutationObserver = null;
let config = {};

function injectDefaultStyles() {
    if (document.getElementById("sr-default-styles")) return;
    const css = `
    .${DEFAULTS.hiddenClass} { opacity: 0; transform: translateY(18px); will-change: transform, opacity; }
    .${DEFAULTS.revealClass} { opacity: 1; transform: none; }
    `;
    const style = document.createElement("style");
    style.id = "sr-default-styles";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
}

function applyInitialStyles(el) {
    if (!el.classList.contains(config.hiddenClass)) {
        el.classList.add(config.hiddenClass);
    }

    const durAttr = el.getAttribute("data-sr-duration");
    const duration = durAttr ? parseInt(durAttr, 10) : config.duration;

    const cs = window.getComputedStyle(el);
    const hasTransition =
        cs.transitionDuration &&
        cs.transitionDuration !== "0s" &&
        cs.transitionProperty &&
        cs.transitionProperty !== "none";
    if (!hasTransition) {
        el.style.transitionProperty = "opacity, transform";
        el.style.transitionDuration = `${duration}ms`;
        el.style.transitionTimingFunction = config.easing;
    }
}

function revealElement(el) {
    el.classList.add(config.revealClass);
    el.classList.remove(config.hiddenClass);
}

function handleIntersect(entries) {
    for (const entry of entries) {
        const el = entry.target;
        if (entry.isIntersecting) {
            const delayAttr =
                el.getAttribute && el.getAttribute("data-sr-delay");
            const delay = delayAttr ? parseInt(delayAttr, 10) : 0;
            if (delay > 0) {
                setTimeout(() => {
                    revealElement(el);
                    if (config.unobserveOnReveal && observer)
                        observer.unobserve(el);
                }, delay);
            } else {
                revealElement(el);
                if (config.unobserveOnReveal && observer)
                    observer.unobserve(el);
            }
        }
    }
}

function observeElement(el) {
    if (!el) return;
    applyInitialStyles(el);
    if (observer) observer.observe(el);
}

function observeNewMatchingNodes(root = document) {
    const nodes = root.querySelectorAll
        ? root.querySelectorAll(config.selector)
        : [];
    nodes.forEach((n) => {
        if (!n.classList.contains(config.revealClass)) observeElement(n);
    });
}

export function initScrollReveal(options = {}) {
    config = Object.assign({}, DEFAULTS, options);

    injectDefaultStyles();

    if (observer) observer.disconnect();
    observer = new IntersectionObserver(handleIntersect, {
        root: config.root,
        rootMargin: config.rootMargin,
        threshold: config.threshold,
    });

    observeNewMatchingNodes(document);

    if (mutationObserver) mutationObserver.disconnect();
    mutationObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.type === "childList") {
                m.addedNodes.forEach((node) => {
                    if (!(node instanceof HTMLElement)) return;
                    if (node.matches && node.matches(config.selector)) {
                        observeElement(node);
                    }

                    observeNewMatchingNodes(node);
                });
            }
        }
    });

    mutationObserver.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true,
    });

    return {
        observe: observeElement,
        disconnect: () => {
            if (observer) observer.disconnect();
            if (mutationObserver) mutationObserver.disconnect();
        },
    };
}

export default initScrollReveal;
