<script>
    import { inertia } from "@inertiajs/svelte";
    import Layout from "./components/layout.svelte";
    import { dark } from "../js/theme.js";

    export let errors = null;

    void errors;

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
        <div
            class="space-y-6 sm:space-y-8 lg:space-y-10 scroll-smooth lg:snap-y lg:snap-mandatory"
        >
            <div
                class="text-white space-y-8 sm:space-y-12 lg:space-y-16 lg:snap-start"
            >
                <div
                    data-sr
                    class="transition-all duration-300 ease-out
                           flex flex-wrap
                           text-sm gap-3
                           sm:text-lg sm:gap-6
                           lg:text-2xl lg:gap-10
                           justify-center md:justify-start lg:justify-center
                           items-center
                           font-spaceGrotesk font-semibold
                           {$dark
                        ? 'text-white'
                        : 'text-[var(--primary-text)]'}"
                >
                    <p>{day}</p>
                    <p>{date}</p>
                    <p>Laguna</p>
                </div>

                <div
                    class="transition-all duration-300 ease-out
                           flex flex-col gap-8
                           sm:gap-10
                           lg:flex-row lg:justify-between lg:gap-10 lg:items-start
                           text-white"
                >
                    <div
                        class="flex w-full lg:max-w-2xl flex-col gap-5 sm:gap-6 lg:gap-8 pt-4 sm:pt-6 lg:pt-10
                                items-center text-center
                                md:items-start md:text-left"
                    >
                        <div
                            data-sr
                            class="transition-all duration-300 ease-out
                                   flex font-jetbrainsMono items-center gap-2 lg:gap-3
                                   rounded-[15px] border
                                   dark:border dark:border-sky-400/30 border-[var(--border)]
                                   dark:bg-sky-500/20 bg-[color-mix(in_srgb,var(--bg)_70%,transparent)]
                                   px-3 py-2 lg:px-4 lg:py-3
                                   text-[10px] sm:text-[11px] lg:text-xs
                                   font-semibold uppercase tracking-[0.20em] lg:tracking-[0.28em]
                                   dark:text-sky-200 text-[var(--primary-text)] backdrop-blur-sm"
                        >
                            <span>Live monitoring</span>
                            <span
                                class="transition-all duration-300 ease-out h-1 w-1 rounded-full dark:bg-sky-300 bg-[var(--primary-text)]"
                            ></span>
                            <span>Updated now</span>
                        </div>

                        <div
                            class="flex flex-col gap-4 sm:gap-5 lg:gap-6 items-center md:items-start"
                        >
                            <h1
                                data-sr
                                data-sr-delay="100"
                                class="transition-all duration-300 ease-out
                                       max-w-[300px] sm:max-w-lg lg:max-w-xl
                                       text-2xl leading-snug
                                       sm:text-3xl sm:leading-tight
                                       lg:text-5xl lg:leading-tight
                                       font-bold tracking-tight
                                       {$dark
                                    ? 'text-white'
                                    : 'text-[var(--primary-text)]'}"
                            >
                                Monitor
                                <span
                                    class="transition-all duration-300 ease-out dark:text-sky-300 text-[var(--accent)]"
                                    >Fuel Price</span
                                >
                                and
                                <span
                                    class="transition-all duration-300 ease-out dark:text-sky-300 text-[var(--accent)]"
                                    >Heat Index</span
                                >
                                Proactively
                            </h1>

                            <!-- Body text -->
                            <p
                                data-sr
                                data-sr-delay="180"
                                class="transition-all duration-300 ease-out
                                       max-w-[270px] sm:max-w-[420px] lg:max-w-[500px]
                                       text-xs leading-5
                                       sm:text-sm sm:leading-6
                                       lg:text-base lg:leading-6
                                       {$dark
                                    ? 'text-slate-300'
                                    : 'text-[var(--primary-text)]'}
                                       font-jetbrainsMono font-light"
                            >
                                T.E.M.P.U.S. is your personal software
                                application that aggregates live market data of
                                fuel and local heat indices, alerting you to
                                crucial changes and health risks.
                            </p>

                            <div
                                class="flex flex-row justify-center md:justify-start
                                items-center gap-3 scale-[.85] sm:scale-100lg:gap-4 font-jetbrainsMono font-bold text-nowrap"
                            >
                                {#if showFuelPrices}
                                    <a
                                        use:inertia
                                        href="/fuel-prices"
                                        data-sr
                                        data-sr-delay="260"
                                        class="hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,2)]
                                               inline-flex items-center gap-2 lg:gap-3 rounded-lg border
                                               dark:border dark:border-sky-400/50 dark:bg-slate-950/40
                                               bg-[color-mix(in_srgb,_var(--bg-secondary)_60%,transparent)]
                                               px-4 py-2.5 lg:px-5 lg:py-3
                                               text-xs lg:text-sm
                                               text-[var(--primary-text)] dark:text-sky-100
                                               transition duration-300 ease-in-out
                                               border-[var(--accent)]
                                               hover:bg-[color-mix(in_srgb,_var(--hover)_60%,transparent)]
                                               dark:hover:bg-slate-900/60"
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
                                        class="hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,2)]
                                               inline-flex items-center gap-2 lg:gap-3 rounded-lg border
                                               dark:border dark:border-sky-400/50 dark:bg-slate-950/40
                                               bg-[color-mix(in_srgb,_var(--bg-secondary)_60%,transparent)]
                                               px-4 py-2.5 lg:px-5 lg:py-3
                                               text-xs lg:text-sm
                                               text-[var(--primary-text)] dark:text-sky-100
                                               transition duration-300 ease-in-out
                                               border-[var(--accent)]
                                               hover:bg-[color-mix(in_srgb,_var(--hover)_60%,transparent)]
                                               dark:hover:bg-slate-900/60"
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
                                    class="hover:scale-105
                                           hover:shadow-[0_0_40px_rgba(59,130,246,2)]
                                           inline-flex items-center gap-2 lg:gap-3 rounded-lg
                                           bg-[var(--panel-bg)]
                                           px-4 py-2.5 lg:px-5 lg:py-3
                                           text-xs lg:text-sm
                                           text-[var(--primary-text)] shadow-white/10
                                           transition hover:bg-[var(--hover)] duration-300 ease-out"
                                >
                                    <span>Learn More</span>
                                    <i class="ri-arrow-right-fill"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div
                        class="sm:hidden relative flex w-full justify-center px-4"
                    >
                        <div
                            class="relative overflow-visible w-full max-w-[360px]"
                        >
                            <div
                                class="relative flex w-full
                   items-end justify-end overflow-hidden
                   rounded-2xl border px-4 backdrop-blur-sm
                   min-h-[18rem]
                   floating floating-border

                   {$dark
                                    ? 'border-white bg-slate-800/75'
                                    : 'border-[var(--accent)] border-2 bg-gradient-to-r from-[color-mix(in_srgb,var(--accent)_40%,transparent)] to-[color-mix(in_srgb,var(--bg-secondary)_40%,transparent)]'}"
                            >
                                <img
                                    data-sr
                                    data-sr-delay="150"
                                    src="/images/items/{$dark
                                        ? 'demo-2'
                                        : 'light-demo-2'}.png"
                                    alt="Fuel Price Graph"
                                    class="absolute
                       w-[11rem]
                       top-[1rem] right-[1rem]
                       rounded-[8px]
                       border border-[var(--border-color)]"
                                />

                                <img
                                    data-sr
                                    data-sr-delay="150"
                                    src="/images/items/{$dark
                                        ? 'demo'
                                        : 'light-demo'}.png"
                                    alt="Fuel Price Graph"
                                    class="absolute
                       w-[12rem]
                       bottom-[5rem] left-[1rem]
                       rounded-[8px]
                       border border-[var(--border-color)]"
                                />

                                <div
                                    class="absolute inset-0 pointer-events-none
                       bg-[radial-gradient(circle_at_top_right,_rgba(125,211,252,0.18),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.12),_transparent_35%)]"
                                ></div>

                                <div
                                    class="absolute bottom-[0rem] right-[-1rem]"
                                >
                                    <img
                                        data-sr
                                        data-sr-delay="200"
                                        src="/images/items/rimuru_slime.png"
                                        alt="Rimuru Slime"
                                        class="h-40 w-40 rounded-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        class="relative hidden sm:flex w-full justify-center lg:justify-end lg:px-16"
                    >
                        <div
                            class="relative overflow-visible
                                    
                                    w-full h-auto"
                        >
                            <div
                                class="relative flex w-full max-w-2xl
                                       items-end justify-end overflow-hidden
                                       rounded-3xl border p-10 backdrop-blur-sm min-h-[28rem]
                                       floating floating-border

                                       transition-transform duration-300
                                       {$dark
                                    ? 'border-white bg-slate-800/75'
                                    : 'border-[var(--accent)] border-2 bg-gradient-to-r from-[color-mix(in_srgb,var(--accent)_40%,transparent)] to-[color-mix(in_srgb,var(--bg-secondary)_40%,transparent)]'}"
                            >
                                <img
                                    data-sr
                                    data-sr-delay="150"
                                    src="/images/items/{$dark
                                        ? 'demo-2'
                                        : 'light-demo-2'}.png"
                                    alt="Fuel Price Graph"
                                    class="absolute rounded-[10px] object-fit h-auto
                                           sm:w-[80%] right-[2rem] top-[2rem]
                                           border border-[var(--border-color)]"
                                />

                                <img
                                    data-sr
                                    data-sr-delay="150"
                                    src="/images/items/{$dark
                                        ? 'demo'
                                        : 'light-demo'}.png"
                                    alt="Fuel Price Graph"
                                    class="absolute rounded-[10px] object-fit h-auto
                                           w-[80%] left-[2rem] bottom-[2rem]
                                           border border-[var(--border-color)]"
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
                                        class="h-80 w-80 rounded-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Layout>
</div>
