<script>
    import { inertia } from "@inertiajs/svelte";
    import { nav } from "../../js/nav.js";
</script>

<footer
    class="border-t-2 border-white/10 bg-[#020617]/40 backdrop-blur-md text-sm p-14 bottom-0 left-0 z-[9997] text-white flex justify-between"
>
    <div class="space-y-3 ml-40">
        <div class="flex gap-3 items-center">
            <img
                src="/favicon.png"
                alt="T.E.M.P.U.S. Logo"
                class="text-white h-20 w-20"
            />
            <h1 class="text-2xl font-bold text-white">T.E.M.P.U.S.</h1>
        </div>
        <p class="max-w-sm text-gray-300 text-justify">
            <b class="text-[#6FB8E7]">T</b>hermal and
            <b class="text-[#6FB8E7]">E</b>nergy
            <b class="text-[#6FB8E7]">M</b>etrics:
            <b class="text-[#6FB8E7]">P</b>redictive
            <b class="text-[#6FB8E7]">U</b>tility and
            <b class="text-[#6FB8E7]">S</b>afety (T.E.M.P.U.S.) is a project
            that provides real-time fuel price tracking and heat index
            information. Our mission is to help users make informed decisions
            about their fuel consumption and stay safe in extreme weather
            conditions.
        </p>
    </div>
    <div class="flex flex-col gap-3 mr-40">
        <h1 class="font-bold text-lg text-center">Quick Links</h1>
        <ul
            class="flex gap-3 text-gray-300 max-w-[125px] flex-wrap justify-center"
        >
            {#each nav as { name, link, subMenu }}
                {#if subMenu}
                    {#each subMenu as { name: subName, link: subLink }}
                        <li class="w-full">
                            <a
                                use:inertia
                                href={subLink}
                                class="relative hover:text-[#6FB8E7] transition-all duration-300"
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
                            class="relative hover:text-[#6FB8E7] transition-all duration-300"
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
    class="text-xs bg-[#020617]/40 backdrop-blur-md p-14 bottom-0 left-0 z-[9997] text-white items-center"
>
    <div class="border-t-2 border-white/30"></div>
    <div class="flex justify-center items-center mt-5">
        <p>
            &copy; {new Date().getFullYear()}
            <span class="text-[#6FB8E7]">T.E.M.P.U.S.</span> All rights reserved.
        </p>
    </div>
</footer>
