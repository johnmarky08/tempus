<script>
    import Layout from "./components/layout.svelte";
    import { historyTableDefaults } from "../js/items.js";
    import { dark } from "../js/theme.js";
    import { fade, fly } from "svelte/transition";
    import { searchHistoryRows, sortHistoryRows } from "../js/historyTable.js";

    export let isActive = "";
    export let isActiveSub = "";
    export let test = "";
    export let model = historyTableDefaults;

    $: heading = model?.heading ?? null;
    $: columns = model?.columns ?? [];
    $: rows = model?.rows ?? [];

    let activeFilterKey = null;
    let activeFilterOption = {};
    let searchDraft = "";
    let appliedSearch = "";
    let isColumnFilterOpen = false;
    let visibleColumnKeys = [];
    let hasInitializedColumns = false;
    let visibleRowLimit = 100;

    $: if (!hasInitializedColumns && columns.length) {
        visibleColumnKeys = columns.map((column) => column.key);
        hasInitializedColumns = true;
    }

    $: visibleColumns = columns.filter((column) =>
        visibleColumnKeys.includes(column.key),
    );
    $: rowTextSize =
        heading?.primary === "HEAT INDEX" ? "text-lg" : "text-base";
    $: searchResults = searchHistoryRows(rows, appliedSearch, columns);
    $: activeSortColumnKey = Object.keys(activeFilterOption)[0] ?? null;
    $: activeSortColumn = columns.find(
        (column) => column.key === activeSortColumnKey,
    );
    $: sortedRows = sortHistoryRows(
        searchResults,
        activeSortColumn,
        activeSortColumnKey ? activeFilterOption[activeSortColumnKey] : "",
    );
    $: displayedRows = sortedRows.slice(0, visibleRowLimit);
    $: hasMoreRows = sortedRows.length > visibleRowLimit;
    $: tableGridTemplateColumns = visibleColumns
        .map((column) => column.width ?? "1fr")
        .join(" ");

    function toggleFilter(columnKey) {
        activeFilterKey = activeFilterKey === columnKey ? null : columnKey;
        isColumnFilterOpen = false;
    }

    function isActiveFilterOption(columnKey, option) {
        return activeFilterOption?.[columnKey] === option;
    }

    function selectFilterOption(columnKey, option) {
        activeFilterOption = {
            [columnKey]: option,
        };
        activeFilterKey = null;
        visibleRowLimit = 100;
    }

    function submitSearch() {
        appliedSearch = String(searchDraft ?? "").trim();
        activeFilterKey = null;
        visibleRowLimit = 100;
    }

    function closeFilter() {
        activeFilterKey = null;
        isColumnFilterOpen = false;
    }

    function toggleColumnVisibility(columnKey) {
        if (visibleColumnKeys.includes(columnKey)) {
            visibleColumnKeys = visibleColumnKeys.filter(
                (key) => key !== columnKey,
            );
            visibleRowLimit = 100;

            return;
        }

        visibleColumnKeys = [...visibleColumnKeys, columnKey];
        visibleRowLimit = 100;
    }

    function showMoreRows() {
        visibleRowLimit += 100;
    }

    function isColumnVisible(columnKey) {
        return visibleColumnKeys.includes(columnKey);
    }
</script>

<Layout {isActive} {isActiveSub}>
    <div
        class="relative cursor-default -mt-20 -mb-20 scale-[0.80] overflow-hidden font-jetbrainsMono {$dark
            ? 'text-slate-100'
            : 'text-[var(--primary-text)]'}"
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
                            class="text-3xl font-semibold tracking-[0.02em] dark:text-white text-[var(--primary-text)] transition-all duration-300 ease-out sm:text-5xl"
                        >
                            <span data-sr data-sr-delay="120"
                                >{heading.primary}</span
                            >
                            <span
                                data-sr
                                data-sr-delay="180"
                                class="ml-3 text-orange-400"
                            >
                                {heading.accent}
                            </span>
                        </h1>
                    {:else}
                        <h1
                            data-sr
                            data-sr-delay="80"
                            class="text-3xl font-semibold tracking-[0.02em] dark:text-white text-[var(--primary-text)] transition-all duration-300 ease-out sm:text-5xl"
                        >
                            {test}
                        </h1>
                    {/if}
                </div>
            </div>

            <div
                role="presentation"
                class="relative z-40 flex flex-col gap-4 rounded-[20px] border p-4
                 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_50px_rgba(1,6,17,0.4)] backdrop-blur-sm {$dark
                    ? 'border-white/25 bg-[#081624]/85'
                    : 'border-[var(--border-color)] bg-[var(--panel-bg)]'}"
                on:click|stopPropagation
            >
                <form
                    name="searchForm"
                    class="flex flex-col gap-3 lg:flex-row"
                    on:submit|preventDefault={submitSearch}
                >
                    <div class="relative flex-1">
                        <input
                            bind:value={searchDraft}
                            type="search"
                            placeholder={model?.searchPlaceholder ??
                                "Search history"}
                            class="w-full rounded-[16px] border px-5 py-3 pr-14 text-sm tracking-[0.12em] outline-none transition-all duration-300 focus:border-sky-400/60 focus:shadow-[0_0_0_1px_rgba(56,189,248,0.15)] {$dark
                                ? 'border-white/15 bg-[#0f2236] dark:text-slate-100 text-[var(--primary-text)] dark:placeholder:text-slate-500 placeholder:text-[var(--text-primary)] focus:bg-[#12263d]'
                                : 'border-[var(--border-color)] bg-[var(--panel-bg)] text-[var(--primary-text)] placeholder:text-[var(--muted-text)] focus:bg-[var(--hover)]'}"
                            on:keydown={(event) => {
                                if (event.key === "Enter") {
                                    submitSearch();
                                }
                            }}
                        />

                        <button
                            type="submit"
                            class="absolute right-2 top-1/2 -translate-y-1/2 rounded-[12px] border border-sky-400/30 bg-sky-500/15 px-3 py-2 text-sky-100 transition-colors duration-200 hover:bg-sky-400/25"
                            aria-label="Search history"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                class="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                                circle
                                cx="11"
                                cy="11"
                                r="7"
                            >
                                <path d="m20 20-3.5-3.5"></path>
                            </svg>
                        </button>
                    </div>

                    <div class="relative lg:w-[13rem]">
                        <button
                            type="button"
                            class="flex w-full items-center justify-between rounded-[16px] border px-5 py-3 text-sm uppercase tracking-[0.16em] transition-all duration-300 hover:border-sky-400/50 {$dark
                                ? 'border-white/15 bg-[#0f2236] dark:text-slate-100 text-[var(--primary-text)] hover:bg-[#12263d]'
                                : 'border-[var(--border-color)] bg-[var(--panel-bg)] text-[var(--primary-text)] hover:bg-[var(--hover)]'}"
                            on:click|stopPropagation={() => {
                                isColumnFilterOpen = !isColumnFilterOpen;
                                activeFilterKey = null;
                            }}
                        >
                            <span>Columns</span>
                            <span class="text-sky-300"
                                >{visibleColumnKeys.length}</span
                            >
                        </button>

                        {#if isColumnFilterOpen}
                            <div
                                class="absolute right-0 top-full z-50 mt-3 w-full
                                    min-w-[17rem] overflow-hidden rounded-[18px] border shadow-[0_24px_45px_rgba(1,6,17,0.55)] {$dark
                                    ? 'border-white/20 bg-[#091423]'
                                    : 'border-[var(--border-color)] bg-[var(--panel-bg)]'}"
                                transition:fly={{ y: -8, duration: 180 }}
                            >
                                <div
                                    class="border-b px-4 py-3 text-xs uppercase tracking-[0.24em] {$dark
                                        ? 'border-white/10 text-slate-400'
                                        : 'border-[var(--border-color)] text-[var(--secondary-text)]'}"
                                >
                                    Show columns
                                </div>
                                <div class="max-h-72 overflow-y-auto p-2">
                                    {#each columns as column (column.key)}
                                        <label
                                            class="flex items-center justify-between rounded-[14px] px-3 py-2 text-sm transition-colors duration-200 {$dark
                                                ? 'text-slate-100 hover:bg-white/5'
                                                : 'text-[var(--secondary-text)] hover:bg-[var(--hover)]'}"
                                        >
                                            <span>{column.label}</span>
                                            <div class="flex items-center">
                                                <div class="relative w-5 h-5">
                                                    <input
                                                        type="checkbox"
                                                        checked={isColumnVisible(
                                                            column.key,
                                                        )}
                                                        on:change={() =>
                                                            toggleColumnVisibility(
                                                                column.key,
                                                            )}
                                                        class="sr-only peer absolute inset-0 w-full h-full"
                                                    />

                                                    <div
                                                        class="w-5 h-5 rounded-md border border-white/30 bg-[#071427] transition-colors duration-150 peer-checked:border-sky-400 peer-checked:bg-sky-500/10"
                                                    ></div>

                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white/90 peer-checked:text-sky-400 opacity-0 peer-checked:opacity-100 transition-all duration-300 pointer-events-none"
                                                        fill="currentColor"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            d="M20.285 6.709a1 1 0 0 0-1.414-1.418l-9.193 9.193-3.172-3.172a1 1 0 1 0-1.414 1.414l3.88 3.88a1 1 0 0 0 1.414 0l9.899-9.897z"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </label>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </div>
                </form>

                {#if appliedSearch}
                    <div
                        class="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] dark:text-slate-400 text-[var(--primary-text)]"
                    >
                        <span
                            class="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-sky-200"
                        >
                            Search: {appliedSearch}
                        </span>
                        <button
                            type="button"
                            class="rounded-full border border-white/15 px-3 py-1 dark:text-slate-300 text-[var(--primary-text)] transition-colors duration-200 hover:border-white/30 hover:text-white"
                            on:click|stopPropagation={() => {
                                searchDraft = "";
                                appliedSearch = "";
                                visibleRowLimit = 100;
                            }}
                        >
                            Clear
                        </button>
                    </div>
                {/if}
            </div>

            <div
                data-sr
                data-sr-delay="140"
                role="presentation"
                class="relative z-10 rounded-[20px] border p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_18px_50px_rgba(1,6,17,0.55)] backdrop-blur-sm {$dark
                    ? 'border-white/35 bg-[#0a1a2d]/78'
                    : 'border-[var(--border-color)] bg-[var(--panel-bg)]'}"
                on:click|stopPropagation
            >
                <div
                    data-sr
                    data-sr-delay="180"
                    class="overflow-hidden rounded-[18px] border {$dark
                        ? 'border-white/20 bg-[#102133]/75'
                        : 'border-[var(--border-color)] bg-[var(--panel-bg)]'}"
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
                                class="grid gap-0 rounded-t-[14px] border-b text-[0.92rem] uppercase tracking-[0.18em] {$dark
                                    ? 'border-white/15 bg-[#1b2530]/95 text-white'
                                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--primary-text)]'}"
                                style={`grid-template-columns: ${tableGridTemplateColumns || model.gridTemplateColumns};`}
                            >
                                {#each visibleColumns as column, columnIndex (column.key)}
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
                                        {#if column.filterOptions?.length}
                                            <button
                                                type="button"
                                                data-sr
                                                data-sr-delay={340 +
                                                    columnIndex * 100}
                                                class={`group flex w-full items-center gap-2 px-4 py-3 text-left transition-all duration-300 ${column.align === "left" ? "justify-start" : "justify-center"} ${$dark ? (activeFilterKey === column.key ? "bg-[#243145] text-sky-200" : "hover:bg-[#243145]/90 hover:text-sky-100") : activeFilterKey === column.key ? "bg-[var(--active-bg)] text-[var(--primary-text)]" : "hover:bg-[var(--active-bg)] hover:text-[var(--primary-text)]"}`}
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
                                                        class="overflow-hidden rounded-[14px] border shadow-[0_20px_40px_rgba(1,6,17,0.45)] {$dark
                                                            ? 'border-white bg-[#091423]'
                                                            : 'border-[var(--border-color)] bg-[var(--panel-bg)] shadow-[0_20px_40px_rgba(59,130,246,0.12)]'}"
                                                        transition:fade={{
                                                            duration: 160,
                                                        }}
                                                    >
                                                        {#each column.filterOptions ?? [] as option, optionIndex (option)}
                                                            <button
                                                                type="button"
                                                                class={`group w-full px-4 py-2 text-left text-sm uppercase tracking-[0.14em] transition-colors duration-200 ${$dark ? "bg-[#091423] text-white hover:bg-[var(--accent)]/15" : "bg-[var(--panel-bg)] text-[var(--primary-text)] hover:bg-[var(--active-bg)]"} ${optionIndex !== (column.filterOptions ?? []).length - 1 ? ($dark ? "border-b border-white/10" : "border-b border-[var(--border-color)]") : ""}`}
                                                                on:click|stopPropagation={() =>
                                                                    selectFilterOption(
                                                                        column.key,
                                                                        option,
                                                                    )}
                                                            >
                                                                <span
                                                                    class={`relative inline-block transition-all duration-300 after:absolute after:-bottom-1 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:bg-[var(--accent)] after:transition-all after:duration-300 group-hover:after:w-full ${isActiveFilterOption(column.key, option) ? "after:w-full text-[var(--accent)]" : $dark ? "text-white" : "text-[var(--primary-text)]"}`}
                                                                >
                                                                    {option}
                                                                </span>
                                                            </button>
                                                        {/each}
                                                    </div>
                                                </div>
                                            {/if}
                                        {:else}
                                            <div
                                                class={`flex items-center px-4 py-3 ${column.align === "left" ? "justify-start" : "justify-center"}`}
                                            >
                                                <span>{column.label}</span>
                                            </div>
                                        {/if}
                                    </div>
                                {/each}
                            </div>

                            <div
                                class="flex max-h-[525px] flex-col overflow-y-auto"
                            >
                                {#if visibleColumns.length === 0}
                                    <div
                                        class="flex min-h-[240px] items-center justify-center rounded-b-[14px] bg-[#0d1b2b]/65 px-6 py-10 text-sm uppercase tracking-[0.18em] dark:text-slate-400 text-[var(--primary-text)]"
                                    >
                                        No columns selected.
                                    </div>
                                {:else if sortedRows.length === 0}
                                    <div
                                        class="flex min-h-[240px] items-center justify-center rounded-b-[14px] px-6 py-10 text-sm uppercase tracking-[0.18em] {$dark
                                            ? 'bg-[#0d1b2b]/65 text-slate-400'
                                            : 'bg-[var(--bg-secondary)] text-[var(--primary-text)]'}"
                                        transition:fade={{ duration: 180 }}
                                    ></div>
                                {:else}
                                    {#each displayedRows as row, rowIndex (row.id)}
                                        <div
                                            data-sr
                                            class={`grid border-b ${rowTextSize} transition-all duration-200 last:border-b-0 ${$dark ? "border-white/8 dark:text-slate-100 text-[var(--primary-text)] hover:bg-white/5" : "border-[var(--border-color)] text-[var(--primary-text)] hover:bg-[var(--active-bg)]"} ${rowIndex % 2 === 0 ? ($dark ? "bg-[#0d1b2b]/65" : "bg-[var(--panel-bg)]") : $dark ? "bg-[#0b1726]/75" : "bg-[var(--bg-secondary)]"}`}
                                            style={`grid-template-columns: ${tableGridTemplateColumns || model.gridTemplateColumns};`}
                                        >
                                            {#each visibleColumns as column (column.key)}
                                                <div
                                                    class={`flex items-center px-4 py-3 ${row.cellsByKey?.[column.key]?.wrapperClass ?? "justify-center"}`}
                                                >
                                                    <span
                                                        class={row.cellsByKey?.[
                                                            column.key
                                                        ]?.valueClass ??
                                                            "text-[var(--primary-text)]"}
                                                    >
                                                        {row.cellsByKey?.[
                                                            column.key
                                                        ]?.value}
                                                    </span>
                                                </div>
                                            {/each}
                                        </div>
                                    {/each}

                                    {#if hasMoreRows}
                                        <button
                                            type="button"
                                            class={`grid w-full border-b text-xl transition-all duration-200 last:border-b-0 ${$dark ? "border-white/8 dark:text-slate-100 text-[var(--primary-text)] transition duration-300 ease-out hover:bg-white/5" : "border-[var(--border-color)] text-[var(--primary-text)] hover:bg-[var(--bg-secondary)]"} ${displayedRows.length % 2 === 0 ? ($dark ? "bg-[#0d1b2b]/65" : "bg-[var(--panel-bg)]") : $dark ? "bg-[#0b1726]/75" : "bg-[var(--bg-secondary)]"}`}
                                            style={`grid-template-columns: ${tableGridTemplateColumns || model.gridTemplateColumns};`}
                                            on:click|stopPropagation={showMoreRows}
                                        >
                                            <span
                                                class={`col-span-full flex items-center justify-center px-4 py-4 text-sm uppercase tracking-[0.22em] transition-colors duration-200 ${$dark ? "text-sky-200 hover:text-white" : "text-[var(--active-border)] hover:text-[var(--primary-text)]"}`}
                                            >
                                                Show more
                                            </span>
                                        </button>
                                    {/if}
                                {/if}
                            </div>
                        </div>
                    </div>
                    <div
                        class="border-t px-4 py-3 backdrop-blur-sm {$dark
                            ? 'border-white/10 bg-[#091423]/95'
                            : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'}"
                    >
                        <div
                            class="flex flex-wrap items-center justify-between gap-3 text-sm {$dark
                                ? 'text-slate-300'
                                : 'text-[var(--primary-text)]'}"
                        >
                            <div
                                class="flex flex-wrap items-center gap-3 uppercase tracking-[0.18em]"
                            >
                                <span
                                    class="rounded-full border px-3 py-1 text-[0.72rem] {$dark
                                        ? 'border-sky-400/25 bg-sky-500/10 text-sky-200'
                                        : 'border-[var(--border-color)] bg-[var(--panel-bg)] text-[var(--active-border)]'}"
                                >
                                    Showing {displayedRows.length} of {sortedRows.length}
                                </span>
                                <span class="text-[0.72rem] text-slate-500">
                                    {Math.max(
                                        sortedRows.length -
                                            displayedRows.length,
                                        0,
                                    )} remaining
                                </span>
                            </div>

                            <div
                                class="text-[0.72rem] uppercase tracking-[0.2em] text-slate-500"
                            >
                                {#if hasMoreRows}
                                    More rows available
                                {:else}
                                    All rows are visible
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {#if model?.footer}
                <div
                    class="flex flex-wrap items-center gap-4 px-2 text-sm dark:text-slate-200 text-[var(--secondary-text)] transition-all duration-300 ease-out"
                >
                    <span
                        class="font-semibold dark:text-white text-black transition-all duration-300 ease-out"
                        >{model.footer.label}</span
                    >

                    <div class="flex flex-wrap items-center gap-4">
                        {#each model.footer.items as item, footerIndex (item.value ?? footerIndex)}
                            <div class="flex flex-wrap items-center gap-2">
                                <span
                                    class={`transition-all duration-300 ease-out rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${item.tone === "success" ? "border-green-400/70 bg-green-500/15 dark:text-green-300 text-green-600 " : "border-red-400/70 bg-red-500/15 dark:text-red-300 text-red-600 "}`}
                                >
                                    {item.value}
                                </span>
                                <span
                                    class="text-[0.85rem] dark:text-slate-400 text-[var(--primary-text)]"
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
