<script>
    import Layout from "./components/layout.svelte";
    import * as items from "../js/items.js";
    import { fade, scale } from "svelte/transition";
    import { dark } from "../js/theme.js";

    export let errors = null;

    void errors;

    let showDescription = false;
</script>

<div>
    {#if showDescription}
        <div
            transition:fade={{ duration: 160 }}
            class="fixed inset-0 z-[99999] flex items-center justify-center p-4 backdrop-blur-md dark:bg-black/50 bg-white/50 transition-all duration-300 ease-out"
        >
            <div
                transition:scale={{ duration: 180, start: 0.96 }}
                class="relative w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-6xl max-h-[85vh] lg:max-h-[90vh] overflow-y-auto rounded-2xl lg:rounded-3xl border border-[#6FB8E7] dark:bg-[#061E29] bg-[var(--bg)] p-5 sm:p-6 lg:p-8 shadow-2xl"
            >
                <button
                    on:click={() => (showDescription = false)}
                    class="absolute top-3 right-3 lg:top-4 lg:right-4 flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-950/40 border border-sky-400/40 text-white transition hover:bg-slate-900/70 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,2)]"
                >
                    <i class="ri-fullscreen-exit-fill text-sm lg:text-lg"></i>
                </button>
                <div class="flex flex-col gap-3 lg:gap-5 pr-2 lg:pr-6">
                    <h2
                        data-sr
                        data-sr-delay="40"
                        class="transition-all duration-300 ease-out text-base sm:text-xl lg:text-2xl font-bold text-center tracking-tight dark:text-white text-black"
                    >
                        <span class="text-[#6FB8E7]">T</span>hermal and
                        <span class="text-[#6FB8E7]">E</span>nergy
                        <span class="text-[#6FB8E7]">M</span>etrics:
                        <span class="text-[#6FB8E7]">P</span>redictive
                        <span class="text-[#6FB8E7]">U</span>tility and
                        <span class="text-[#6FB8E7]">S</span>afety
                        (T.E.M.P.U.S.)
                    </h2>

                    <p
                        data-sr
                        data-sr-delay="120"
                        class="text-xs sm:text-sm lg:text-base leading-5 sm:leading-6 lg:leading-7 dark:text-slate-300 text-gray-600
                        transition-all duration-300 ease-out text-justify"
                    >
                        T.E.M.P.U.S. is a smart forecasting and decision-support
                        platform designed to help users manage two major
                        everyday challenges: rising fuel prices and dangerous
                        heat conditions. In many communities, sudden fuel price
                        increases directly affect transportation costs, food
                        prices, and daily expenses, while extreme heat creates
                        serious health risks, especially for commuters, outdoor
                        workers, and vulnerable individuals. These problems are
                        often treated separately, causing people to react too
                        late instead of preparing early. The main goal of
                        T.E.M.P.U.S. is to provide users with early warnings and
                        practical daily recommendations by combining fuel price
                        tracking and heat index monitoring into one unified
                        system. Rather than overwhelming users with complex
                        charts or excessive information, the platform focuses on
                        simple, clear, and actionable insights that can help
                        people make smarter decisions every day. To predict fuel
                        price changes, T.E.M.P.U.S. uses the ARIMAX
                        (AutoRegressive Integrated Moving Average with Exogenous
                        Variables) model, which analyzes historical fuel price
                        patterns together with external market factors such as
                        global supply changes and economic influences. This
                        allows the system to forecast possible fuel price spikes
                        before they happen, giving users time to plan ahead. For
                        weather-related safety, T.E.M.P.U.S. uses a Random
                        Forest Regressor to calculate the heat index based on
                        temperature, humidity, and other environmental
                        conditions. Since heat index reflects how hot it
                        actually feels to the human body, this provides a more
                        realistic measure of heat danger than temperature alone.
                        After calculating the heat index, a Random Forest
                        Classifier evaluates the result alongside personal
                        factors such as age, location, and daily routine to
                        generate personalized recommendations. These may include
                        suggestions like refueling before a price increase,
                        avoiding outdoor activities during dangerous heat hours,
                        staying hydrated, or adjusting travel schedules. What
                        makes T.E.M.P.U.S. unique is its ability to connect
                        financial survival and physical safety into one
                        intelligent daily brief. Instead of using separate apps
                        for price tracking and weather monitoring, users receive
                        one unified survival plan that helps protect both their
                        health and their budget. T.E.M.P.U.S. is designed to be
                        simple, practical, and proactive—helping users prepare
                        before problems happen, not after.
                    </p>
                </div>
            </div>
        </div>
    {/if}
    <Layout isActive="About">
        <div
            class="scroll-smooth snap-y snap-mandatory px-4 sm:px-6 md:px-8 lg:px-0"
        >
            <div
                class="flex w-full flex-col space-y-10 sm:space-y-14 md:space-y-16 lg:space-y-20 dark:text-white text-black font-jetbrainsMono transition-all duration-300 ease-out"
            >
                <div
                    class="space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12 snap-start"
                >
                    <div
                        class="text-center space-y-2 sm:space-y-3 lg:space-y-5"
                    >
                        <h1
                            data-sr
                            data-sr-delay="400"
                            class="text-center text-3xl sm:text-4xl lg:text-5xl font-bold"
                        >
                            About <span
                                class="dark:text-[#6FB8E7] text-[var(--accent)] transition-colors duration-300 ease-out"
                                >T.E.M.P.U.S</span
                            >
                        </h1>
                        <p
                            data-sr
                            data-sr-delay="500"
                            class="text-center text-xs sm:text-sm lg:text-lg dark:text-slate-300 text-gray-700 transition-all duration-300 ease-out"
                        >
                            Learn more about our mission and the team behind
                            T.E.M.P.U.S.
                        </p>
                    </div>

                    <div
                        class="flex flex-col gap-6 md:gap-8 lg:flex-row lg:items-stretch font-bold"
                    >
                        <div
                            class="flex w-full flex-col rounded-2xl lg:rounded-3xl border dark:border-[#6FB8E7] border-[var(--accent)] dark:bg-[#061E29]/50
                            bg-[color-mix(in_srgb,var(--bg-secondary)_40%,_transparent)]
                            p-5 sm:p-6 lg:p-8 shadow-[0_18px_50px_rgba(2,6,23,0.45)] backdrop-blur-sm lg:w-1/2 transition-all duration-300 ease-out"
                        >
                            <div class="flex flex-col gap-3 sm:gap-4 lg:gap-5">
                                <h2
                                    data-sr
                                    data-sr-delay="40"
                                    class="text-xl sm:text-2xl lg:text-3xl tracking-tight dark:text-white text-black transition-all duration-300 ease-out"
                                >
                                    System Overview
                                </h2>

                                <p
                                    data-sr
                                    data-sr-delay="120"
                                    class=" sm:hidden block max-w-xl text-xs sm:text-sm font-light leading-5 sm:leading-6 dark:text-slate-300 text-gray-700 transition-all duration-300 ease-out lg:text-base"
                                >
                                    T.E.M.P.U.S. is a smart daily companion that
                                    helps users manage rising fuel prices
                                    alongside dangerous heat conditions...
                                </p>

                                <p
                                    data-sr
                                    data-sr-delay="120"
                                    class="hidden sm:block max-w-xl text-xs sm:text-sm font-light leading-5 sm:leading-6 dark:text-slate-300 text-gray-700 transition-all duration-300 ease-out lg:text-base"
                                >
                                    T.E.M.P.U.S. is a smart daily companion that
                                    helps users manage rising fuel prices
                                    alongside dangerous heat conditions. It
                                    predicts price spikes and monitors personal
                                    heat danger levels, offering early warnings
                                    before risks become costly or harmful. The
                                    platform provides clear, practical
                                    recommendations such as when to refuel, when
                                    to avoid outdoor activities, and how to save
                                    money during high-risk days. Its objective
                                    to make daily life safer, more affordable,
                                    and easier to manage through simple,
                                    actionable insights.
                                </p>

                                <div class="flex items-center pt-1">
                                    <button
                                        on:click={() =>
                                            (showDescription = true)}
                                        class="hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,2)]
                                                inline-flex items-center gap-2 sm:gap-3 rounded-lg border dark:border
                                              dark:border-sky-400/50 dark:bg-slate-950/40
                                                bg-[color-mix(in_srgb,_var(--bg-secondary)_60%,transparent)]
                                                px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm
                                                text-[var(--primary-text)] dark:text-sky-100
                                                transition duration-300 ease-in-out
                                                border-[var(--accent)]
                                                hover:bg-[color-mix(in_srgb,_var(--hover)_100%,transparent)]
                                              dark:hover:bg-slate-900/60"
                                    >
                                        <span>View Full Overview</span>
                                        <i class="ri-fullscreen-fill"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div
                            class="hidden w-px dark:bg-white bg-black lg:block transition-all duration-300 ease-out"
                        ></div>

                        <div
                            class="flex w-full flex-col rounded-2xl lg:rounded-3xl border dark:border-[#6FB8E7] border-[var(--accent)] dark:bg-[#061E29]/50
                            bg-[color-mix(in_srgb,var(--bg-secondary)_40%,_transparent)]
                            p-5 sm:p-6 lg:p-8 shadow-[0_18px_50px_rgba(2,6,23,0.45)] backdrop-blur-sm lg:w-1/2 transition-all duration-300 ease-out"
                        >
                            <div class="flex flex-col gap-3 sm:gap-4 lg:gap-5">
                                <h2
                                    data-sr
                                    class="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight dark:text-white text-black transition-all duration-300 ease-out"
                                >
                                    Technologies/Tools Used
                                </h2>

                                <div
                                    class="cursor-default flex flex-col gap-3 sm:gap-4 pt-3 sm:pt-4 max-h-60 sm:max-h-64 lg:max-h-72 overflow-x-hidden px-2 sm:px-4 lg:px-8 py-2 lg:py-4 overflow-y-scroll scroll-smooth"
                                >
                                    {#each items.techStacks as { img, name, description, alt, color, colorDark, textColor, textColorDark }, i}
                                        <div
                                            data-sr
                                            class="group hover:scale-[1.02] lg:hover:scale-105 {$dark
                                                ? colorDark
                                                : color} flex items-center gap-3 sm:gap-4 rounded-xl lg:rounded-2xl dark:border dark:border-white/10 border-[var(--active-border)] border-2 dark:bg-slate-950/20 bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] px-3 py-3 sm:px-4 sm:py-4 transition duration-300 ease-in-out"
                                        >
                                            <div
                                                class="h-10 w-10 sm:h-11 sm:w-11 lg:h-12
                                                 lg:w-12 shrink-0 overflow-hidden rounded-full bg-white/5 p-1
                                                  transition-all duration-300 ease-out group-hover:scale-125"
                                            >
                                                <img
                                                    data-sr
                                                    src={img}
                                                    {alt}
                                                    class="h-full w-full object-contain p-1"
                                                />
                                            </div>
                                            <div
                                                class="flex flex-col gap-0.5 sm:gap-1"
                                            >
                                                <p
                                                    data-sr
                                                    class="{$dark
                                                        ? textColorDark
                                                        : textColor}  group-hover:scale-110 group-hover:translate-x-1 lg:group-hover:translate-x-4
                                                         transition-all duration-300 text-sm sm:text-base
                                                         font-semibold dark:text-white text-black ease-out"
                                                >
                                                    {name}
                                                </p>
                                                <p
                                                    data-sr
                                                    class="font-jetbrainsMono text-xs
                                                    sm:text-sm dark:text-slate-300 text-gray-500 transition-all
                                                    duration-300 ease-out"
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
                </div>

                <div
                    class="space-y-10 sm:space-y-12 md:space-y-14 lg:space-y-16 snap-start"
                >
                    <div
                        class="text-center space-y-2 sm:space-y-3 lg:space-y-5"
                    >
                        <h1
                            data-sr
                            data-sr-delay="400"
                            class="text-center text-3xl sm:text-4xl lg:text-5xl font-bold"
                        >
                            Meet the <span
                                class="dark:text-[#6FB8E7] text-[var(--accent)] transition-all duration-300 ease-out"
                                >Devs!</span
                            >
                        </h1>
                        <p
                            data-sr
                            data-sr-delay="400"
                            class="text-xs sm:text-sm lg:text-base"
                        >
                            The team behind our innovative solutions
                        </p>
                    </div>

                    <div
                        class="flex items-center justify-center gap-4 lg:gap-8 py-1"
                    >
                        <div
                            class="hidden flex-1 dark:bg-white/20 bg-black/20 transition-all duration-300 ease-out lg:block"
                        ></div>

                        <!-- Grid scales flawlessly from 1 col (base) to 2 cols (sm/md) to 3 cols (lg) -->
                        <div
                            class="grid w-full gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-3 max-w-sm sm:max-w-2xl lg:max-w-none mx-auto"
                        >
                            {#each items.devs as { img, name, alt, description, socials }, i}
                                <!-- Added focus-within to make keyboard navigation trigger it too -->
                                <div
                                    class="relative group flex flex-col justify-end focus-within:outline-none"
                                >
                                    <!-- Role Tooltip Indicator: Now visible on group-hover/group-focus across ALL screens -->
                                    <div
                                        class="place-self-center h-8 sm:h-9 lg:h-10 w-2/3 lg:w-1/2 translate-y-6 sm:translate-y-6 lg:translate-y-10
                                             border-2 dark:border-[#6FB8E7] border-[var(--active-border)] bg-[color-mix(in_srgb,var(--accent)_30%,transparent)] rounded-[12px] lg:rounded-[15px]
                                             opacity-0 pointer-events-none transition-all duration-300 ease-out
                                             group-hover:opacity-100 lg:group-hover:-translate-y-5 group-hover:-translate-y-1 group-focus-within:opacity-100 group-focus-within:-translate-y-5
                                             flex items-center justify-center text-center text-xs sm:text-sm font-medium z-10"
                                    >
                                        {description}
                                    </div>

                                    <!-- Main Profile Card -->
                                    <div
                                        data-sr
                                        data-sr-delay={i * 140}
                                        class="group relative flex flex-col items-center rounded-2xl lg:rounded-3xl border
                 dark:border-[#6FB8E7] border-[var(--accent)] dark:bg-[#061E29] bg-[color-mix(in_srgb,var(--bg-secondary)_90%,transparent)]
                 shadow-[0_18px_50px_rgba(2,6,23,0.45)] px-4 py-6 sm:px-6 sm:py-8 text-center transition-all duration-300 ease-out
                group-hover:translate-y-6 group-hover:scale-105 group-hover:bg-[color-mix(in_srgb,var(--accent)_30%,transparent)]
                 group-focus-within:translate-y-6 group-focus-within:scale-105"
                                    >
                                        <img
                                            data-sr
                                            data-sr-delay={i * 140 + 60}
                                            src={img}
                                            alt="{alt} avatar placeholder"
                                            class="group-hover:scale-125 group-focus-within:scale-125 text-black h-16 w-16 sm:h-18 sm:w-18 lg:h-20 lg:w-20 rounded-full dark:bg-white/95 bg-black/95
                                                object-cover transition-transform duration-300 ease-out"
                                        />
                                        <p
                                            class="relative mt-5 sm:mt-6 lg:mt-8 text-base sm:text-lg
                                            font-medium dark:text-white text-black transition-all duration-300 ease-out"
                                        >
                                            <span
                                                data-sr
                                                data-sr-delay={i * 140 + 120}
                                                class="
                       after:content-['']
                       after:absolute
                       after:-z-9999
                       after:left-1/2
                       after:-translate-x-1/2
                       after:-bottom-1
                       after:h-[2px]
                       after:w-0
                       dark:after:bg-[#6FB8E7]
                       after:bg-[var(--accent)]
                       after:transition-all
                       after:duration-300
                       group-hover:after:w-full
                       group-focus-within:after:w-full"
                                            >
                                                {name}
                                            </span>
                                        </p>

                                        <!-- Hidden mobile text removed since hover/tap state works universally now -->

                                        <div
                                            class="flex mt-5 sm:mt-6 lg:mt-8 items-center justify-center gap-3 sm:gap-4"
                                        >
                                            {#each socials as { icon, link }, j}
                                                <div
                                                    data-sr
                                                    data-sr-delay={i * 140 +
                                                        j * 80}
                                                    role="link"
                                                    tabindex="0"
                                                    on:click={(event) =>
                                                        event.currentTarget
                                                            .querySelector("a")
                                                            ?.click()}
                                                    on:keydown={(event) => {
                                                        if (
                                                            event.key ===
                                                                "Enter" ||
                                                            event.key === " "
                                                        ) {
                                                            event.preventDefault();
                                                            event.currentTarget
                                                                .querySelector(
                                                                    "a",
                                                                )
                                                                ?.click();
                                                        }
                                                    }}
                                                    class="hover:-translate-y-3 focus-within:-translate-y-3 flex h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 cursor-pointer items-center justify-center rounded-md
                            border dark:border-sky-400/40 border-[--accent] dark:bg-slate-950/35 bg-gray-400/35 transition dark:hover:bg-slate-900/60 hover:bg-gray-350/60"
                                                >
                                                    <a
                                                        href={link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        class="text-xs sm:text-sm lg:text-base"
                                                    >
                                                        <i class={icon}></i>
                                                    </a>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                        <div
                            class="hidden h-px flex-1 bg-white/20 lg:block"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </Layout>
</div>
