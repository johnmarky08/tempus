<script>
    import { inertia } from "@inertiajs/svelte";
    import { nav } from "../../js/nav.js";
    import { dark } from "../../js/theme.js";
</script>

<!-- Main Footer -->
<footer
    class="border-t-2
        {$dark
            ? 'bg-gradient-to-r from-[#091532]/90 to-[#050a15]/90 border-t-white/10 text-white'
            : 'bg-gradient-to-r from-[color-mix(in_srgb,var(--accent)_20%,transparent)] to-[color-mix(in_srgb,var(--bg)_90%,transparent)] text-[var(--primary-text)]'}
        border-t-black/10 backdrop-blur-md text-sm bottom-0 left-0 z-[9997]
        transition-all duration-300 ease-out
        flex flex-col items-center gap-8
        p-6
        sm:p-8 sm:flex-col sm:items-center sm:gap-10
        md:p-10 md:flex-row md:items-start md:justify-between md:gap-0
        lg:flex-row lg:justify-between lg:p-14"
>
    <!-- Brand / Description Block -->
    <div
        class="space-y-2 w-full flex flex-col items-center text-center
               sm:space-y-2 sm:items-center sm:text-center
               md:space-y-3 md:items-start md:text-left md:ml-10 md:w-auto
               lg:space-y-3 lg:items-start lg:text-left lg:ml-40"
    >
        <!-- Logo + Name -->
        <div class="flex gap-2 items-center
                    sm:gap-3
                    md:gap-3
                    lg:gap-3">
            <img
                src="/favicon.png"
                alt="T.E.M.P.U.S. Logo"
                class="h-10 w-10
                       sm:h-14 sm:w-14
                       md:h-16 md:w-16
                       lg:h-20 lg:w-20"
            />
            <h1
                class="font-bold dark:text-white text-black transition-all duration-300 ease-out
                       text-xl
                       md:text-xl
                       lg:text-2xl"
            >
                T.E.M.P.U.S.
            </h1>
        </div>

        <!-- Description -->
        <p
            class="dark:text-gray-300 text-gray-700 text-justify transition-all duration-300 ease-out
                   max-w-[280px] text-xs leading-relaxed
                   sm:max-w-xs sm:text-xs
                   md:max-w-xs md:text-xs
                   lg:max-w-sm lg:text-sm"
        >
            <b class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out">T</b>hermal and
            <b class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out">E</b>nergy
            <b class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out">M</b>etrics:
            <b class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out">P</b>redictive
            <b class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out">U</b>tility and
            <b class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out">S</b>afety
            (T.E.M.P.U.S.) is a project that provides real-time fuel price
            tracking and heat index information. Our mission is to help users
            make informed decisions about their fuel consumption and stay safe
            in extreme weather conditions.
        </p>
    </div>

    <!-- Quick Links Block -->
    <div
        class="flex flex-col gap-2 items-center w-full
               sm:gap-3
               md:gap-3 md:mr-10 md:w-auto md:items-center
               lg:gap-3 lg:mr-40"
    >
        <h1
            class="font-bold text-center
                   text-base
                   sm:text-base
                   md:text-base
                   lg:text-lg"
        >
            Quick Links
        </h1>
        <ul
            class="flex gap-2 text-gray-700 dark:text-gray-300 flex-wrap justify-center
                   max-w-[200px]
                   sm:gap-3 sm:max-w-[125px]
                   md:gap-3 md:max-w-[125px]
                   lg:gap-3 lg:max-w-[125px]"
        >
            {#each nav as { name, link, subMenu }}
                {#if subMenu}
                    {#each subMenu as { name: subName, link: subLink }}
                        <li class="w-full">
                            <a
                                use:inertia
                                href={subLink}
                                class="relative dark:hover:text-[#6FB8E7] hover:text-[var(--accent)] transition-all duration-300 ease-out
                                       text-xs sm:text-sm lg:text-sm"
                            >
                                <span
                                    class="after:content-['']
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
                            class="relative hover:text-[#6FB8E7] transition-all duration-300 ease-out
                                   text-xs sm:text-sm lg:text-sm"
                        >
                            <span
                                class="after:content-['']
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

<!-- Copyright Bar -->
<footer
    class="{$dark
        ? 'bg-gradient-to-r from-[#091532]/90 to-[#050a15]/90 border-t-white/10 text-white'
        : 'bg-gradient-to-r from-[color-mix(in_srgb,var(--accent)_20%,transparent)] to-[color-mix(in_srgb,var(--bg)_90%,transparent)] text-[var(--primary-text)]'}
    backdrop-blur-md bottom-0 left-0 z-[9997] items-center transition-all duration-300 ease-out
    p-6
    sm:p-8
    md:p-10
    lg:p-14"
>
    <div
        class="border-t-2 dark:border-white/30 border-black/30 transition-all duration-300 ease-out"
    ></div>
    <div
        class="flex justify-center items-center
               mt-3
               sm:mt-4
               md:mt-4
               lg:mt-5"
    >
        <p
            class="text-[10px]
                   sm:text-xs
                   md:text-xs
                   lg:text-xs"
        >
            &copy; {new Date().getFullYear()}
            <span
                class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out"
            >T.E.M.P.U.S.</span>
            All rights reserved.
        </p>
    </div>
</footer>