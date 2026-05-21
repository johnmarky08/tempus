<script>
    import { inertia } from "@inertiajs/svelte";
    import Layout from "./components/layout.svelte";

    let now = new Date();

    let day;
    let date;
    let showFuelPrices = Math.random() > 0.5;

    (() => {
        now = new Date();

        day = now.toLocaleDateString("en-US", { weekday: "long" });

        date = now.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
        });
    })();
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
                                Monitor
                                <span class="text-sky-300">Fuel Price</span>
                                and
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
                                {#if showFuelPrices}
                                    <a
                                        use:inertia
                                        href="/fuel-prices"
                                        data-sr
                                        data-sr-delay="260"
                                        class="hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,2)] inline-flex items-center gap-3 rounded-lg border border-sky-400/50 bg-slate-950/40 px-5 py-3 text-sm text-sky-100 transition duration-300 ease-in-out border-[#6FB8E7] hover:bg-slate-900/60"
                                    >
                                        <span>View Fuel Prices</span>
                                        <i class="ri-gas-station-fill"></i>
                                    </a>
                                {:else}
                                    <a
                                        use:inertia
                                        href="/heat-index"
                                        data-sr
                                        data-sr-delay="260"
                                        class="hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,2)] inline-flex items-center gap-3 rounded-lg border border-sky-400/50 bg-slate-950/40 px-5 py-3 text-sm text-sky-100 transition duration-300 ease-in-out border-[#6FB8E7] hover:bg-slate-900/60"
                                    >
                                        <span>View Heat Index</span>
                                        <i class="ri-sun-foggy-fill"></i>
                                    </a>
                                {/if}

                                <a
                                    use:inertia
                                    data-sr
                                    data-sr-delay="320"
                                    href="/about"
                                    class="hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,2)] inline-flex items-center gap-3 rounded-lg bg-white px-5 py-3 text-sm text-black shadow-white/10 transition hover:bg-slate-100"
                                >
                                    <span>Learn More</span>
                                    <i class="ri-arrow-right-fill"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div
                        class="relative flex w-full justify-center lg:justify-end px-16"
                    >
                        <div
                            class="relative flex w-full max-w-2xl items-end justify-end overflow-hidden rounded-3xl border border-white bg-slate-800/75 p-6 backdrop-blur-sm sm:p-8 lg:min-h-[28rem] lg:p-10 floating floating-border"
                        >
                            <img
                                data-sr
                                data-sr-delay="150"
                                src="/images/items/demo-2.png"
                                alt="Fuel Price Graph"
                                class="absolute rounded-[10px] object-fit h-auto w-[80%] right-[2rem] top-[2rem] border border-white"
                            />
                            <img
                                data-sr
                                data-sr-delay="150"
                                src="/images/items/demo.png"
                                alt="Fuel Price Graph"
                                class="absolute rounded-[10px] object-fit h-auto w-[80%] left-[2rem] bottom-[2rem] border border-white"
                            />
                            <div
                                class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(125,211,252,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.12),_transparent_30%)] pointer-events-none"
                            ></div>
                            <div
                                class="absolute flex h-full w-full items-end justify-end bottom-[-3rem] right-[-1rem]"
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
            </div>
        </div>
    </Layout>
</div>
