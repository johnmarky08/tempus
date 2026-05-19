<script>
    export let algorithm;
    export let inputs;
    export let result;
    export let error;
    export let note;

    const runExample =
        "/sample/rfc?date=2026-05-19&temperature=34&humidity=53&wind_speed=16&age_range=18-39&exertion_level=3&run=1";
</script>

<div class="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-6">
    <h1 class="text-3xl font-bold">RFC Temporary Page</h1>
    <p class="text-slate-300">{note}</p>

    <div
        class="rounded-lg border border-slate-700 p-4 bg-slate-900/70 space-y-2"
    >
        <h2 class="text-xl font-semibold">Quick Run URL</h2>
        <a class="text-sky-300 underline break-all" href={runExample}
            >{runExample}</a
        >
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
        <section class="rounded-lg border border-slate-700 p-4 bg-slate-900/70">
            <h2 class="text-xl font-semibold mb-2">Inputs</h2>
            <pre class="text-sm overflow-x-auto">{JSON.stringify(
                    inputs,
                    null,
                    2,
                )}</pre>
        </section>

        <section class="rounded-lg border border-slate-700 p-4 bg-slate-900/70">
            <h2 class="text-xl font-semibold mb-2">Result</h2>
            {#if result}
                <pre class="text-sm overflow-x-auto">{JSON.stringify(
                        result,
                        null,
                        2,
                    )}</pre>
            {:else}
                <p class="text-slate-400">
                    No result yet. Add query params and set run=1.
                </p>
            {/if}
        </section>
    </div>

    {#if error}
        <div class="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
            <h2 class="text-lg font-semibold text-red-300">Error</h2>
            <p class="text-red-200 break-words">{error}</p>
        </div>
    {/if}

    <div class="flex gap-4 text-sm">
        <a class="underline text-sky-300" href="/sample/arimax"
            >Go to ARIMAX sample</a
        >
        <a class="underline text-sky-300" href="/sample/rfr">Go to RFR sample</a
        >
        <a class="underline text-sky-300" href="/">Go home</a>
    </div>
</div>
