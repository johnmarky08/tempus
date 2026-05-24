<script>
    import Layout from "./components/layout.svelte";
    import * as items from "../js/items.js";
    import { fade, scale } from "svelte/transition";

    let showDescription = false;
</script>

<div>
    {#if showDescription}
        <div
            transition:fade={{ duration: 160 }}
            class="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md bg-black/50"
        >
            <div
                transition:scale={{ duration: 180, start: 0.96 }}
                class="relative w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#6FB8E7] bg-[#061E29] p-8 shadow-2xl"
            >
                <button
                    on:click={() => (showDescription = false)}
                    class="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-slate-950/40 border border-sky-400/40 text-white transition hover:bg-slate-900/70 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,2)]"
                >
                    <i class="ri-fullscreen-exit-fill text-lg"></i>
                </button>
                <div class="flex flex-col gap-5 pr-6">
                    <h2
                        data-sr
                        data-sr-delay="40"
                        class="text-2xl font-bold text-center tracking-tight text-white"
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
                        class="text-base leading-7 text-slate-300 text-justify"
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
        <div class="scroll-smooth snap-y snap-mandatory">
            <div
                class="flex w-full flex-col space-y-20 text-white font-jetbrainsMono"
            >
                <div class="space-y-12 snap-start">
                    <div class="text-center space-y-5">
                        <h1
                            data-sr
                            data-sr-delay="400"
                            class="text-center text-5xl font-bold"
                        >
                            About <span class="text-[#6FB8E7]">T.E.M.P.U.S</span
                            >
                        </h1>
                        <p
                            data-sr
                            data-sr-delay="500"
                            class="text-center text-lg text-slate-300"
                        >
                            Learn more about our mission and the team behind
                            T.E.M.P.U.S.
                        </p>
                    </div>

                    <div
                        class="flex flex-col gap-8 lg:flex-row lg:items-stretch font-bold"
                    >
                        <div
                            class="flex w-full flex-col rounded-3xl border border-[#6FB8E7] bg-[#061E29]/50 p-6 shadow-[0_18px_50px_rgba(2,6,23,0.45)] backdrop-blur-sm sm:p-8 lg:w-1/2"
                        >
                            <div class="flex flex-col gap-5">
                                <h2
                                    data-sr
                                    data-sr-delay="40"
                                    class="text-3xl tracking-tight text-white"
                                >
                                    System Overview
                                </h2>

                                <p
                                    data-sr
                                    data-sr-delay="120"
                                    class="max-w-xl text-sm font-light leading-6 text-slate-300 sm:text-base"
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
                                    is to make daily life safer, more
                                    affordable, and easier to manage through
                                    simple, actionable insights.
                                </p>

                                <div class="flex items-center pt-1">
                                    <button
                                        on:click={() =>
                                            (showDescription = true)}
                                        class="hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,2)] inline-flex items-center gap-3 rounded-lg border border-sky-400/40 bg-slate-950/40 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-900/70"
                                    >
                                        <span>View Full Overview</span>
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
                                    Technologies/Tools Used
                                </h2>

                                <div
                                    class="flex flex-col gap-4 pt-2 max-h-72 overflow-x-hidden px-8 py-4 overflow-y-scroll scroll-smooth"
                                >
                                    {#each items.techStacks as { img, name, description, alt, color, textColor }, i}
                                        <div
                                            data-sr
                                            class="group hover:scale-105 {color} flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-4 transition duration-300 ease-in-out"
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
                </div>

                <div class="space-y-16 snap-start">
                    <div class="text-center space-y-5">
                        <h1
                            data-sr
                            data-sr-delay="400"
                            class="text-center text-5xl font-bold"
                        >
                            Meet the <span class="text-[#6FB8E7]">Devs!</span>
                        </h1>
                        <p data-sr data-sr-delay="400">
                            The team behind our innovative solutions
                        </p>
                    </div>

                    <div
                        class="flex items-center justify-center gap-6 py-1 lg:gap-8"
                    >
                        <div class="hidden flex-1 bg-white/20 lg:block"></div>
                        <div class="grid w-full gap-16 md:grid-cols-3">
                            {#each items.devs as { img, name, alt, description, socials }, i}
                                <div class="relative group">
                                    <div
                                        class="place-self-center h-10 w-1/2 translate-y-10
                                        border border-[#6FB8E7] bg-[#061E29] rounded-[15px] opacity-0
                                        transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-5
                                        flex items-center justify-center text-center"
                                    >
                                        {description}
                                    </div>
                                    <div
                                        data-sr
                                        data-sr-delay={i * 140}
                                        class="group relative flex flex-col items-center rounded-3xl border
                                         border-[#6FB8E7]
                             bg-[#061E29]/70 group-hover:bg-slate-800/70 px-6 py-8
                              text-center shadow-[0_18px_50px_rgba(2,6,23,0.45)]
                             group-hover:translate-y-6 group-hover:scale-105
                              transition duration-300"
                                    >
                                        <img
                                            data-sr
                                            data-sr-delay={i * 140 + 60}
                                            src={img}
                                            alt="{alt} avatar placeholder"
                                            class="group-hover:scale-125 text-black h-20 w-20 rounded-full bg-white/95
                                         object-cover transition-transform duration-300"
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
                       after:-z-9999
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
                                                {name}
                                            </span>
                                        </p>

                                        <div
                                            class="flex mt-8 items-center justify-center gap-4"
                                        >
                                            {#each socials as { icon, link }, j}
                                                <div
                                                    data-sr
                                                    data-sr-delay={i * 140 +
                                                        j * 80}
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
