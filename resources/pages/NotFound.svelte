<script>
    import Layout from "./components/layout.svelte";
    import { inertia } from "@inertiajs/svelte";

    export let errors = null;

    void errors;
</script>

<svelte:head>
    <title>404 | T.E.M.P.U.S.</title>
</svelte:head>

<Layout>
    <div
        class="flex min-h-[60vh] items-center justify-center text-center text-white"
    >
        <div class="space-y-4">
            <div
                class="inline-flex items-center gap-3 rounded-full border border-sky-300/30 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-sky-100"
            >
                <span class="h-2 w-2 rounded-full bg-sky-300"></span>
                Error 404
            </div>

            <h1 class="text-5xl font-bold tracking-tight sm:text-6xl">
                Page Not Found.
            </h1>

            <p class="text-sm text-slate-300 sm:text-base">
                Hmm, this doesn't seem like the right place. Let's go back home.
            </p>

            <a
                use:inertia
                href="/home"
                class="inline-flex items-center gap-3 rounded-full border border-sky-300/30 bg-sky-400/10 px-6 py-3 text-sm font-semibold text-sky-100 transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/50 hover:bg-sky-400/20"
            >
                <span class="ri-arrow-go-back-fill text-sky-300"></span>
                Back to Home
            </a>
        </div>
    </div>
</Layout>
