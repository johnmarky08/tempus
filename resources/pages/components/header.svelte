<script>
    import { dark } from "../../js/theme.js";
    import { nav } from "../../js/nav.js";
    import { inertia } from "@inertiajs/svelte";

    export let isActive = "";
</script>

<nav
    class="bg-gradient-to-r from-[#091532]/90 to-[#050a15]/90 h-20
    flex justify-between items-center px-20 border-b-2 border-[#888888] sticky top-0 z-50 backdrop-blur-sm"
>
    <div class="flex items-center">
        <img src="/favicon.png" alt="T.E.M.P.U.S. Logo" class="h-20 w-20 p-2" />
        <h1 class="text-2xl font-bold text-white">T.E.M.P.U.S.</h1>
    </div>
    <div class="text-sm flex gap-14 items-center text-center text-white">
        {#each nav as { name, link }}
            <a
                use:inertia
                href={link}
                class="relative hover:text-[#6FB8E7] {isActive === name
                    ? 'text-[#6FB8E7]'
                    : ''} transition-all duration-300"
            >
                <span
                    class="
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
                       {isActive === name
                        ? 'after:text-[#6FB8E7] after:w-full'
                        : ''}">{name}</span
                >
            </a>
        {/each}
    </div>

    <button on:click={() => ($dark = !$dark)}>
        <div
            class="{$dark
                ? 'ri-sun-fill rotate-180'
                : 'ri-moon-fill '} text-white text-2xl transition-all duration-300"
        ></div>
    </button>
</nav>
