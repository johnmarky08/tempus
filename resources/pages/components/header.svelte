<script>
    import { dark } from "../../js/theme.js";
    import { nav } from "../../js/nav.js";
    import { inertia } from "@inertiajs/svelte";
    import { fly, fade } from "svelte/transition";

    export let isActive = "";
    export let isActiveSub = "";

    let isActiveDropdown = null;
    let mobileMenuOpen = false;
    let mobileHistoryOpen = isActive === "History" || Boolean(isActiveSub);

    function closeMobileMenu() {
        mobileMenuOpen = false;
    }

    function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
    }

    function toggleMobileHistory() {
        mobileHistoryOpen = !mobileHistoryOpen;
    }

    function handleMobileNavigate() {
        closeMobileMenu();
    }
</script>

<nav
    class="h-20 flex justify-between items-center pl-4 pr-5 sm:px-6 lg:px-20 border-b-2
    fixed w-full top-0 z-[9999] backdrop-blur-sm transition-colors duration-300
    {$dark
        ? 'bg-gradient-to-r from-[#091532]/90 to-[#050a15]/90 border-b-white/10 text-white'
        : 'bg-gradient-to-r border-b-black/10 from-[color-mix(in_srgb,var(--accent)_20%,transparent)] to-[color-mix(in_srgb,var(--bg)_90%,transparent)] text-[var(--primary-text)]'}"
>
    <div class="flex items-center gap-2 sm:gap-3">
        <img
            src="/favicon.png"
            alt="T.E.M.P.U.S. Logo"
            class="h-14 w-14 sm:h-20 sm:w-20 p-1 sm:p-2"
        />
        <h1
            class="text-lg sm:text-2xl font-bold {$dark
                ? 'text-white'
                : 'text-[var(--primary-text)]'}"
        >
            T.E.M.P.U.S.
        </h1>
    </div>

    <div
        class="cursor-pointer hidden lg:flex text-sm gap-14 items-center text-center {$dark
            ? 'text-white'
            : 'text-[var(--secondary-text)]'}"
    >
        {#each nav as { name, link, subMenu }}
            <div
                role="navigation"
                class="relative"
                on:mouseenter={() => {
                    if (subMenu) isActiveDropdown = name;
                }}
                on:mouseleave={() => {
                    if (subMenu) isActiveDropdown = null;
                }}
            >
                <div class="flex items-center">
                    <a
                        use:inertia
                        href={link}
                        class="relative transition-all duration-300 ease-out
                        {isActive === name
                            ? 'dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out '
                            : 'dark:text-white dark:hover:text-[#6FB8E7] hover:text-[var(--accent)] text-black transition-all duration-300  ease-out '}
                        {subMenu ? 'pointer-events-none' : ''}"
                    >
                        <span
                            class="
                            transition-all duration-300 ease-out
                            relative
                            after:content-['']
                            after:absolute
                            after:left-1/2
                            after:-translate-x-1/2
                            after:-bottom-1
                            after:h-[2px]
                            after:w-0
                            dark:after:bg-[#6FB8E7]
                            after:bg-[var(--accent)]
                            after:transition-all
                            after:duration-300
                            hover:after:w-full
                            {isActive === name || isActiveDropdown === name
                                ? 'after:w-full'
                                : ''}"
                        >
                            {name}
                        </span>
                    </a>

                    {#if subMenu}
                        <div
                            class="ri-arrow-up-s-fill text-lg ml-2 transition-all duration-300 ease-out
                                {isActiveDropdown === name
                                ? 'rotate-0'
                                : 'rotate-180'} {isActive === name ||
                            isActiveDropdown === name
                                ? 'text-[#6FB8E7]'
                                : 'dark:text-white/80 text-black/80'}"
                            aria-hidden="true"
                        ></div>
                    {/if}
                </div>

                {#if subMenu && isActiveDropdown === name}
                    <div transition:fly={{ y: -10, duration: 300 }}>
                        <div transition:fade={{ duration: 300 }}>
                            <div
                                class="absolute top-full left-1/2 -translate-x-1/2 pt-7"
                            >
                                <div
                                    class="{$dark
                                        ? 'bg-gradient-to-r from-[#071427] to-[#04080b] ring-white/60'
                                        : 'bg-gradient-to-r from-[color-mix(in_srgb,var(--accent)_20%,white)] to-[color-mix(in_srgb,var(--bg)_90%,white)] ring-[var(--accent)]'} py-3 px-2 rounded-xl ring-1 shadow-lg w-56"
                                >
                                    {#each subMenu as { name: subName, link }}
                                        <div class="px-2">
                                            <a
                                                href={link}
                                                use:inertia
                                                class={`group block rounded-lg px-4 py-2 transition-colors duration-200`}
                                            >
                                                <span
                                                    class={`dark:hover:text-[#6FB8E7] hover:text-[var(--accent)] relative inline-block text-sm tracking-wide after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:h-[2px] after:transition-all after:duration-300 ${
                                                        isActiveSub === subName
                                                            ? $dark
                                                                ? "after:w-full after:bg-[#6FB8E7] text-[#6FB8E7]"
                                                                : "after:w-full after:bg-[var(--active-border)] text-[var(--accent)]"
                                                            : $dark
                                                              ? "after:w-0 after:bg-[#6FB8E7] group-hover:after:w-full text-white"
                                                              : "after:w-0 after:bg-[var(--active-border)] group-hover:after:w-full text-[var(--primary-text)]"
                                                    }`}
                                                >
                                                    {subName}
                                                </span>
                                            </a>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        {/each}
    </div>

    <div class="flex items-center gap-2 sm:gap-3 max-lg:mr-8 max-md:mr-3">
        <button
            type="button"
            class="hidden lg:inline-flex items-center justify-center w-11 h-11 rounded-full border transition-all duration-300
                {$dark
                ? 'border-white/15 bg-white/5 text-white/90 hover:bg-white/10 hover:border-white/25'
                : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--primary-text)] hover:bg-[var(--hover)] hover:border-[var(--border-color)]'}"
            on:click={() => ($dark = !$dark)}
            aria-label="Toggle theme"
        >
            <div
                class="{$dark
                    ? 'ri-sun-fill rotate-180 text-white'
                    : 'ri-moon-fill text-[var(--primary-text)]'} text-2xl transition-all duration-300 ease-out"
            ></div>
        </button>

        <button
            type="button"
            class="lg:hidden inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 max-[359px]:w-8 max-[359px]:h-8 rounded-full border transition-all duration-300 ease-out {$dark
                ? 'border-white/15 bg-white/5 text-white/90 hover:bg-white/10 hover:border-white/25'
                : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--primary-text)] hover:bg-[var(--hover)] hover:border-[var(--border-color)]'}"
            on:click={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
        >
            <div
                class="text-xl sm:text-2xl max-[359px]:text-lg {mobileMenuOpen
                    ? 'ri-close-line'
                    : 'ri-menu-line'}"
            ></div>
        </button>
    </div>

    {#if mobileMenuOpen}
        <div
            class="lg:hidden absolute right-4 sm:right-5 top-full mt-2 sm:mt-3 w-[min(18rem,calc(100vw-1.5rem))] max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.45)] {$dark
                ? 'border-white/15 bg-[#050a15]/95'
                : 'border-[var(--border-color)] bg-[var(--panel-bg)]'}"
            transition:fly={{ y: -8, x: 8, duration: 220 }}
        >
            <div
                class="px-4 py-4 border-b flex items-center justify-between gap-3 {$dark
                    ? 'border-white/10'
                    : 'border-[var(--border-color)]'}"
            >
                <span
                    class="text-xs uppercase tracking-[0.22em] {$dark
                        ? 'text-white/55'
                        : 'text-[var(--muted-text)]'}">Menu</span
                >
                <button
                    type="button"
                    class="inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors duration-200
                        {$dark
                        ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                        : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--primary-text)] hover:bg-[var(--hover)]'}"
                    on:click={() => ($dark = !$dark)}
                    aria-label="Toggle theme"
                >
                    <div
                        class="{$dark
                            ? 'ri-sun-fill rotate-180 text-white'
                            : 'ri-moon-fill text-slate-700'} text-xl transition-all duration-300 ease-out"
                    ></div>
                </button>
            </div>

            <div
                class="p-2 {$dark
                    ? 'text-white'
                    : 'text-[var(--primary-text)]'}"
            >
                {#each nav as { name, link, subMenu }}
                    {#if subMenu}
                        <div class="rounded-xl overflow-hidden">
                            <button
                                type="button"
                                class={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-base font-medium transition-colors duration-200 ${$dark ? "hover:bg-white/6" : "hover:bg-[var(--hover)]"} ${isActive === name ? ($dark ? "text-[var(--accent)]" : "text-[var(--primary-text)]") : $dark ? "text-white" : "text-[var(--primary-text)]"}`}
                                on:click={toggleMobileHistory}
                                aria-expanded={mobileHistoryOpen}
                            >
                                <span>{name}</span>
                                <div
                                    class="ri-arrow-up-s-fill text-lg transition-transform duration-300 {mobileHistoryOpen
                                        ? 'rotate-0 text-[var(--accent)]'
                                        : 'rotate-180 text-white/70'}"
                                    aria-hidden="true"
                                ></div>
                            </button>

                            {#if mobileHistoryOpen}
                                <div
                                    class={`ml-3 mt-1 mb-2 border-l pl-3 space-y-1 ${$dark ? "border-white/10" : "border-[var(--border-color)]"}`}
                                    transition:fade={{ duration: 180 }}
                                >
                                    {#each subMenu as { name: subName, link: subLink }}
                                        <a
                                            use:inertia
                                            href={subLink}
                                            class={`block rounded-lg px-4 py-2 text-sm transition-colors duration-200 ${$dark ? "hover:bg-white/6" : "hover:bg-[var(--hover)]"} ${isActiveSub === subName ? ($dark ? "text-[var(--accent)]" : "text-[var(--primary-text)]") : $dark ? "text-white/85" : "text-[var(--secondary-text)]"}`}
                                            on:click={handleMobileNavigate}
                                        >
                                            {subName}
                                        </a>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {:else}
                        <a
                            use:inertia
                            href={link}
                            class={`block rounded-xl px-4 py-3 text-base font-medium transition-colors duration-200 ${$dark ? "hover:bg-white/6" : "hover:bg-[var(--hover)]"} ${isActive === name ? ($dark ? "text-[var(--accent)]" : "text-[var(--primary-text)]") : $dark ? "text-white" : "text-[var(--secondary-text)]"} ${name === "History" ? "pointer-events-none" : ""}`}
                            on:click={handleMobileNavigate}
                        >
                            {name}
                        </a>
                    {/if}
                {/each}
            </div>
        </div>
    {/if}
</nav>
