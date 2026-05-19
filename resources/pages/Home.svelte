<script>
    import Layout from "./components/layout.svelte";
    import * as items from "../js/items.js";

    let now = new Date();

    let day;
    let date;

    function updateDate() {
        now = new Date();

        day = now.toLocaleDateString("en-US", { weekday: "long" });

        date = now.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
        });
    }

    updateDate();
</script>

<div>
    <Layout isActive="Home">
        <div class="space-y-10 scroll-smooth snap-y snap-mandatory">
            <div class="text-white space-y-16 snap-start">
                <div
                    data-sr
                    class="flex text-2xl gap-10 justify-center items-center font-spaceGrotesk font-semibold"
                >
                    <p>{day}</p>
                    <p>{date}</p>
                    <p>Laguna</p>
                </div>
                <div
                    class="flex justify-between gap-10 text-white lg:flex-row lg:items-start"
                >
                    <div
                        class="flex w-full max-w-2xl flex-col gap-8 pt-4 lg:pt-10"
                    >
                        <div
                            data-sr
                            class="flex font-jetbrainsMono items-center gap-3 self-start rounded-[15px] border border-sky-400/30 bg-sky-500/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-sky-200 backdrop-blur-sm"
                        >
                            <span>Live monitoring</span>
                            <span class="h-1 w-1 rounded-full bg-sky-300"
                            ></span>
                            <span>Updated now</span>
                        </div>

                        <div class="flex flex-col gap-6">
                            <h1
                                data-sr
                                data-sr-delay="100"
                                class="max-w-xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-5xl"
                            >
                                Monitor Fuel Price and
                                <span class="text-sky-300">Heat Index</span>
                                Proactively
                            </h1>

                            <p
                                data-sr
                                data-sr-delay="180"
                                class="max-w-[500px] text-sm leading-6 text-slate-300 sm:text-base font-jetbrainsMono font-light"
                            >
                                T.E.M.P.U.S. is your personal software
                                application that aggregates live market data of
                                fuel and local heat indices, alerting you to
                                crucial changes and health risks.
                            </p>

                            <div
                                class="flex flex-wrap items-center gap-4 font-jetbrainsMono font-bold"
                            >
                                <button
                                    data-sr
                                    data-sr-delay="260"
                                    class="hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,2)] inline-flex items-center gap-3 rounded-lg border border-sky-400/50 bg-slate-950/40 px-5 py-3 text-sm text-sky-100 transition duration-300 ease-in-out border-[#6FB8E7] hover:bg-slate-900/60"
                                >
                                    <span>See Full Insights</span>
                                    <i class="ri-folder-open-line"></i>
                                </button>

                                <button
                                    data-sr
                                    data-sr-delay="320"
                                    class="hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,2)] inline-flex items-center gap-3 rounded-lg bg-white px-5 py-3 text-sm text-black shadow-white/10 transition hover:bg-slate-100"
                                >
                                    <span>Learn More</span>
                                    <i class="ri-arrow-right-fill"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        class="relative flex w-full justify-center lg:justify-end px-16"
                    >
                        <div
                            class="relative flex w-full max-w-2xl items-end justify-end overflow-hidden rounded-3xl border border-white bg-slate-800/75 p-6 backdrop-blur-sm sm:p-8 lg:min-h-[28rem] lg:p-10 floating floating-border"
                        >
                            <div
                                class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(125,211,252,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.12),_transparent_30%)]"
                            ></div>
                            <div
                                class="relative flex h-full w-full items-end justify-end"
                            >
                                <img
                                    data-sr
                                    data-sr-delay="200"
                                    src="/images/items/rimuru_slime.png"
                                    alt="Rimuru Slime"
                                    class="h-60 w-60 rounded-full object-cover sm:h-72 sm:w-72 lg:h-80 lg:w-80"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="border-b-2 border-[#888888] w-full absolute bottom-0 left-0"
                ></div>
            </div>

            <!-- to do : add picture assets -->
            <div
                class="flex w-full flex-col gap-10 pb-6 text-white font-jetbrainsMono snap-start scale-[0.80]"
            >
                <div
                    class="flex flex-col gap-8 lg:flex-row lg:items-stretch font-bold"
                >
                    <div
                        class="flex w-full flex-col rounded-3xl border border-[#6FB8E7] bg-[#061E29]/50 p-6 shadow-[0_18px_50px_rgba(2,6,23,0.45)] backdrop-blur-sm sm:p-8 lg:w-1/2"
                    >
                        <div class="flex flex-col gap-5">
                            <h2
                                data-sr
                                class="text-3xl tracking-tight text-white"
                            >
                                Project Description
                            </h2>

                            <p
                                class="max-w-xl text-sm font-light leading-6 text-slate-300 sm:text-base"
                            >
                                T.E.M.P.U.S. is a smart daily companion that
                                helps users manage rising fuel prices alongside
                                dangerous heat conditions. It predicts price
                                spikes and monitors personal heat danger levels,
                                offering early warnings before risks become
                                costly or harmful. The platform provides clear,
                                practical recommendations such as when to
                                refuel, when to avoid outdoor activities, and
                                how to save money during high-risk days. Its
                                goal is to make daily life safer, more
                                affordable, and easier to manage through simple,
                                actionable insights.
                            </p>

                            <div class="flex items-center pt-1">
                                <button
                                    class="hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,2)] inline-flex items-center gap-3 rounded-lg border border-sky-400/40 bg-slate-950/40 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-900/70"
                                >
                                    <span>View Full Description</span>
                                    <i class="ri-fullscreen-fill"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="hidden w-px bg-white lg:block"></div>

                    <div
                        class="flex w-full flex-col rounded-3xl border border-[#6FB8E7] bg-[#061E29]/50 p-6 shadow-[0_18px_50px_rgba(2,6,23,0.45)] backdrop-blur-sm sm:p-8 lg:w-1/2"
                    >
                        <div class="flex flex-col gap-5">
                            <h2
                                data-sr
                                class="text-3xl font-semibold tracking-tight text-white"
                            >
                                Technology/Tools Used
                            </h2>

                            <div
                                class="flex flex-col gap-4 pt-2 max-h-72 overflow-x-hidden px-8 py-4 overflow-y-scroll scroll-smooth"
                            >
                                {#each items.techStacks as { img, name, description, alt, color, textColor }, i}
                                    <div
                                        data-sr
                                        class="group cursor-pointer hover:scale-105 {color} flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-4 transition duration-300 ease-in-out"
                                    >
                                        <div
                                            class="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/5 p-1 transition-all duration-300 group-hover:scale-125"
                                        >
                                            <img
                                                data-sr
                                                src={img}
                                                {alt}
                                                class="h-full w-full object-contain p-1"
                                            />
                                        </div>
                                        <div class="flex flex-col gap-1">
                                            <p
                                                data-sr
                                                class="{textColor} group-hover:scale-110 group-hover:translate-x-4 transition-all duration-300 text-base font-semibold text-white"
                                            >
                                                {name}
                                            </p>
                                            <p
                                                data-sr
                                                class="font-jetbrainsMono text-sm text-slate-300"
                                            >
                                                {description}
                                            </p>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="flex items-center justify-center gap-6 py-1 lg:gap-8"
                >
                    <div class="hidden flex-1 bg-white/20 lg:block"></div>
                    <div class="grid w-full gap-16 md:grid-cols-3">
                        {#each items.devs as { img, name, alt, socials }, i}
                            <div
                                data-sr
                                data-sr-delay={i * 140}
                                class="group flex flex-col items-center rounded-3xl border border-[#6FB8E7]
                             bg-[#061E29]/50 cursor-pointer hover:bg-slate-800/70 px-6 py-8
                              text-center shadow-[0_18px_50px_rgba(2,6,23,0.45)] backdrop-blur-sm
                             hover:translate-y-6 hover:scale-105
                              transition duration-300"
                            >
                                <img
                                    data-sr
                                    data-sr-delay={i * 140 + 60}
                                    src={img}
                                    alt="{alt} avatar placeholder"
                                    class="group-hover:scale-125 text-black h-20 w-20 rounded-full bg-white/95 object-cover transition-transform duration-300"
                                />
                                <p
                                    class="relative mt-8 text-lg font-medium text-white"
                                >
                                    <span
                                        data-sr
                                        data-sr-delay={i * 140 + 120}
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
                       group-hover:after:w-full"
                                    >
                                        {name}</span
                                    >
                                </p>

                                <div
                                    class="flex mt-8 items-center justify-center gap-4"
                                >
                                    {#each socials as { icon, link }, j}
                                        <div
                                            data-sr
                                            data-sr-delay={i * 140 + j * 80}
                                            class="hover:-translate-y-3 flex h-10 w-10 items-center justify-center rounded-md border border-sky-400/40 bg-slate-950/35 transition hover:bg-slate-900/60"
                                        >
                                            <a
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class=""
                                            >
                                                <i class={icon}></i>
                                            </a>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/each}
                    </div>
                    <div class="hidden h-px flex-1 bg-white/20 lg:block"></div>
                </div>
            </div>
        </div>
    </Layout>
</div>
