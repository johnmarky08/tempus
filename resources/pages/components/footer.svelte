<script>
    import { inertia } from "@inertiajs/svelte";
    import { nav } from "../../js/nav.js";
    import { dark } from "../../js/theme.js";
</script>

<footer
    class=" border-t-2 {$dark
        ? 'bg-gradient-to-r from-[#091532]/90 to-[#050a15]/90 border-t-white/10 text-white'
        : 'bg-gradient-to-r from-[color-mix(in_srgb,var(--accent)_20%,transparent)] to-[color-mix(in_srgb,var(--bg)_90%,transparent)] text-[var(--primary-text)]'}
      border-t-black/10 backdrop-blur-md text-sm p-14 bottom-0 left-0 z-[9997] \ flex justify-between transition-all duration-300 ease-out"
>
    <div class="space-y-3 ml-40">
        <div class="flex gap-3 items-center">
            <img
                src="/favicon.png"
                alt="T.E.M.P.U.S. Logo"
                class="text-white h-20 w-20"
            />
            <h1
                class="text-2xl font-bold dark:text-white text-black transition-all duration-300 ease-out"
            >
                T.E.M.P.U.S.
            </h1>
        </div>
        <p
            class="max-w-sm dark:text-gray-300 text-gray-700 text-justify transition-all duration-300 ease-out"
        >
            <b
                class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out"
                >T</b
            >hermal and
            <b
                class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out"
                >T</b
            >hermal and
            <b
                class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out"
                >E</b
            >nergy
            <b
                class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out"
                >M</b
            >etrics:
            <b
                class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out"
                >P</b
            >redictive
            <b
                class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out"
                >U</b
            >tility and
            <b
                class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out"
                >S</b
            >afety (T.E.M.P.U.S.) is a project that provides real-time fuel
            price tracking and heat index information. Our mission is to help
            users make informed decisions about their fuel consumption and stay
            safe in extreme weather conditions.
        </p>
    </div>
    <div class="flex flex-col gap-3 mr-40">
        <h1 class="font-bold text-lg text-center">Quick Links</h1>
        <ul
            class="flex gap-3 text-gray-700 dark:text-gray-300 max-w-[125px] flex-wrap justify-center"
        >
            {#each nav as { name, link, subMenu }}
                {#if subMenu}
                    {#each subMenu as { name: subName, link: subLink }}
                        <li class="w-full">
                            <a
                                use:inertia
                                href={subLink}
                                class="relative dark:hover:text-[#6FB8E7] hover:text-[var(--accent)] transition-all duration-300 ease-out"
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
                       dark:after:bg-[#6FB8E7]
                       after:bg-[var(--accent)]
                       after:transition-all
                       after:duration-300
                       hover:after:w-full"
                                >
                                    {subName}
                                </span>
                            </a>
                        </li>
                    {/each}
                {:else}
                    <li class="w-full">
                        <a
                            use:inertia
                            href={link}
                            class="relative hover:text-[#6FB8E7] transition-all duration-300 ease-out"
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
                       dark:after:bg-[#6FB8E7]
                       after:bg-[var(--accent)]
                       after:transition-all
                       after:duration-300
                       hover:after:w-full"
                            >
                                {name}
                            </span>
                        </a>
                    </li>
                {/if}
            {/each}
        </ul>
    </div>
</footer>
<footer
    class="text-xs {$dark
        ? 'bg-gradient-to-r from-[#091532]/90 to-[#050a15]/90 border-t-white/10 text-white'
        : 'bg-gradient-to-r from-[color-mix(in_srgb,var(--accent)_20%,transparent)] to-[color-mix(in_srgb,var(--bg)_90%,transparent)] text-[var(--primary-text)]'}
    backdrop-blur-md p-14 bottom-0 left-0 z-[9997] items-center transition-all duration-300 ease-out"
>
    <div
        class="border-t-2 dark:border-white/30 border-black/30 transition-all duration-300 ease-out"
    ></div>
    <div class="flex justify-center items-center mt-5">
        <p>
            &copy; {new Date().getFullYear()}
            <span
                class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out"
                >T.E.M.P.U.S.</span
            > All rights reserved.
        </p>
    </div>
</footer>
