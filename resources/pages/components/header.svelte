<script>
    import { dark } from "../../js/theme.js";
    import { nav } from "../../js/nav.js";
    import { inertia } from "@inertiajs/svelte";
    import { fly, fade } from "svelte/transition";

    export let isActive = "";
    export let isActiveSub = "";

    let isActiveDropdown = null;
</script>

<nav
    class="bg-gradient-to-r from-[#091532]/90 to-[#050a15]/90 h-20
    flex justify-between items-center px-20 border-b-2 border-[#888888]
    sticky top-0 z-50 backdrop-blur-sm"
>
    <div class="flex items-center">
        <img src="/favicon.png" alt="T.E.M.P.U.S. Logo" class="h-20 w-20 p-2" />
        <h1 class="text-2xl font-bold text-white">T.E.M.P.U.S.</h1>
    </div>

    <div class="text-sm flex gap-14 items-center text-center text-white">
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
                        class="relative transition-all duration-300
                        {isActive === name ? 'text-[#6FB8E7]' : 'text-white'}
                        {name === 'History' ? 'pointer-events-none' : ''}"
                    >
                        <span
                            class="
                            relative
                            after:content-['']
                            after:absolute
                            after:left-1/2
                            after:-translate-x-1/2
                            after:-bottom-1
                            after:h-[2px]
                            after:w-0
                            after:bg-[#6FB8E7]
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
                            class="ri-arrow-up-s-fill text-lg ml-2 transition-transform duration-300
                                {isActiveDropdown === name
                                ? 'rotate-0'
                                : 'rotate-180'} {isActive === name ||
                            isActiveDropdown === name
                                ? 'text-[#6FB8E7]'
                                : 'text-white/80'}"
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
                                    class="bg-gradient-to-r from-[#071427] to-[#04080b] py-3 px-2 rounded-xl ring-1 ring-white/60 shadow-lg w-56"
                                >
                                    {#each subMenu as { name: subName, link }}
                                        <div class="px-2">
                                            <a
                                                href={link}
                                                use:inertia
                                                class="group block rounded-lg px-4 py-2 transition-colors duration-200 hover:bg-white/6"
                                            >
                                                <span
                                                    class={isActiveSub ===
                                                    subName
                                                        ? "relative inline-block text-sm tracking-wide after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:h-[2px] after:bg-[#6FB8E7] after:transition-all after:duration-300 after:w-full text-[#6FB8E7]"
                                                        : "relative inline-block text-sm tracking-wide after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#6FB8E7] after:transition-all after:duration-300 group-hover:after:w-full text-white"}
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

    <button on:click={() => ($dark = !$dark)}>
        <div
            class="{$dark ? 'ri-sun-fill rotate-180' : 'ri-moon-fill'}
            text-white text-2xl transition-all duration-300"
        ></div>
    </button>
</nav>
