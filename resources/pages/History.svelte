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
    let isMobileVisibilityOpen = false;
    let isMobileFilterColumnOpen = false;
    let isMobileFilterOptionOpen = false;
    let mobileFilterColumnKey = null;
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
    $: mobileFilterableColumns = columns.filter(
        (column) => column.filterOptions?.length,
    );
    $: if (
        mobileFilterableColumns.length &&
        !mobileFilterableColumns.some(
            (column) => column.key === mobileFilterColumnKey,
        )
    ) {
        mobileFilterColumnKey = mobileFilterableColumns[0].key;
    }
    $: mobileFilterColumn = mobileFilterableColumns.find(
        (column) => column.key === mobileFilterColumnKey,
    );
    $: mobileFilterOptions = mobileFilterColumn?.filterOptions ?? [];
    $: mobileFilterValue =
        mobileFilterColumnKey && activeFilterOption?.[mobileFilterColumnKey]
            ? activeFilterOption[mobileFilterColumnKey]
            : null;
    $: rowTextSize =
        heading?.primary === "HEAT INDEX"
            ? "text-base lg:text-lg"
            : "text-sm lg:text-base";
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

    function toggleMobileFilterColumn() {
        if (!mobileFilterableColumns.length) return;

        isMobileFilterColumnOpen = !isMobileFilterColumnOpen;
        isMobileFilterOptionOpen = false;
        isMobileVisibilityOpen = false;
    }

    function toggleMobileVisibilityMenu() {
        if (!columns.length) return;

        isMobileVisibilityOpen = !isMobileVisibilityOpen;
        isMobileFilterColumnOpen = false;
        isMobileFilterOptionOpen = false;
    }

    function toggleMobileFilterOption() {
        if (!mobileFilterColumn) return;

        isMobileFilterOptionOpen = !isMobileFilterOptionOpen;
        isMobileFilterColumnOpen = false;
        isMobileVisibilityOpen = false;
    }

    function selectMobileFilterColumn(columnKey) {
        mobileFilterColumnKey = columnKey;
        isMobileFilterColumnOpen = false;
        isMobileFilterOptionOpen = false;
    }

    function selectMobileFilterOption(option) {
        if (!mobileFilterColumnKey) return;

        selectFilterOption(mobileFilterColumnKey, option);
        isMobileFilterOptionOpen = false;
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
        isMobileVisibilityOpen = false;
        isMobileFilterColumnOpen = false;
        isMobileFilterOptionOpen = false;
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
    <!-- Root container: base is full scale; lg applies the original -mt-20/-mb-20 scale-[0.80] -->
    <div
        class="relative cursor-default
               mt-0 mb-0 scale-100 overflow-hidden font-jetbrainsMono
               lg:-mt-20 lg:-mb-20 lg:scale-[0.80]
               {$dark ? 'text-slate-100' : 'text-[var(--primary-text)]'}"
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
        <!-- Decorative blobs -->
        <div class="absolute inset-0 pointer-events-none">
            <div
                class="absolute -left-10 top-0
                       h-24 w-24
                       sm:h-32 sm:w-32
                       lg:-left-20 lg:h-48 lg:w-48
                       rounded-full blur-3xl"
            ></div>
            <div
                class="absolute bottom-0 right-0
                       h-28 w-28
                       sm:h-36 sm:w-36
                       lg:h-56 lg:w-56
                       rounded-full bg-orange-500/10 blur-3xl"
            ></div>
        </div>

        <!-- Main content column -->
        <div
            class="relative mx-auto flex w-full max-w-[1120px] flex-col
                    gap-4 px-3
                    sm:gap-5 sm:px-4
                    lg:gap-8 lg:px-0"
        >
            <!-- Heading block -->
            <div class="flex flex-col gap-1 lg:gap-2">
                <div
                    class="flex flex-wrap items-end gap-x-2 gap-y-1 lg:gap-x-4 lg:gap-y-2"
                >
                    {#if heading}
                        <h1
                            data-sr
                            data-sr-delay="80"
                            class="font-semibold tracking-[0.02em]
                                   text-xl
                                   sm:text-2xl
                                   lg:text-5xl
                                   dark:text-white text-[var(--primary-text)] transition-all duration-300 ease-out"
                        >
                            <span data-sr data-sr-delay="120"
                                >{heading.primary}</span
                            >
                            <span
                                data-sr
                                data-sr-delay="180"
                                class="ml-1 lg:ml-3 text-orange-400"
                            >
                                {heading.accent}
                            </span>
                        </h1>
                    {:else}
                        <h1
                            data-sr
                            data-sr-delay="80"
                            class="font-semibold tracking-[0.02em]
                                   text-xl
                                   sm:text-2xl
                                   lg:text-5xl
                                   dark:text-white text-[var(--primary-text)] transition-all duration-300 ease-out"
                        >
                            {test}
                        </h1>
                    {/if}
                </div>
            </div>

            <!-- Search + Columns filter bar -->
            <div
                role="presentation"
                class="relative z-40 flex flex-col
                       gap-3 rounded-[14px] border p-3
                       sm:gap-3 sm:rounded-[16px] sm:p-3
                       lg:gap-4 lg:rounded-[20px] lg:p-4
                       shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_50px_rgba(1,6,17,0.4)] backdrop-blur-sm
                       {$dark
                    ? 'border-white/25 bg-[#081624]/85'
                    : 'border-[var(--border-color)] bg-[#f4f8fd]'}"
                on:click|stopPropagation
            >
                <form
                    name="searchForm"
                    class="flex flex-col gap-2 lg:flex-row lg:gap-3"
                    on:submit|preventDefault={submitSearch}
                >
                    {#if columns.length}
                        <div class="flex flex-col gap-2 lg:hidden">
                            <div class="relative">
                                <button
                                    type="button"
                                    class="flex w-full items-center justify-between border transition-all duration-300 hover:border-sky-400/50 rounded-[12px] px-3 py-2 text-xs tracking-[0.14em] uppercase {$dark
                                        ? 'border-white/15 bg-[#0f2236] dark:text-slate-100 text-[var(--primary-text)] hover:bg-[#12263d]'
                                        : 'border-[var(--border-color)] bg-[var(--panel-bg)] text-[var(--primary-text)] hover:bg-[#dceeff]'}"
                                    on:click|stopPropagation={toggleMobileVisibilityMenu}
                                >
                                    <span>Visible columns</span>
                                    <span class="text-sky-300"
                                        >{visibleColumnKeys.length}</span
                                    >
                                </button>

                                {#if isMobileVisibilityOpen}
                                    <div
                                        class="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-[14px] border shadow-[0_24px_45px_rgba(1,6,17,0.55)] {$dark
                                            ? 'border-white/20 bg-[#091423]'
                                            : 'border-[var(--border-color)] bg-[var(--panel-bg)]'}"
                                        transition:fly={{
                                            y: -8,
                                            duration: 180,
                                        }}
                                    >
                                        <div class="max-h-60 overflow-y-auto">
                                            {#each columns as column (column.key)}
                                                <label
                                                    class="flex w-full cursor-pointer items-center justify-between border-b px-3 py-2 text-left text-xs uppercase tracking-[0.12em] last:border-b-0 {$dark
                                                        ? 'border-white/10 text-slate-100 hover:bg-white/5'
                                                        : 'border-[var(--border-color)] text-[var(--primary-text)] hover:bg-[#dceeff]'}"
                                                >
                                                    <span>{column.label}</span>
                                                    <span
                                                        class="relative h-4 w-4"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isColumnVisible(
                                                                column.key,
                                                            )}
                                                            on:change={() =>
                                                                toggleColumnVisibility(
                                                                    column.key,
                                                                )}
                                                            class="sr-only peer absolute inset-0 h-full w-full"
                                                            aria-label={`Toggle ${column.label} visibility`}
                                                        />
                                                        <div
                                                            class="h-4 w-4 rounded-md border dark:border-white/30 border-sky-400 dark:bg-[#071427] transition-colors duration-150 peer-checked:border-sky-400 peer-checked:bg-sky-500/10"
                                                        ></div>
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            class="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white/90 opacity-0 peer-checked:opacity-100 peer-checked:text-sky-400 transition-all duration-300 pointer-events-none"
                                                            fill="currentColor"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                d="M20.285 6.709a1 1 0 0 0-1.414-1.418l-9.193 9.193-3.172-3.172a1 1 0 1 0-1.414 1.414l3.88 3.88a1 1 0 0 0 1.414 0l9.899-9.897z"
                                                            />
                                                        </svg>
                                                    </span>
                                                </label>
                                            {/each}
                                        </div>
                                    </div>
                                {/if}
                            </div>

                            {#if mobileFilterableColumns.length}
                                <div class="relative">
                                    <button
                                        type="button"
                                        class="flex w-full items-center justify-between border transition-all duration-300 hover:border-sky-400/50 rounded-[12px] px-3 py-2 text-xs tracking-[0.14em] uppercase {$dark
                                            ? 'border-white/15 bg-[#0f2236] dark:text-slate-100 text-[var(--primary-text)] hover:bg-[#12263d]'
                                            : 'border-[var(--border-color)] bg-[var(--panel-bg)] text-[var(--primary-text)] hover:bg-[#dceeff]'}"
                                        on:click|stopPropagation={toggleMobileFilterColumn}
                                    >
                                        <span
                                            >{mobileFilterColumn?.label ??
                                                "Filter column"}</span
                                        >
                                        <span class="text-sky-300">▾</span>
                                    </button>

                                    {#if isMobileFilterColumnOpen}
                                        <div
                                            class="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-[14px] border shadow-[0_24px_45px_rgba(1,6,17,0.55)] {$dark
                                                ? 'border-white/20 bg-[#091423]'
                                                : 'border-[var(--border-color)] bg-[var(--panel-bg)]'}"
                                            transition:fly={{
                                                y: -8,
                                                duration: 180,
                                            }}
                                        >
                                            {#each mobileFilterableColumns as column (column.key)}
                                                <button
                                                    type="button"
                                                    class="flex w-full items-center justify-between border-b px-3 py-2 text-left text-xs uppercase tracking-[0.12em] last:border-b-0 {$dark
                                                        ? 'border-white/10 text-slate-100 hover:bg-white/5'
                                                        : 'border-[var(--border-color)] text-[var(--primary-text)] hover:bg-[#dceeff]'}"
                                                    on:click|stopPropagation={() =>
                                                        selectMobileFilterColumn(
                                                            column.key,
                                                        )}
                                                >
                                                    <span>{column.label}</span>
                                                    {#if mobileFilterColumnKey === column.key}
                                                        <span
                                                            class="text-sky-300"
                                                            >•</span
                                                        >
                                                    {/if}
                                                </button>
                                            {/each}
                                        </div>
                                    {/if}
                                </div>

                                <div class="relative">
                                    <button
                                        type="button"
                                        class="flex w-full items-center justify-between border transition-all duration-300 hover:border-sky-400/50 rounded-[12px] px-3 py-2 text-xs tracking-[0.14em] uppercase {$dark
                                            ? 'border-white/15 bg-[#0f2236] dark:text-slate-100 text-[var(--primary-text)] hover:bg-[#12263d]'
                                            : 'border-[var(--border-color)] bg-[var(--panel-bg)] text-[var(--primary-text)] hover:bg-[#dceeff]'}"
                                        on:click|stopPropagation={toggleMobileFilterOption}
                                        disabled={!mobileFilterColumn}
                                    >
                                        <span
                                            >{mobileFilterValue ??
                                                "Filter option"}</span
                                        >
                                        <span class="text-sky-300">▾</span>
                                    </button>

                                    {#if isMobileFilterOptionOpen && mobileFilterColumn}
                                        <div
                                            class="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-[14px] border shadow-[0_24px_45px_rgba(1,6,17,0.55)] {$dark
                                                ? 'border-white/20 bg-[#091423]'
                                                : 'border-[var(--border-color)] bg-[var(--panel-bg)]'}"
                                            transition:fly={{
                                                y: -8,
                                                duration: 180,
                                            }}
                                        >
                                            {#each mobileFilterOptions as option (option)}
                                                <button
                                                    type="button"
                                                    class="flex w-full items-center justify-between border-b px-3 py-2 text-left text-xs uppercase tracking-[0.12em] last:border-b-0 {$dark
                                                        ? 'border-white/10 text-slate-100 hover:bg-white/5'
                                                        : 'border-[var(--border-color)] text-[var(--primary-text)] hover:bg-[#dceeff]'}"
                                                    on:click|stopPropagation={() =>
                                                        selectMobileFilterOption(
                                                            option,
                                                        )}
                                                >
                                                    <span>{option}</span>
                                                    {#if isActiveFilterOption(mobileFilterColumn.key, option)}
                                                        <span
                                                            class="text-sky-300"
                                                            >•</span
                                                        >
                                                    {/if}
                                                </button>
                                            {/each}
                                        </div>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                    {/if}

                    <!-- Search input -->
                    <div class="relative flex-1">
                        <input
                            bind:value={searchDraft}
                            type="search"
                            placeholder={model?.searchPlaceholder ??
                                "Search history"}
                            class="w-full border outline-none transition-all duration-300
                                   rounded-[12px] px-3 py-2 pr-12 text-xs tracking-[0.10em]
                                   sm:rounded-[14px] sm:px-4 sm:py-2.5 sm:pr-13 sm:text-xs sm:tracking-[0.11em]
                                   lg:rounded-[16px] lg:px-5 lg:py-3 lg:pr-14 lg:text-sm lg:tracking-[0.12em]
                                   focus:border-sky-400/60 focus:shadow-[0_0_0_1px_rgba(56,189,248,0.15)]
                                   {$dark
                                ? 'border-white/15 bg-[#0f2236] dark:text-slate-100 text-[var(--primary-text)] dark:placeholder:text-slate-500 placeholder:text-[var(--text-primary)] focus:bg-[#12263d]'
                                : 'border-[var(--border-color)] bg-[var(--panel-bg)] text-[var(--primary-text)] placeholder:text-[var(--muted-text)] focus:bg-[#dceeff]'}"
                            on:keydown={(event) => {
                                if (event.key === "Enter") {
                                    submitSearch();
                                }
                            }}
                        />

                        <button
                            type="submit"
                            class="absolute right-2 top-1/2 -translate-y-1/2
                                   rounded-[10px] px-2 py-1.5
                                   lg:rounded-[12px] lg:px-3 lg:py-2
                                   border border-sky-400/30 bg-sky-500/15 text-[var(--primary-text)] dark:text-sky-100 transition-colors duration-200 dark:hover:bg-sky-400/25 hover:bg-[#dceeff]"
                            aria-label="Search history"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                class="h-3.5 w-3.5 lg:h-4 lg:w-4"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <circle cx="11" cy="11" r="7"></circle>
                                <path d="m20 20-3.5-3.5"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- Columns toggle -->
                    <div
                        class="relative hidden w-full sm:w-auto lg:block lg:w-[13rem]"
                    >
                        <button
                            type="button"
                            class="flex w-full items-center justify-between border transition-all duration-300 hover:border-sky-400/50
                                   rounded-[12px] px-3 py-2 text-xs tracking-[0.14em]
                                   sm:rounded-[14px] sm:px-4 sm:py-2.5 sm:text-xs
                                   lg:rounded-[16px] lg:px-5 lg:py-3 lg:text-sm lg:tracking-[0.16em]
                                   uppercase
                                   {$dark
                                ? 'border-white/15 bg-[#0f2236] dark:text-slate-100 text-[var(--primary-text)] hover:bg-[#12263d]'
                                : 'border-[var(--border-color)] bg-[var(--panel-bg)] text-[var(--primary-text)] hover:bg-[#dceeff]'}"
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
                                class="absolute right-0 top-full z-50 mt-2 lg:mt-3 w-full min-w-[14rem] lg:min-w-[17rem] overflow-hidden shadow-[0_24px_45px_rgba(1,6,17,0.55)]
                                       rounded-[14px] border lg:rounded-[18px]
                                       {$dark
                                    ? 'border-white/20 bg-[#091423]'
                                    : 'border-[var(--border-color)] bg-[var(--panel-bg)]'}"
                                transition:fly={{ y: -8, duration: 180 }}
                            >
                                <div
                                    class="border-b px-3 py-2 lg:px-4 lg:py-3 text-xs uppercase tracking-[0.20em] lg:tracking-[0.24em]
                                           {$dark
                                        ? 'border-white/10 text-slate-400'
                                        : 'border-[var(--border-color)] text-[var(--secondary-text)]'}"
                                >
                                    Show columns
                                </div>
                                <div
                                    class="max-h-60 lg:max-h-72 overflow-y-auto p-1.5 lg:p-2"
                                >
                                    {#each columns as column (column.key)}
                                        <label
                                            class="flex items-center justify-between rounded-[10px] lg:rounded-[14px] px-3 py-2 text-xs lg:text-sm transition-colors duration-200
                                                   {$dark
                                                ? 'text-slate-100 hover:bg-white/5'
                                                : 'text-[var(--secondary-text)] hover:bg-[#dceeff]'}"
                                        >
                                            <span>{column.label}</span>
                                            <div class="flex items-center">
                                                <div
                                                    class="relative w-4 h-4 lg:w-5 lg:h-5"
                                                >
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
                                                        class="w-4 h-4 lg:w-5 lg:h-5 rounded-md border dark:border-white/30 border-sky-400 dark:bg-[#071427] transition-colors duration-150 peer-checked:border-sky-400 peer-checked:bg-sky-500/10"
                                                    ></div>
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-white/90 peer-checked:text-sky-400 opacity-0 peer-checked:opacity-100 transition-all duration-300 pointer-events-none"
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
            </div>

            <!-- Table panel -->
            <div
                data-sr
                data-sr-delay="140"
                role="presentation"
                class="relative z-10 border backdrop-blur-sm
                       rounded-[14px] p-1.5
                       sm:rounded-[16px] sm:p-2
                       lg:rounded-[20px] lg:p-2
                       shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_18px_50px_rgba(1,6,17,0.55)]
                       {$dark
                    ? 'border-white/35 bg-[#0a1a2d]/78'
                    : 'border-[var(--border-color)] bg-[var(--panel-bg)]'}"
                on:click|stopPropagation
            >
                <div
                    data-sr
                    data-sr-delay="180"
                    class="overflow-hidden border
                           rounded-[12px] lg:rounded-[18px]
                           {$dark
                        ? 'border-white/20 bg-[#102133]/75'
                        : 'border-[var(--border-color)] bg-[#f4f8fd]'}"
                >
                    <div class="lg:hidden px-1 py-1 sm:px-1.5 sm:py-1.5">
                        <div
                            class="flex max-h-[460px] flex-col gap-3 overflow-y-auto"
                        >
                            {#if visibleColumns.length === 0}
                                <div
                                    class="flex min-h-[160px] items-center justify-center rounded-[14px] border px-4 py-6 text-xs uppercase tracking-[0.16em] {$dark
                                        ? 'border-white/10 bg-[#0d1b2b]/65 text-slate-400'
                                        : 'border-[var(--border-color)] bg-[#edf5fd] text-[var(--primary-text)]'}"
                                >
                                    No columns selected.
                                </div>
                            {:else if sortedRows.length === 0}
                                <div
                                    class="flex min-h-[160px] items-center justify-center rounded-[14px] border px-4 py-6 text-xs uppercase tracking-[0.16em] {$dark
                                        ? 'border-white/10 bg-[#0d1b2b]/65 text-slate-400'
                                        : 'border-[var(--border-color)] bg-[#edf5fd] text-[var(--primary-text)]'}"
                                    transition:fade={{ duration: 180 }}
                                >
                                    No rows have been found.
                                </div>
                            {:else}
                                {#each displayedRows as row, rowIndex (row.id)}
                                    <article
                                        data-sr
                                        class={`rounded-[16px] border p-3 transition-all duration-200 ${$dark ? "border-white/10 bg-[#0d1b2b]/65 text-slate-100" : "border-[var(--border-color)] bg-[#f7fbff] text-[var(--primary-text)]"} ${rowIndex % 2 === 0 ? "" : $dark ? "bg-[#0b1726]/75" : "bg-[#edf5fd]"}`}
                                    >
                                        <div
                                            class="flex items-center justify-between border-b pb-2 {$dark
                                                ? 'border-white/10'
                                                : 'border-[var(--border-color)]'}"
                                        >
                                            <span
                                                class="text-[0.62rem] uppercase tracking-[0.14em] text-slate-500"
                                            >
                                                Row {rowIndex + 1}
                                            </span>
                                            <span
                                                class="text-[0.62rem] uppercase tracking-[0.14em] text-sky-300"
                                            >
                                                {visibleColumns.length} fields
                                            </span>
                                        </div>

                                        <div class="mt-3 grid gap-2">
                                            {#each visibleColumns as column (column.key)}
                                                <div
                                                    class={`rounded-[12px] border px-3 py-2 ${$dark ? "border-white/10 bg-[#091423]" : "border-[var(--border-color)] bg-white/60"}`}
                                                >
                                                    <div
                                                        class="text-[0.62rem] uppercase tracking-[0.14em] text-slate-500"
                                                    >
                                                        {column.label}
                                                    </div>
                                                    <div
                                                        class={`mt-1 flex items-center ${row.cellsByKey?.[column.key]?.wrapperClass ?? "justify-start"}`}
                                                    >
                                                        <span
                                                            class={row
                                                                .cellsByKey?.[
                                                                column.key
                                                            ]?.valueClass ??
                                                                "text-[var(--primary-text)]"}
                                                        >
                                                            {row.cellsByKey?.[
                                                                column.key
                                                            ]?.value}
                                                        </span>
                                                    </div>
                                                </div>
                                            {/each}
                                        </div>
                                    </article>
                                {/each}

                                {#if hasMoreRows}
                                    <button
                                        type="button"
                                        class={`rounded-[14px] border px-4 py-3 text-xs uppercase tracking-[0.18em] transition-all duration-200 ${$dark ? "border-white/10 bg-[#0d1b2b]/65 text-sky-200 hover:text-white" : "border-[var(--border-color)] bg-[#f7fbff] text-[var(--active-border)] hover:text-[var(--primary-text)]"}`}
                                        on:click|stopPropagation={showMoreRows}
                                    >
                                        Show more
                                    </button>
                                {/if}
                            {/if}
                        </div>
                    </div>

                    <div class="hidden lg:block">
                        <div
                            data-sr
                            data-sr-delay="220"
                            class="px-1 py-1 sm:px-1.5 sm:py-1.5 lg:px-2 lg:py-2"
                            style="min-width: 600px;"
                        >
                            <!-- Table header -->
                            <div
                                data-sr
                                data-sr-delay="260"
                                class="grid gap-0 rounded-t-[10px] lg:rounded-t-[14px] border-b uppercase
                                       text-[0.68rem] tracking-[0.14em]
                                       sm:text-[0.75rem] sm:tracking-[0.16em]
                                       lg:text-[0.92rem] lg:tracking-[0.18em]
                                       {$dark
                                    ? 'border-white/15 bg-[#1b2530]/95 text-white'
                                    : 'border-[var(--border-color)] bg-[#e5f0fb] text-[var(--primary-text)]'}"
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
                                                class={`group hidden w-full items-center gap-1.5 lg:flex lg:gap-2
                                                        px-2 py-2 lg:px-4 lg:py-3
                                                        text-left transition-all duration-300
                                                        ${column.align === "left" ? "justify-start" : "justify-center"}
                                                        ${$dark ? (activeFilterKey === column.key ? "bg-[#243145] text-sky-200" : "hover:bg-[#243145]/90 hover:text-sky-100") : activeFilterKey === column.key ? "bg-[var(--active-bg)] text-[var(--primary-text)]" : "hover:bg-[var(--active-bg)] hover:text-[var(--primary-text)]"}`}
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
                                                        class="h-0 w-0 border-l-[4px] border-r-[4px] border-b-[5px] lg:border-l-[5px] lg:border-r-[5px] lg:border-b-[6px] border-l-transparent border-r-transparent border-b-current"
                                                    ></div>
                                                </div>
                                            </button>

                                            {#if activeFilterKey === column.key}
                                                <div
                                                    class="absolute left-0 top-full z-20 hidden w-full pt-1.5 lg:block lg:pt-2"
                                                    transition:fly={{
                                                        y: -8,
                                                        duration: 180,
                                                    }}
                                                >
                                                    <div
                                                        class="overflow-hidden border shadow-[0_20px_40px_rgba(1,6,17,0.45)] rounded-[10px] lg:rounded-[14px] {$dark
                                                            ? 'border-white bg-[#091423]'
                                                            : 'border-[var(--border-color)] bg-[#f7fbff] shadow-[0_20px_40px_rgba(59,130,246,0.12)]'}"
                                                        transition:fade={{
                                                            duration: 160,
                                                        }}
                                                    >
                                                        {#each column.filterOptions ?? [] as option, optionIndex (option)}
                                                            <button
                                                                type="button"
                                                                class={`group w-full px-3 py-1.5 lg:px-4 lg:py-2 text-left text-xs lg:text-sm uppercase tracking-[0.12em] lg:tracking-[0.14em] transition-colors duration-200 ${$dark ? "bg-[#091423] text-white hover:bg-[var(--accent)]/15" : "bg-[#f7fbff] text-[var(--primary-text)] hover:bg-[#dceeff]"} ${optionIndex !== (column.filterOptions ?? []).length - 1 ? ($dark ? "border-b border-white/10" : "border-b border-[var(--border-color)]") : ""}`}
                                                                on:click|stopPropagation={() =>
                                                                    selectFilterOption(
                                                                        column.key,
                                                                        option,
                                                                    )}
                                                            >
                                                                <span
                                                                    class={`relative inline-block transition-all duration-300 after:absolute after:-bottom-1 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:bg-[var(--accent)] after:transition-all after:duration-300 group-hover:after:w-full ${isActiveFilterOption(column.key, option) ? "after:w-full text-[var(--accent)]" : $dark ? "text-white" : "text-[var(--primary-text)]"}`}
                                                                    >{option}</span
                                                                >
                                                            </button>
                                                        {/each}
                                                    </div>
                                                </div>
                                            {/if}
                                        {:else}
                                            <div
                                                class={`flex items-center px-2 py-2 lg:px-4 lg:py-3 ${column.align === "left" ? "justify-start" : "justify-center"}`}
                                            >
                                                <span>{column.label}</span>
                                            </div>
                                        {/if}
                                    </div>
                                {/each}
                            </div>

                            <!-- Table rows -->
                            <div
                                class="flex max-h-[380px] sm:max-h-[450px] lg:max-h-[525px] flex-col overflow-y-auto"
                            >
                                {#if visibleColumns.length === 0}
                                    <div
                                        class="flex min-h-[160px] sm:min-h-[200px] lg:min-h-[240px] items-center justify-center rounded-b-[10px] lg:rounded-b-[14px] dark:bg-[#0d1b2b]/65 bg-[#edf5fd] px-4 py-6 lg:px-6 lg:py-10 text-xs lg:text-sm uppercase tracking-[0.16em] lg:tracking-[0.18em] dark:text-slate-400 text-[var(--primary-text)]"
                                    >
                                        No columns selected.
                                    </div>
                                {:else if sortedRows.length === 0}
                                    <div
                                        class="flex min-h-[160px] sm:min-h-[200px] lg:min-h-[240px] items-center justify-center rounded-b-[10px] lg:rounded-b-[14px] px-4 py-6 lg:px-6 lg:py-10 text-xs lg:text-sm uppercase tracking-[0.16em] lg:tracking-[0.18em] {$dark
                                            ? 'bg-[#0d1b2b]/65 text-slate-400'
                                            : 'bg-[#edf5fd] text-[var(--primary-text)]'}"
                                        transition:fade={{ duration: 180 }}
                                    >
                                        No rows have been found.
                                    </div>
                                {:else}
                                    {#each displayedRows as row, rowIndex (row.id)}
                                        <div
                                            data-sr
                                            class={`grid border-b ${rowTextSize} transition-all duration-200 last:border-b-0 ${$dark ? "border-white/8 dark:text-slate-100 text-[var(--primary-text)] hover:bg-white/5" : "border-[var(--border-color)] text-[var(--primary-text)] hover:bg-[#dceeff]"} ${rowIndex % 2 === 0 ? ($dark ? "bg-[#0d1b2b]/65" : "bg-[#f7fbff]") : $dark ? "bg-[#0b1726]/75" : "bg-[#edf5fd]"}`}
                                            style={`grid-template-columns: ${tableGridTemplateColumns || model.gridTemplateColumns};`}
                                        >
                                            {#each visibleColumns as column (column.key)}
                                                <div
                                                    class={`flex items-center px-2 py-2 lg:px-4 lg:py-3 ${row.cellsByKey?.[column.key]?.wrapperClass ?? "justify-center"}`}
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
                                            class={`grid w-full border-b text-base lg:text-xl transition-all duration-200 last:border-b-0 ${$dark ? "border-white/8 dark:text-slate-100 text-[var(--primary-text)] transition duration-300 ease-out hover:bg-white/5" : "border-[var(--border-color)] text-[var(--primary-text)] hover:bg-[#dceeff]"} ${displayedRows.length % 2 === 0 ? ($dark ? "bg-[#0d1b2b]/65" : "bg-[#f7fbff]") : $dark ? "bg-[#0b1726]/75" : "bg-[#edf5fd]"}`}
                                            style={`grid-template-columns: ${tableGridTemplateColumns || model.gridTemplateColumns};`}
                                            on:click|stopPropagation={showMoreRows}
                                        >
                                            <span
                                                class={`col-span-full flex items-center justify-center px-3 py-3 lg:px-4 lg:py-4 text-xs lg:text-sm uppercase tracking-[0.18em] lg:tracking-[0.22em] transition-colors duration-200 ${$dark ? "text-sky-200 hover:text-white" : "text-[var(--active-border)] hover:text-[var(--primary-text)]"}`}
                                            >
                                                Show more
                                            </span>
                                        </button>
                                    {/if}
                                {/if}
                            </div>
                        </div>
                    </div>

                    <!-- Table footer -->
                    <div
                        class="border-t px-3 py-2 lg:px-4 lg:py-3 backdrop-blur-sm
                               {$dark
                            ? 'border-white/10 bg-[#091423]/95'
                            : 'border-[var(--border-color)] bg-[#e5f0fb]'}"
                    >
                        <div
                            class="flex flex-wrap items-center justify-between gap-2 lg:gap-3 text-xs lg:text-sm
                                   {$dark
                                ? 'text-slate-300'
                                : 'text-[var(--primary-text)]'}"
                        >
                            <div
                                class="flex flex-wrap items-center gap-2 lg:gap-3 uppercase tracking-[0.14em] lg:tracking-[0.18em]"
                            >
                                <span
                                    class="rounded-full border px-2 py-0.5 lg:px-3 lg:py-1 text-[0.65rem] lg:text-[0.72rem]
                                           {$dark
                                        ? 'border-sky-400/25 bg-sky-500/10 text-sky-200'
                                        : 'border-[var(--border-color)] bg-[#f7fbff] text-[var(--active-border)]'}"
                                >
                                    Showing {displayedRows.length} of {sortedRows.length}
                                </span>
                                <span
                                    class="text-[0.65rem] lg:text-[0.72rem] text-slate-500"
                                >
                                    {Math.max(
                                        sortedRows.length -
                                            displayedRows.length,
                                        0,
                                    )} remaining
                                </span>
                            </div>

                            <div
                                class="text-[0.65rem] lg:text-[0.72rem] uppercase tracking-[0.16em] lg:tracking-[0.2em] text-slate-500"
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

            <!-- Footer legend -->
            {#if model?.footer}
                <div
                    class="flex flex-wrap items-center gap-3 lg:gap-4 px-2
                           text-xs lg:text-sm
                           dark:text-slate-200 text-[var(--secondary-text)] transition-all duration-300 ease-out"
                >
                    <span
                        class="font-semibold dark:text-white text-black transition-all duration-300 ease-out"
                    >
                        {model.footer.label}
                    </span>

                    <div class="flex flex-wrap items-center gap-2 lg:gap-4">
                        {#each model.footer.items as item, footerIndex (item.value ?? footerIndex)}
                            <div
                                class="flex text-center sm:text-left items-center gap-2 lg:gap-2"
                            >
                                <span
                                    class={`transition-all duration-300 ease-out rounded-full border px-3 py-1 lg:px-4 lg:py-1.5 text-[0.65rem] lg:text-xs font-semibold uppercase tracking-[0.14em] lg:tracking-[0.18em]
                                            ${
                                                item.tone === "success"
                                                    ? "border-green-400/70 bg-green-500/15 dark:text-green-300 text-green-600"
                                                    : "border-red-400/70 bg-red-500/15 dark:text-red-300 text-red-600"
                                            }`}
                                >
                                    {item.value}
                                </span>
                                <span
                                    class="text-[0.78rem] lg:text-[0.85rem] dark:text-slate-400 text-[var(--primary-text)]"
                                >
                                    {item.description}
                                </span>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </div>
</Layout>
