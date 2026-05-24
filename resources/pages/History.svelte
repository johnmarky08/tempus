<script>
    import Layout from "./components/layout.svelte";
    import { historyTableDefaults } from "../js/items.js";
    import { fade, fly } from "svelte/transition";

    export let isActive = "";
    export let isActiveSub = "";
    export let test = "";
    export let model = historyTableDefaults;

    $: heading = model?.heading ?? null;

    let activeFilterKey = null;
    let activeFilterOption = {};

    function toggleFilter(columnKey) {
        activeFilterKey = activeFilterKey === columnKey ? null : columnKey;
    }

    function isActiveFilterOption(columnKey, option) {
        return activeFilterOption?.[columnKey] === option;
    }

    function selectFilterOption(columnKey, option) {
        activeFilterOption = {
            ...activeFilterOption,
            [columnKey]: option,
        };
        activeFilterKey = null;
    }

    function closeFilter() {
        activeFilterKey = null;
    }
</script>

<Layout {isActive} {isActiveSub}>
    <div
        class="relative -mt-20 -mb-20 scale-[0.80] overflow-hidden font-jetbrainsMono text-slate-100"
        role="button"
        tabindex="0"
        on:click={closeFilter}
        on:keydown={(event) => {
            if (
                event.key === "Escape" ||
                event.key === "Enter" ||
                event.key === " "
            ) {
                closeFilter();
            }
        }}
    >
        <div class="absolute inset-0 pointer-events-none">
            <div
                class="absolute -left-20 top-0 h-48 w-48 rounded-full blur-3xl"
            ></div>
            <div
                class="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl"
            ></div>
        </div>

        <div class="relative mx-auto flex w-full max-w-[1120px] flex-col gap-8">
            <div class="flex flex-col gap-2">
                <div class="flex flex-wrap items-end gap-x-4 gap-y-2">
                    {#if heading}
                        <h1
                            data-sr
                            data-sr-delay="80"
                            class="text-3xl font-semibold tracking-[0.02em] text-white sm:text-5xl"
                        >
                            <span data-sr data-sr-delay="120"
                                >{heading.primary}</span
                            >
                            <span
                                data-sr
                                data-sr-delay="180"
                                class="ml-3 text-orange-400"
                                >{heading.accent}</span
                            >
                        </h1>
                    {:else}
                        <h1
                            data-sr
                            data-sr-delay="80"
                            class="text-3xl font-semibold tracking-[0.02em] text-white sm:text-5xl"
                        >
                            {test}
                        </h1>
                    {/if}
                </div>
            </div>

            <div
                data-sr
                data-sr-delay="140"
                class="rounded-[20px] border border-white/35 bg-[#0a1a2d]/78 p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_18px_50px_rgba(1,6,17,0.55)] backdrop-blur-sm"
            >
                <div
                    data-sr
                    data-sr-delay="180"
                    class="overflow-hidden rounded-[18px] border border-white/20 bg-[#102133]/75"
                >
                    <div class="overflow-x-auto">
                        <div
                            data-sr
                            data-sr-delay="220"
                            class="min-w-[840px] px-2 py-2"
                        >
                            <div
                                data-sr
                                data-sr-delay="260"
                                class="rounded-[14px] border border-white/20 bg-white/5"
                            >
                                <div
                                    data-sr
                                    data-sr-delay="300"
                                    class="grid gap-0 rounded-t-[14px] border-b border-white/15 bg-[#1b2530]/95 text-[0.92rem] uppercase tracking-[0.18em] text-white"
                                    style={`grid-template-columns: ${model.gridTemplateColumns};`}
                                >
                                    {#each model.columns as column, columnIndex (column.key)}
                                        <div
                                            class="relative"
                                            role="group"
                                            on:mouseenter={() => {
                                                activeFilterKey = column.key;
                                            }}
                                            on:mouseleave={() => {
                                                activeFilterKey = null;
                                            }}
                                        >
                                            <button
                                                type="button"
                                                data-sr
                                                data-sr-delay={340 +
                                                    columnIndex * 100}
                                                class={`group flex w-full items-center gap-2 px-4 py-3 text-left transition-all duration-300 ${column.align === "left" ? "justify-start" : "justify-center"} ${activeFilterKey === column.key ? "bg-[#243145] text-sky-200" : "hover:bg-[#243145]/90 hover:text-sky-100"}`}
                                                aria-expanded={activeFilterKey ===
                                                    column.key}
                                                on:click|stopPropagation={() =>
                                                    toggleFilter(column.key)}
                                            >
                                                <span>{column.label}</span>
                                                <div
                                                    class={`flex translate-y-[1px] flex-col gap-[2px] opacity-80 transition-transform duration-300 ${activeFilterKey === column.key ? "rotate-0 text-sky-200" : "rotate-180 text-white/85 group-hover:text-sky-200"}`}
                                                >
                                                    <div
                                                        class="h-0 w-0 border-l-[5px] border-r-[5px] border-b-[6px] border-l-transparent border-r-transparent border-b-current"
                                                    ></div>
                                                </div>
                                            </button>

                                            {#if activeFilterKey === column.key}
                                                <div
                                                    class="absolute left-0 top-full z-20 w-full pt-2"
                                                    transition:fly={{
                                                        y: -8,
                                                        duration: 180,
                                                    }}
                                                >
                                                    <div
                                                        class="overflow-hidden rounded-[14px] border border-white bg-[#091423] shadow-[0_20px_40px_rgba(1,6,17,0.45)]"
                                                        transition:fade={{
                                                            duration: 160,
                                                        }}
                                                    >
                                                        {#each column.filterOptions ?? [] as option, optionIndex (option)}
                                                            <button
                                                                type="button"
                                                                class={`group w-full px-4 py-2 text-left text-sm uppercase tracking-[0.14em] transition-colors duration-200 hover:bg-[#6FB8E7]/15 ${optionIndex !== (column.filterOptions ?? []).length - 1 ? "border-b border-white/10" : ""}`}
                                                                on:click|stopPropagation={() =>
                                                                    selectFilterOption(
                                                                        column.key,
                                                                        option,
                                                                    )}
                                                            >
                                                                <span
                                                                    class={`relative inline-block transition-all duration-300 
                                                                    after:content-[''] 
                                                                    after:absolute 
                                                                    after:left-1/2 after:-translate-x-1/2 
                                                                    after:-bottom-1 
                                                                    after:h-[2px] after:w-0 
                                                                    after:bg-[#6FB8E7] 
                                                                    after:transition-all after:duration-300 
                                                                    group-hover:after:w-full 
                                                                    ${isActiveFilterOption(column.key, option) ? "after:w-full text-[#6FB8E7]" : "text-white"}`}
                                                                >
                                                                    {option}
                                                                </span>
                                                            </button>
                                                        {/each}
                                                    </div>
                                                </div>
                                            {/if}
                                        </div>
                                    {/each}
                                </div>

                                <div
                                    data-sr
                                    data-sr-delay="340"
                                    class="flex max-h-[525px] flex-col overflow-y-auto"
                                >
                                    {#each model.rows as row, rowIndex (row.id ?? rowIndex)}
                                        <div
                                            data-sr
                                            class={`grid border-b border-white/8 text-xl text-slate-100 transition-all duration-200 last:border-b-0 hover:bg-white/5 ${rowIndex % 2 === 0 ? "bg-[#0d1b2b]/65" : "bg-[#0b1726]/75"}`}
                                            style={`grid-template-columns: ${model.gridTemplateColumns};`}
                                        >
                                            {#each row.cells as cell, cellIndex (cellIndex)}
                                                <div
                                                    class={`flex items-center px-4 py-3 ${cell.wrapperClass ?? "justify-center"}`}
                                                >
                                                    <span
                                                        class={cell.valueClass ??
                                                            ""}
                                                        >{cell.value}</span
                                                    >
                                                </div>
                                            {/each}
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {#if model?.footer}
                <div
                    class="flex flex-wrap items-center gap-4 px-2 text-sm text-slate-200"
                >
                    <span class="font-semibold text-white"
                        >{model.footer.label}</span
                    >

                    <div class="flex flex-wrap items-center gap-4">
                        {#each model.footer.items as item, footerIndex (item.value ?? footerIndex)}
                            <div class="flex flex-wrap items-center gap-2">
                                <span
                                    class={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${item.tone === "success" ? "border-green-400/70 bg-green-500/15 text-green-300" : "border-red-400/70 bg-red-500/15 text-red-300"}`}
                                >
                                    {item.value}
                                </span>
                                <span class="text-[0.85rem] text-slate-400"
                                    >{item.description}</span
                                >
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </div>
</Layout>
