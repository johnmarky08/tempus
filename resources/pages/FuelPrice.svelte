<script>
    import Layout from "./components/layout.svelte";
    import { buildTrackPriceDashboard } from "../js/trackPrice.js";
    import { tick } from "svelte";
    import { fade } from "svelte/transition";

    let hoverEl;
    let parentEl;
    let tooltipLayout = { left: 0, top: 0 };

    export let fuelPrices = [];

    let selectedFuel = "all";
    let selectedMonth = "";
    let hoveredPoint = null;
    let dashboard;

    $: dashboard = buildTrackPriceDashboard(
        fuelPrices,
        selectedFuel,
        selectedMonth,
    );

    function selectFuel(value) {
        selectedFuel = value;
        hoveredPoint = null;
    }

    function selectMonth(value) {
        selectedMonth = value;
        hoveredPoint = null;
    }

    async function setHoveredPoint(point, event = null) {
        hoveredPoint = {
            ...point,
            ...dashboard.chart.hoverGroups.get(point.dateIso),
            left: Math.max(18, Math.min(82, (point.x / 1000) * 100)),
            top: Math.max(16, Math.min(84, (point.y / 420) * 100)),
            anchorClientX: event?.clientX ?? null,
            anchorClientY: event?.clientY ?? null,
        };

        await tick();
        updateTooltipLayout();
    }

    function clearHoveredPoint() {
        hoveredPoint = null;
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function updateTooltipLayout() {
        if (!hoveredPoint || !hoverEl || !parentEl) {
            return;
        }

        const parentRect = parentEl.getBoundingClientRect();
        const tooltipRect = hoverEl.getBoundingClientRect();
        const margin = 12;
        const offset = 14;

        const anchorX =
            hoveredPoint.anchorClientX !== null
                ? hoveredPoint.anchorClientX - parentRect.left
                : (hoveredPoint.x / 1000) * parentRect.width;
        const anchorY =
            hoveredPoint.anchorClientY !== null
                ? hoveredPoint.anchorClientY - parentRect.top
                : (hoveredPoint.y / 420) * parentRect.height;

        const placements = [
            {
                left: anchorX + offset,
                top: anchorY - tooltipRect.height - offset,
            },
            {
                left: anchorX - tooltipRect.width - offset,
                top: anchorY - tooltipRect.height - offset,
            },
            {
                left: anchorX + offset,
                top: anchorY + offset,
            },
            {
                left: anchorX - tooltipRect.width - offset,
                top: anchorY + offset,
            },
        ];

        const fit = placements.find(
            (placement) =>
                placement.left >= margin &&
                placement.top >= margin &&
                placement.left + tooltipRect.width <=
                    parentRect.width - margin &&
                placement.top + tooltipRect.height <=
                    parentRect.height - margin,
        );

        const basePlacement = fit ?? placements[0];

        const left = clamp(
            basePlacement.left,
            margin,
            parentRect.width - tooltipRect.width - margin,
        );
        const top = clamp(
            basePlacement.top,
            margin,
            parentRect.height - tooltipRect.height - margin,
        );

        tooltipLayout = { left, top };
    }

    function moveHoveredPoint(event) {
        if (!hoveredPoint) {
            return;
        }

        hoveredPoint = {
            ...hoveredPoint,
            anchorClientX: event.clientX,
            anchorClientY: event.clientY,
        };

        updateTooltipLayout();
    }

    function tooltipStyle(point) {
        if (!hoverEl || !parentEl) {
            return `left: ${point.left}%; top: ${point.top}%; transform: translate(-50%, -110%);`;
        }

        return `left: ${tooltipLayout.left}px; top: ${tooltipLayout.top}px;`;
    }

    function splitTitle(title) {
        if (!title || typeof title !== "string")
            return { label: null, action: title };
        const idx = title.indexOf(":");
        if (idx === -1) return { label: null, action: title };
        return {
            label: title.slice(0, idx).trim(),
            action: title.slice(idx + 1).trim(),
        };
    }
</script>

<Layout isActive="Fuel Prices">
    <div class="flex flex-col gap-8 text-slate-100 font-jetbrainsMono">
        <div
            class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
            <div data-sr class="flex flex-col gap-3">
                <div class="flex flex-wrap items-center gap-3">
                    <h1
                        data-sr
                        data-sr-delay="80"
                        class="text-4xl font-semibold font-jetbrainsMono tracking-tight text-white sm:text-5xl"
                    >
                        Fuel Price
                        <span class="text-orange-400">Trend</span>
                    </h1>
                </div>
            </div>

            <div class="flex flex-wrap gap-3 lg:justify-end">
                {#each dashboard.fuelOptions as option, optionIndex}
                    <button
                        type="button"
                        data-sr
                        data-sr-delay={optionIndex * 80}
                        on:click={() => selectFuel(option.value)}
                        class={`rounded-xl border px-5 py-3 text-sm transition duration-300 ease-out font-jetbrainsMono ${
                            dashboard.selectedFuel === option.value
                                ? "border-white/80 bg-white/35 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.18)]"
                                : "border-white/70 bg-transparent text-slate-100 hover:border-white/90 hover:bg-white/10"
                        }`}
                    >
                        {option.label}
                    </button>
                {/each}
            </div>
        </div>

        <div class="flex flex-col gap-6 xl:flex-row">
            <section
                data-sr
                data-sr-delay="120"
                class="flex flex-1 flex-col rounded-[30px] border border-[#6FB8E7] bg-slate-950/45 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm"
            >
                <div data-sr class="flex flex-wrap gap-2 place-self-end">
                    {#each dashboard.monthTabs as month, monthIndex}
                        <button
                            type="button"
                            data-sr
                            data-sr-delay={monthIndex * 70}
                            on:click={() => selectMonth(month.value)}
                            class={`rounded-xl px-4 py-2 text-sm transition duration-200 ${
                                dashboard.selectedMonth === month.value
                                    ? "bg-blue-700 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                                    : "bg-white/10 text-slate-200 hover:bg-white/20"
                            }`}
                        >
                            {month.label}
                        </button>
                    {/each}
                </div>

                <div
                    data-sr
                    data-sr-delay="180"
                    class="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between place-self-center"
                >
                    <div class="flex flex-wrap items-center gap-3">
                        {#each dashboard.chart.series as series, seriesIndex}
                            <div
                                data-sr
                                data-sr-delay={seriesIndex * 90}
                                class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
                            >
                                {#if series.fuelSlug === "petrol"}
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <rect
                                            y="7"
                                            width="16"
                                            height="2"
                                            fill="#8979FF"
                                        />
                                        <circle
                                            cx="8"
                                            cy="8"
                                            r="3.5"
                                            fill="#1A1F26"
                                            stroke="#8979FF"
                                        />
                                    </svg>
                                {:else if series.fuelSlug === "diesel"}
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <rect
                                            y="7"
                                            width="16"
                                            height="2"
                                            fill="#FF928A"
                                        />
                                        <circle
                                            cx="8"
                                            cy="8"
                                            r="3.5"
                                            fill="#1A1F26"
                                            stroke="#FF928A"
                                        />
                                    </svg>
                                {/if}
                                <span>{series.fuelLabel}</span>
                            </div>
                        {/each}
                    </div>
                </div>

                <div
                    bind:this={parentEl}
                    data-sr
                    data-sr-delay="220"
                    class="relative mt-5 flex min-h-[36rem] flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.14),_transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(15,23,42,0.72))] p-4"
                    role="region"
                    aria-label="Interactive fuel price chart"
                    on:mouseleave={clearHoveredPoint}
                >
                    {#if hoveredPoint}
                        <div
                            bind:this={hoverEl}
                            class={`transition-all duration-300 ease-out pointer-events-none absolute
                                z-30 w-[23rem] max-w-[calc(100%-1rem)] rounded-[18px] border border-white bg-[#2B2B2B]/80
                                 p-3 text-slate-100 shadow-[0_18px_38px_rgba(0,0,0,0.38)] backdrop-blur-sm`}
                            style={tooltipStyle(hoveredPoint)}
                            transition:fade={{ duration: 300 }}
                        >
                            <div class="flex flex-col gap-1">
                                <p
                                    class="text-[1.15rem] font-semibold leading-none text-white"
                                >
                                    {hoveredPoint.title}
                                </p>
                                <p class="text-xs tracking-wide text-slate-400">
                                    {hoveredPoint.subtitle}
                                </p>
                            </div>

                            <div class="mt-3 flex flex-col gap-2">
                                {#each hoveredPoint.entries as entry}
                                    <div
                                        class="flex items-center justify-between gap-3"
                                    >
                                        <div class="flex items-center gap-2.5">
                                            <span
                                                class="h-3 w-3 rounded-full"
                                                style={`background-color: ${entry.color}`}
                                            ></span>
                                            <p
                                                class="text-[0.7rem] text-slate-100"
                                            >
                                                {entry.fuelLabel}:
                                            </p>
                                        </div>
                                        <div
                                            class="flex items-baseline gap-3 text-right"
                                        >
                                            <p
                                                class="text-xs font-semibold text-white"
                                            >
                                                {entry.priceText}
                                            </p>
                                            <p class="text-[0.65rem]">
                                                ({entry.changeLabel})
                                            </p>
                                        </div>
                                    </div>
                                {/each}
                            </div>

                            <div
                                class="my-2.5 border-1 border-t border-white/40"
                            ></div>

                            <div class="flex flex-col gap-2">
                                <p class="text-xs font-semibold text-white">
                                    {hoveredPoint.forecastTitle}
                                </p>
                                <p
                                    class="text-[0.72rem] leading-4 text-slate-200"
                                >
                                    {hoveredPoint.forecastBody}
                                </p>
                            </div>
                        </div>
                    {/if}

                    <div class="flex-1 pt-2">
                        <svg
                            viewBox="0 0 1000 420"
                            class="h-[28rem] w-full overflow-visible"
                            preserveAspectRatio="none"
                        >
                            <defs>
                                <linearGradient
                                    id="gridFade"
                                    x1="0"
                                    x2="0"
                                    y1="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stop-color="rgba(255,255,255,0.08)"
                                    />
                                    <stop
                                        offset="100%"
                                        stop-color="rgba(255,255,255,0.02)"
                                    />
                                </linearGradient>
                            </defs>

                            {#each dashboard.chart.yTicks as tick}
                                <g>
                                    <line
                                        x1="74"
                                        x2="926"
                                        y1={tick.y}
                                        y2={tick.y}
                                        stroke="rgba(148,163,184,0.22)"
                                        stroke-dasharray="4 4"
                                    ></line>
                                    <text
                                        x="50"
                                        y={tick.y + 4}
                                        fill="rgba(226,232,240,0.72)"
                                        font-size="12"
                                        text-anchor="end">{tick.value}</text
                                    >
                                </g>
                            {/each}

                            {#each dashboard.chart.dateAxisRows as axisRow, index}
                                <line
                                    x1={dashboard.chart.dateAxisRows.length ===
                                    1
                                        ? 500
                                        : 74 +
                                          (index * 852) /
                                              (dashboard.chart.dateAxisRows
                                                  .length -
                                                  1)}
                                    x2={dashboard.chart.dateAxisRows.length ===
                                    1
                                        ? 500
                                        : 74 +
                                          (index * 852) /
                                              (dashboard.chart.dateAxisRows
                                                  .length -
                                                  1)}
                                    y1="42"
                                    y2="378"
                                    stroke="rgba(148,163,184,0.12)"
                                    stroke-dasharray="3 6"
                                ></line>
                                <text
                                    x={dashboard.chart.dateAxisRows.length === 1
                                        ? 500
                                        : 74 +
                                          (index * 852) /
                                              (dashboard.chart.dateAxisRows
                                                  .length -
                                                  1)}
                                    y="402"
                                    fill="rgba(226,232,240,0.82)"
                                    font-size="12"
                                    text-anchor="middle"
                                >
                                    {axisRow.dateLabel}
                                </text>
                            {/each}

                            {#each dashboard.chart.series as series}
                                <path
                                    d={series.areaPath}
                                    fill={series.fill}
                                    opacity={dashboard.selectedFuel === "all" ||
                                    dashboard.selectedFuel === series.fuelSlug
                                        ? 1
                                        : 0.55}
                                ></path>
                                <path
                                    d={series.linePath}
                                    fill="none"
                                    stroke={series.stroke}
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    style={`filter: drop-shadow(0 0 6px ${series.stroke})`}
                                    opacity={dashboard.selectedFuel === "all" ||
                                    dashboard.selectedFuel === series.fuelSlug
                                        ? 1
                                        : 0.55}
                                />

                                {#each series.points as point}
                                    <g
                                        tabindex="0"
                                        role="button"
                                        aria-label={`${point.fuelLabel} ${point.fullDateLabel} ${point.priceText}`}
                                        on:mouseenter={(event) => {
                                            setHoveredPoint(
                                                {
                                                    ...point,
                                                    color: series.stroke,
                                                    priceText: point.priceText,
                                                },
                                                event,
                                            );
                                        }}
                                        on:mousemove={moveHoveredPoint}
                                        on:mouseleave={clearHoveredPoint}
                                        on:focus={() =>
                                            setHoveredPoint({
                                                ...point,
                                                color: series.stroke,
                                                priceText: point.priceText,
                                            })}
                                        on:blur={clearHoveredPoint}
                                        class="cursor-pointer"
                                    >
                                        <circle
                                            class="transition-all duration-300"
                                            cx={point.x}
                                            cy={point.y}
                                            r="4"
                                            fill={hoveredPoint &&
                                            hoveredPoint.dateIso ===
                                                point.dateIso &&
                                            hoveredPoint.fuelSlug ===
                                                point.fuelSlug
                                                ? series.stroke
                                                : ""}
                                            stroke={series.stroke}
                                            stroke-width="2"
                                            opacity={hoveredPoint
                                                ? hoveredPoint.dateIso ===
                                                      point.dateIso &&
                                                  hoveredPoint.fuelSlug ===
                                                      point.fuelSlug
                                                    ? 1
                                                    : 0.3
                                                : 1}
                                        ></circle>
                                    </g>
                                {/each}
                            {/each}
                        </svg>
                    </div>
                </div>
            </section>

            <aside class="flex w-full flex-col gap-6 xl:max-w-[22rem]">
                <div
                    data-sr
                    data-sr-delay="140"
                    class="transition-all duration-300 flex flex-col rounded-[28px] border-2 border-white/75 bg-[#152A42]/20 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm"
                >
                    <div
                        class="flex items-center gap-2 border-b border-[white/15] pb-4"
                    >
                        <div class="flex items-center gap-3">
                            <svg
                                width="30"
                                height="30"
                                viewBox="0 0 30 30"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M17.1874 12.5C17.1874 13.0175 17.6074 13.4375 18.1249 13.4375H18.9874L16.4712 15.9537C16.4422 15.9829 16.4077 16.0059 16.3697 16.0217C16.3318 16.0374 16.2911 16.0456 16.2499 16.0456C16.2088 16.0456 16.1681 16.0374 16.1302 16.0217C16.0922 16.0059 16.0577 15.9829 16.0287 15.9537L14.0462 13.9713C13.636 13.5613 13.0798 13.3311 12.4999 13.3311C11.9201 13.3311 11.3639 13.5613 10.9537 13.9713L8.08745 16.8375C7.99534 16.9233 7.92146 17.0268 7.87022 17.1418C7.81898 17.2568 7.79143 17.381 7.78921 17.5068C7.78699 17.6327 7.81014 17.7578 7.85729 17.8745C7.90445 17.9912 7.97463 18.0973 8.06365 18.1863C8.15267 18.2753 8.25872 18.3455 8.37545 18.3927C8.49219 18.4398 8.61722 18.463 8.7431 18.4607C8.86898 18.4585 8.99312 18.431 9.10812 18.3797C9.22312 18.3285 9.32662 18.2546 9.41245 18.1625L12.2787 15.2963C12.3077 15.2671 12.3422 15.2441 12.3802 15.2283C12.4181 15.2126 12.4588 15.2044 12.4999 15.2044C12.5411 15.2044 12.5818 15.2126 12.6197 15.2283C12.6577 15.2441 12.6922 15.2671 12.7212 15.2963L14.7037 17.2787C15.1139 17.6887 15.6701 17.9189 16.2499 17.9189C16.8298 17.9189 17.386 17.6887 17.7962 17.2787L20.3124 14.7637V15.625C20.3124 15.8736 20.4112 16.1121 20.587 16.2879C20.7628 16.4637 21.0013 16.5625 21.2499 16.5625C21.4986 16.5625 21.737 16.4637 21.9129 16.2879C22.0887 16.1121 22.1874 15.8736 22.1874 15.625V12.5C22.1874 12.2514 22.0887 12.0129 21.9129 11.8371C21.737 11.6613 21.4986 11.5625 21.2499 11.5625H18.1249C17.8763 11.5625 17.6379 11.6613 17.462 11.8371C17.2862 12.0129 17.1874 12.2514 17.1874 12.5Z"
                                    fill="#6FB8E7"
                                />
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M14.9288 1.5625C12.0425 1.5625 9.78125 1.5625 8.01625 1.8C6.21125 2.0425 4.78625 2.55 3.6675 3.6675C2.54875 4.78625 2.0425 6.21125 1.8 8.0175C1.5625 9.78125 1.5625 12.0425 1.5625 14.9288V15.0712C1.5625 17.9575 1.5625 20.2188 1.8 21.9837C2.0425 23.7887 2.55 25.2138 3.6675 26.3325C4.78625 27.4513 6.21125 27.9575 8.0175 28.2C9.78125 28.4375 12.0425 28.4375 14.9288 28.4375H15.0712C17.9575 28.4375 20.2188 28.4375 21.9837 28.2C23.7887 27.9575 25.2138 27.45 26.3325 26.3325C27.4513 25.2138 27.9575 23.7887 28.2 21.9825C28.4375 20.2188 28.4375 17.9575 28.4375 15.0712V14.9288C28.4375 12.0425 28.4375 9.78125 28.2 8.01625C27.9575 6.21125 27.45 4.78625 26.3325 3.6675C25.2138 2.54875 23.7887 2.0425 21.9825 1.8C20.2188 1.5625 17.9575 1.5625 15.0712 1.5625H14.9288ZM4.99375 4.99375C5.70625 4.28125 6.66875 3.8725 8.2675 3.6575C9.8925 3.44 12.0275 3.4375 15 3.4375C17.9725 3.4375 20.1075 3.44 21.7325 3.6575C23.3312 3.8725 24.295 4.2825 25.0075 4.99375C25.7188 5.70625 26.1275 6.66875 26.3425 8.2675C26.56 9.8925 26.5625 12.0275 26.5625 15C26.5625 17.9725 26.56 20.1075 26.3425 21.7325C26.1275 23.3312 25.7175 24.295 25.0062 25.0075C24.2937 25.7188 23.3312 26.1275 21.7325 26.3425C20.1075 26.56 17.9725 26.5625 15 26.5625C12.0275 26.5625 9.8925 26.56 8.2675 26.3425C6.66875 26.1275 5.705 25.7175 4.9925 25.0062C4.28125 24.2937 3.8725 23.3312 3.6575 21.7325C3.44 20.1075 3.4375 17.9725 3.4375 15C3.4375 12.0275 3.44 9.8925 3.6575 8.2675C3.8725 6.66875 4.2825 5.70625 4.99375 4.99375Z"
                                    fill="#6FB8E7"
                                />
                            </svg>

                            <p class="text-lg font-semibold text-white">
                                Decision Briefing
                            </p>
                        </div>
                        <p class="text-sm text-slate-400">
                            {`(${dashboard.selectedMonthLabel || "Latest"})`}
                        </p>
                    </div>

                    <div
                        class="mt-4 flex flex-col gap-4 transition-all duration-300"
                    >
                        {#each dashboard.briefings as briefing, briefingIndex}
                            <div
                                data-sr
                                data-sr-delay={briefingIndex * 100}
                                class="rounded-2xl border p-4 bg-[#061E29] transition-all duration-300"
                                style={`border-color: ${briefing.tone === "danger" ? "rgba(255,146,138,1)" : "white"}`}
                            >
                                <p
                                    class={`transition-all duration-300 text-sm font-semibold ${briefing.tone === "danger" ? "text-[#FF928A]" : briefing.label === "Recommended action:" ? "text-[#6FB8E7]" : "text-[#7BE495]"}`}
                                >
                                    {briefing.label}
                                    {briefing.action}
                                </p>

                                <p
                                    class="mt-2 text-sm leading-6 text-slate-200 transition-all duration-300"
                                >
                                    {briefing.body}
                                </p>
                            </div>
                        {/each}
                    </div>
                </div>

                <div
                    data-sr
                    data-sr-delay="220"
                    class="flex flex-col rounded-[28px] border-2 border-white/75 bg-[#152A42]/20 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm"
                >
                    <div
                        class="flex items-center justify-between gap-3 border-b border-[white]/30 pb-4"
                    >
                        <p class="text-lg font-semibold text-white">
                            TODAY'S PRICES
                        </p>
                    </div>

                    <div class="mt-4 flex flex-col gap-4">
                        {#each dashboard.currentPriceCards as card, index}
                            <div
                                data-sr
                                data-sr-delay={index * 100}
                                class={`flex flex-col gap-3 ${index !== dashboard.currentPriceCards.length - 1 ? "border-b border-[white]/30 pb-4" : ""}`}
                            >
                                <div
                                    class="flex items-center justify-between gap-3"
                                >
                                    <div class="flex items-center gap-3">
                                        <span
                                            class="h-2.5 w-2.5 rounded-full"
                                            style={`background-color: ${card.dot}`}
                                        ></span>
                                        <div class="flex flex-col text-nowrap">
                                            <p class="text-sm text-slate-200">
                                                {card.label}
                                            </p>
                                        </div>
                                    </div>

                                    <div class="text-right">
                                        <p
                                            class={`text-3xl leading-none transition-all duration-300 ${card.priceClass}`}
                                        >
                                            {card.price}
                                        </p>
                                        <p
                                            class={`mt-1 text-xs ${card.deltaClass}`}
                                        >
                                            {card.delta}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </aside>
        </div>
    </div>
</Layout>
