<script>
    import { nav } from "../../js/nav.js";
</script>

<footer
    class="border-t-2 border-white/10 bg-[#020617]/40 backdrop-blur-md text-sm p-14 bottom-0 left-0 z-[9997] text-white flex justify-between"
>
    <div class="space-y-3">
        <div class="flex gap-3 items-center">
            <img
                src="/favicon.png"
                alt="Tempus Logo"
                class="text-white h-20 w-20"
            />
            <h1 class="text-2xl font-bold text-white">Tempus</h1>
        </div>
        <p class="max-w-sm text-gray-300">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit.
            Necessitatibus in nesciunt adipisci ducimus aperiam ut magnam
            dignissimos, rem quisquam repudiandae voluptatem sint quaerat amet
            labore soluta tempora delectus corrupti perferendis.
        </p>
    </div>
    <div class="flex flex-col gap-3">
        <h1 class="font-bold text-lg text-center">Quick Links</h1>
        <ul
            class="flex gap-3 text-gray-300 max-w-[150px] flex-wrap justify-between"
        >
            {#each nav as { name, link }}
                <li class="">
                    <a
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
                       hover:after:w-full">{name}</span
                        >
                    </a>
                </li>
            {/each}
        </ul>
    </div>
</footer>
<footer
    class="text-xs bg-[#020617]/40 backdrop-blur-md p-14 bottom-0 left-0 z-[9997] text-white items-center"
>
    <div class="border-t-2 border-white/30"></div>
    <div class="flex justify-between items-center mt-5">
        <div class="flex justify-between items-center gap-3">
            <a
                href="/terms"
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
                       hover:after:w-full">Terms & Conditions</span
                >
            </a>
            <p>·</p>
            <a
                href="/privacy"
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
                       hover:after:w-full">Privacy Policy</span
                >
            </a>
        </div>
        <p>&copy; {new Date().getFullYear()} Tempus. All rights reserved.</p>
    </div>
</footer>
