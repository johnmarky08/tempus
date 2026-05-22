<script>
    import Layout from "./components/layout.svelte";
    import { buildTrackPriceDashboard } from "../js/trackPrice.js";
    import { onDestroy, tick } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { flip } from "svelte/animate";

    const OPTION_COOLDOWN_MS = 500;
    const PREDICTION_ORDER = {
        petrol: 0,
        diesel: 1,
    };

    let hoverEl;
    let parentEl;
    let tooltipLayout = { left: 0, top: 0 };

    export let fuelPrices = [];
    export let predictions = [];

    let selectedFuel = "all";
    let selectedYear = "";
    let selectedMonth = "";
    let fitScreen = false;
    let hoveredPoint = null;
    let optionCooldownLocked = false;
    let optionCooldownTimer = null;
    let dashboard;
    let briefingWrapper;

    $: dashboard = buildTrackPriceDashboard(
        fuelPrices,
        selectedFuel,
        selectedYear,
        selectedMonth,
    );
    $: predictionCards = buildPredictionCards(predictions, fuelPrices);
    $: predictionPlotPointsByFuel = buildPredictionPlotPoints(
        dashboard,
        predictions,
    );
    $: predictionAxisX = predictionPlotPointsByFuel.size
        ? [...predictionPlotPointsByFuel.values()][0].x
        : null;
    $: graphYearTitle = getGraphYearTitle(
        dashboard?.selectedMonth,
        dashboard?.chart?.dateAxisRows,
    );

    function toTimestamp(value) {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
    }

    function buildPredictionPlotPoints(dashboardData, predictionRows = []) {
        const chart = dashboardData?.chart;
        const latestMonthValue = dashboardData?.latestMonthKey ?? "";

        if (!chart?.series?.length) {
            return new Map();
        }

        if (
            !latestMonthValue ||
            dashboardData?.selectedMonth !== latestMonthValue
        ) {
            return new Map();
        }

        const latestPredictions = new Map();

        predictionRows.forEach((row) => {
            const fuelSlug = normalizeFuelSlug(row.fuel_type);
            const existing = latestPredictions.get(fuelSlug);

            if (
                !existing ||
                toTimestamp(row.date) > toTimestamp(existing.date)
            ) {
                latestPredictions.set(fuelSlug, row);
            }
        });

        const axisMax = Number(chart.axisMax ?? 0) || 1;
        const height = 420;
        const paddingY = 42;
        const innerHeight = height - paddingY * 2;
        const axisCount = chart.dateAxisRows?.length ?? 0;
        const predictedGap =
            axisCount > 1 ? clamp((852 / (axisCount - 1)) * 0.72, 40, 90) : 72;
        const predictionRightBoundary = 960;
        const points = new Map();

        chart.series.forEach((seriesItem) => {
            const prediction = latestPredictions.get(seriesItem.fuelSlug);
            const latestSeriesPoint = seriesItem.points?.at(-1);

            if (!prediction || !latestSeriesPoint) {
                return;
            }

            const predictedPrice = Number(
                prediction.predicted_price ?? prediction.price,
            );

            if (!Number.isFinite(predictedPrice)) {
                return;
            }

            const yRaw =
                paddingY + ((axisMax - predictedPrice) / axisMax) * innerHeight;
            const y = clamp(yRaw, paddingY, height - paddingY);
            const priceText = formatMoney(predictedPrice);
            const predictedChange = predictedPrice - latestSeriesPoint.price;
            const predictedChangeLabel = formatDelta(
                predictedChange,
                "vs latest day",
            );

            points.set(seriesItem.fuelSlug, {
                fuelSlug: seriesItem.fuelSlug,
                fuelLabel: seriesItem.fuelLabel,
                dateIso: `prediction-${seriesItem.fuelSlug}`,
                x: clamp(
                    latestSeriesPoint.x + predictedGap,
                    latestSeriesPoint.x + 16,
                    predictionRightBoundary,
                ),
                y,
                price: predictedPrice,
                priceText,
                title: "Prediction",
                subtitle: "Using ARIMAX Model",
                entries: [
                    {
                        fuelSlug: seriesItem.fuelSlug,
                        fuelLabel: seriesItem.fuelLabel,
                        priceText,
                        changeLabel: predictedChangeLabel,
                        color: "rgba(248,250,252,0.95)",
                        price: predictedPrice,
                    },
                ],
                forecastTitle: "T.E.M.P.U.S. Forecast: Prediction",
                forecastBody:
                    "Estimated using the ARIMAX forecasting model from recent weekly fuel price trends.",
                dotFill: "rgba(248,250,252,0.95)",
                dotStroke: "rgba(255,255,255,0.92)",
                lineColor: "rgba(241,245,249,0.95)",
            });
        });

        return points;
    }

    function getGraphYearTitle(monthKey, axisRows = []) {
        const monthYear = String(monthKey ?? "").slice(0, 4);

        if (/^\d{4}$/.test(monthYear)) {
            return monthYear;
        }

        const fallbackIso = axisRows.at(-1)?.dateIso ?? axisRows[0]?.dateIso;
        const axisYear = String(fallbackIso ?? "").slice(0, 4);

        return /^\d{4}$/.test(axisYear) ? axisYear : "";
    }

    function selectFuel(value) {
        if (optionCooldownLocked || value === selectedFuel) {
            return;
        }

        optionCooldownLocked = true;
        clearTimeout(optionCooldownTimer);
        optionCooldownTimer = setTimeout(() => {
            optionCooldownLocked = false;
        }, OPTION_COOLDOWN_MS);

        selectedFuel = value;
        hoveredPoint = null;
    }

    function selectMonth(value) {
        if (optionCooldownLocked || value === selectedMonth) {
            return;
        }

        optionCooldownLocked = true;
        clearTimeout(optionCooldownTimer);
        optionCooldownTimer = setTimeout(() => {
            optionCooldownLocked = false;
        }, OPTION_COOLDOWN_MS);

        selectedMonth = value;
        hoveredPoint = null;
    }

    function selectYear(value) {
        if (optionCooldownLocked || value === selectedYear) {
            return;
        }

        optionCooldownLocked = true;
        clearTimeout(optionCooldownTimer);
        optionCooldownTimer = setTimeout(() => {
            optionCooldownLocked = false;
        }, OPTION_COOLDOWN_MS);

        selectedYear = value;
        selectedMonth = "";
        hoveredPoint = null;
    }

    function toggleFitScreen() {
        fitScreen = !fitScreen;
    }

    function formatMoney(value) {
        return `₱${Number(value).toFixed(2)}`;
    }

    function formatDelta(value, suffix = "vs current") {
        const prefix = value >= 0 ? "+" : "-";
        return `${prefix}${formatMoney(Math.abs(value)).slice(1)} ${suffix}`;
    }

    function normalizeFuelSlug(value) {
        const slug = String(value ?? "")
            .trim()
            .toLowerCase()
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        if (slug.includes("diesel")) return "diesel";
        if (/petrol|gasoline|ron\s*91/.test(slug)) {
            return "petrol";
        }

        return slug.replace(/[^a-z0-9]+/g, "-");
    }

    function titleCase(value) {
        return String(value ?? "")
            .trim()
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
    }

    function buildPredictionCards(predictionRows = [], sourceRows = []) {
        const latestPredictions = new Map();
        const latestHistoricalRows = new Map();

        sourceRows.forEach((row) => {
            const fuelSlug = normalizeFuelSlug(row.fuel_type);
            const existing = latestHistoricalRows.get(fuelSlug);

            if (!existing || new Date(row.date) > new Date(existing.date)) {
                latestHistoricalRows.set(fuelSlug, row);
            }
        });

        predictionRows.forEach((row) => {
            const fuelSlug = normalizeFuelSlug(row.fuel_type);
            const existing = latestPredictions.get(fuelSlug);

            if (!existing || new Date(row.date) > new Date(existing.date)) {
                latestPredictions.set(fuelSlug, row);
            }
        });

        return [...latestPredictions.values()]
            .sort((left, right) => {
                const leftOrder =
                    PREDICTION_ORDER[normalizeFuelSlug(left.fuel_type)] ?? 9;
                const rightOrder =
                    PREDICTION_ORDER[normalizeFuelSlug(right.fuel_type)] ?? 9;

                return (
                    leftOrder - rightOrder ||
                    titleCase(left.fuel_type).localeCompare(
                        titleCase(right.fuel_type),
                    )
                );
            })
            .map((prediction) => {
                const fuelSlug = normalizeFuelSlug(prediction.fuel_type);
                const baseline = latestHistoricalRows.get(fuelSlug);
                const predictedPrice = Number(prediction.predicted_price ?? 0);
                const change = baseline
                    ? predictedPrice - Number(baseline.price ?? 0)
                    : 0;

                return {
                    label: `${titleCase(prediction.fuel_type)}`,
                    price: formatMoney(predictedPrice),
                    delta: baseline
                        ? formatDelta(change, "vs current")
                        : `95% CI: ${formatMoney(prediction.lower_95)} - ${formatMoney(prediction.upper_95)}`,
                    deltaClass:
                        change >= 0 ? "text-[#FF928A]" : "text-[#7BE495]",
                    priceClass:
                        change >= 0 ? "text-[#FF928A]" : "text-[#7BE495]",
                    dot:
                        fuelSlug === "diesel"
                            ? "#ff8b82"
                            : fuelSlug === "petrol"
                              ? "#8b7cff"
                              : "#7dd3fc",
                };
            });
    }

    async function setHoveredPoint(point, event = null) {
        const hoverGroup = dashboard.chart.hoverGroups.get(point.dateIso) ?? {};

        hoveredPoint = {
            ...hoverGroup,
            ...point,
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

    function getParentScale() {
        if (!parentEl) {
            return { x: 1, y: 1 };
        }

        const rect = parentEl.getBoundingClientRect();
        const width = parentEl.offsetWidth || rect.width || 1;
        const height = parentEl.offsetHeight || rect.height || 1;

        return {
            x: rect.width / width || 1,
            y: rect.height / height || 1,
        };
    }

    function updateTooltipLayout() {
        if (!hoveredPoint || !hoverEl || !parentEl) {
            return;
        }

        const parentRect = parentEl.getBoundingClientRect();
        const tooltipRect = hoverEl.getBoundingClientRect();
        const scale = getParentScale();
        const margin = 12 / scale.x;
        const offset = 14 / scale.x;
        const tooltipWidth = tooltipRect.width / scale.x;
        const tooltipHeight = tooltipRect.height / scale.y;

        const anchorX =
            hoveredPoint.anchorClientX !== null
                ? (hoveredPoint.anchorClientX - parentRect.left) / scale.x
                : (hoveredPoint.x / 1000) * (parentRect.width / scale.x);
        const anchorY =
            hoveredPoint.anchorClientY !== null
                ? (hoveredPoint.anchorClientY - parentRect.top) / scale.y
                : (hoveredPoint.y / 420) * (parentRect.height / scale.y);

        const placements = [
            {
                left: anchorX + offset,
                top: anchorY - tooltipHeight - offset,
            },
            {
                left: anchorX - tooltipWidth - offset,
                top: anchorY - tooltipHeight - offset,
            },
            {
                left: anchorX + offset,
                top: anchorY + offset,
            },
            {
                left: anchorX - tooltipWidth - offset,
                top: anchorY + offset,
            },
        ];

        const fit = placements.find(
            (placement) =>
                placement.left >= margin &&
                placement.top >= margin &&
                placement.left + tooltipWidth <=
                    parentRect.width / scale.x - margin &&
                placement.top + tooltipHeight <=
                    parentRect.height / scale.y - margin,
        );

        const basePlacement = fit ?? placements[0];
        const horizontalBias = 24 / scale.x;

        const left = clamp(
            basePlacement.left + horizontalBias,
            margin,
            parentRect.width / scale.x - tooltipWidth - margin,
        );
        const top = clamp(
            basePlacement.top,
            margin,
            parentRect.height / scale.y - tooltipHeight - margin,
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

    async function syncBriefingWrapperHeight() {
        if (!briefingWrapper) return;
        await tick();

        briefingWrapper.style.overflow = "hidden";
        briefingWrapper.style.transition = "max-height 300ms ease";
        briefingWrapper.style.maxHeight = briefingWrapper.scrollHeight + "px";
    }

    $: if (dashboard) syncBriefingWrapperHeight();

    onDestroy(() => {
        clearTimeout(optionCooldownTimer);
    });
</script>

<Layout isActive="Fuel Prices" class="transition-all duration-300">
    <div
        class={`flex flex-col gap-8 text-slate-100 font-jetbrainsMono transition-all duration-300 ${
            fitScreen
                ? "scale-[1] -translate-y-0 -mb-0"
                : "scale-[0.80] -translate-y-24 -mb-44"
        }`}
    >
        <div
            class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between transition-all duration-300"
        >
            <div
                data-sr
                class="flex flex-col gap-3 transition-all duration-300"
            >
                <div
                    class="flex flex-wrap items-center gap-3 transition-all duration-300"
                >
                    <h1
                        data-sr
                        data-sr-delay="80"
                        data-sr-duration="1600"
                        class="text-4xl font-semibold font-jetbrainsMono tracking-tight text-white sm:text-5xl transition-all duration-300"
                    >
                        Fuel Price
                        <span
                            class="text-orange-400 transition-all duration-300"
                            >Data</span
                        >
                    </h1>
                </div>
            </div>

            <div
                class="flex flex-wrap gap-3 lg:justify-end transition-all duration-300"
            >
                <button
                    type="button"
                    on:click={toggleFitScreen}
                    aria-pressed={fitScreen}
                    class={`group inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-jetbrainsMono transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(111,184,231,0.28)] ${
                        fitScreen
                            ? "border-[#6FB8E7] bg-[#6FB8E7]/20 text-white"
                            : "border-white/70 bg-white/10 text-slate-100 hover:border-white/90 hover:bg-white/15"
                    }`}
                >
                    <span>Fit Screen</span>
                    <i
                        class={`transition-all duration-300 ${
                            fitScreen
                                ? "ri-fullscreen-exit-line rotate-180"
                                : "ri-fullscreen-line rotate-0"
                        }`}
                    ></i>
                </button>

                {#each dashboard.fuelOptions as option, optionIndex}
                    <button
                        type="button"
                        data-sr
                        data-sr-delay={optionIndex * 80}
                        on:click={() => selectFuel(option.value)}
                        disabled={optionCooldownLocked}
                        class={`rounded-xl border px-5 py-3 text-sm transition-all duration-300 ease-out font-jetbrainsMono ${
                            dashboard.selectedFuel === option.value
                                ? "border-white/80 bg-white/35 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.18)]"
                                : "border-white/70 bg-transparent text-slate-100 hover:border-white/90 hover:bg-white/10"
                        }  `}
                    >
                        {option.label}
                    </button>
                {/each}
            </div>
        </div>

        <div
            class="flex flex-col gap-6 xl:flex-row transition-all duration-300"
        >
            <section
                data-sr
                data-sr-delay="120"
                class="flex flex-1 flex-col rounded-[30px] border border-[#6FB8E7] bg-slate-950/45 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-300"
            >
                <div
                    data-sr
                    data-sr-duration="1400"
                    class="flex w-full flex-wrap justify-center gap-2 self-center transition-all duration-300"
                >
                    {#each dashboard.yearTabs as year, yearIndex}
                        <button
                            type="button"
                            data-sr
                            data-sr-delay={yearIndex * 70}
                            on:click={() => selectYear(year.value)}
                            disabled={optionCooldownLocked}
                            class={`min-w-[5.75rem] rounded-xl px-5 py-2.5 text-base font-semibold tracking-wide transition-all duration-300 ${
                                dashboard.selectedYear === year.value
                                    ? "bg-[#6FB8E7] text-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.16)]"
                                    : "bg-white/10 text-slate-200 hover:bg-white/20"
                            }`}
                        >
                            {year.label}
                        </button>
                    {/each}
                </div>

                <div
                    data-sr
                    data-sr-duration="1400"
                    class="mt-3 flex w-full flex-wrap justify-center gap-2 self-center transition-all duration-300"
                >
                    {#each dashboard.monthTabs as month, monthIndex}
                        <button
                            type="button"
                            data-sr
                            data-sr-delay={monthIndex * 70}
                            on:click={() => selectMonth(month.value)}
                            disabled={optionCooldownLocked}
                            class={`rounded-xl px-4 py-2 text-sm transition-all duration-300 ${
                                dashboard.selectedMonth === month.value
                                    ? "bg-blue-700 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                                    : "bg-white/10 text-slate-200 hover:bg-white/20"
                            }  `}
                        >
                            {month.label}
                        </button>
                    {/each}
                </div>

                <div
                    data-sr
                    data-sr-delay="180"
                    class="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between place-self-center transition-all duration-300"
                >
                    <div
                        class="flex flex-wrap items-center gap-3 transition-all duration-300"
                    >
                        {#each dashboard.chart.series as series, seriesIndex (series.fuelSlug)}
                            <div
                                data-sr
                                data-sr-delay={seriesIndex * 90}
                                data-sr-duration="1400"
                                class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition-all duration-300"
                                transition:fade={{ duration: 300 }}
                                animate:flip={{ duration: 450 }}
                            >
                                {#if series.fuelSlug === "petrol"}
                                    <svg
                                        class="transition-all duration-300"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <rect
                                            class="transition-all duration-300"
                                            y="7"
                                            width="16"
                                            height="2"
                                            fill="#8979FF"
                                        />
                                        <circle
                                            class="transition-all duration-300"
                                            cx="8"
                                            cy="8"
                                            r="3.5"
                                            fill="#1A1F26"
                                            stroke="#8979FF"
                                        />
                                    </svg>
                                {:else if series.fuelSlug === "diesel"}
                                    <svg
                                        class="transition-all duration-300"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <rect
                                            class="transition-all duration-300"
                                            y="7"
                                            width="16"
                                            height="2"
                                            fill="#FF928A"
                                        />
                                        <circle
                                            class="transition-all duration-300"
                                            cx="8"
                                            cy="8"
                                            r="3.5"
                                            fill="#1A1F26"
                                            stroke="#FF928A"
                                        />
                                    </svg>
                                {/if}
                                <span
                                    data-sr
                                    data-sr-delay={seriesIndex * 90 + 40}
                                    data-sr-duration="1400"
                                    class="transition-all duration-300"
                                >
                                    {series.fuelLabel}</span
                                >
                            </div>
                        {/each}
                    </div>
                </div>

                <div
                    bind:this={parentEl}
                    data-sr
                    data-sr-delay="220"
                    class="relative mt-5 flex min-h-[32rem] flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.14),_transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(15,23,42,0.72))] p-4 transition-all duration-300"
                    role="region"
                    aria-label="Interactive fuel price chart"
                    on:mouseleave={clearHoveredPoint}
                >
                    {#if hoveredPoint}
                        <div
                            bind:this={hoverEl}
                            class={`${fitScreen ? "scale-[1]" : "scale-[1.13]"}  transition-all duration-300 ease-out pointer-events-none absolute
                                z-30 w-[23rem] max-w-[calc(100%-1rem)] rounded-[18px] border border-white bg-[#2B2B2B]/80
                                 p-3 text-slate-100 shadow-[0_18px_38px_rgba(0,0,0,0.38)] backdrop-blur-sm`}
                            style={tooltipStyle(hoveredPoint)}
                            transition:fade={{ duration: 300 }}
                        >
                            <div
                                class="flex flex-col gap-1 transition-all duration-300"
                            >
                                <p
                                    class="text-[1.15rem] font-semibold leading-none text-white transition-all duration-300"
                                >
                                    {hoveredPoint.title}
                                </p>
                                <p
                                    class="text-xs tracking-wide text-slate-400 transition-all duration-300"
                                >
                                    {hoveredPoint.subtitle}
                                </p>
                            </div>

                            <div
                                class="mt-3 flex flex-col gap-2 transition-all duration-300"
                            >
                                {#each hoveredPoint.entries as entry}
                                    <div
                                        class="flex items-center justify-between gap-3 transition-all duration-300"
                                    >
                                        <div
                                            class="flex items-center gap-2.5 transition-all duration-300"
                                        >
                                            <span
                                                class="h-3 w-3 rounded-full transition-all duration-300"
                                                style={`background-color: ${entry.color}`}
                                            ></span>
                                            <p
                                                class="text-[0.7rem] text-slate-100 transition-all duration-300"
                                            >
                                                {entry.fuelLabel}:
                                            </p>
                                        </div>
                                        <div
                                            class="flex items-baseline gap-3 text-right transition-all duration-300"
                                        >
                                            <p
                                                class="text-xs font-semibold text-white transition-all duration-300"
                                            >
                                                {entry.priceText}
                                            </p>
                                            <p
                                                class="text-[0.65rem] transition-all duration-300"
                                            >
                                                ({entry.changeLabel})
                                            </p>
                                        </div>
                                    </div>
                                {/each}
                            </div>

                            <div
                                class="my-2.5 border-1 border-t border-white/40 transition-all duration-300"
                            ></div>

                            <div
                                class="flex flex-col gap-2 transition-all duration-300"
                            >
                                <p
                                    class="text-xs font-semibold text-white transition-all duration-300"
                                >
                                    {hoveredPoint.forecastTitle}
                                </p>
                                <p
                                    class="text-[0.72rem] leading-4 text-slate-200 transition-all duration-300"
                                >
                                    {hoveredPoint.forecastBody}
                                </p>
                            </div>
                        </div>
                    {/if}

                    {#if graphYearTitle}
                        <div
                            class="pt-1 text-center transition-all duration-300"
                        >
                            <p
                                data-sr
                                data-sr-delay="250"
                                data-sr-duration="1400"
                                class="text-sm font-semibold tracking-[0.28em] text-slate-300/90 transition-all duration-300"
                            >
                                YEAR {graphYearTitle}
                            </p>
                        </div>
                    {/if}

                    <div class="flex-1 pt-2 transition-all duration-300">
                        <svg
                            data-sr
                            data-sr-delay="280"
                            viewBox="0 0 1000 420"
                            class="h-[28rem] w-full overflow-visible transition-all duration-300"
                            preserveAspectRatio="none"
                        >
                            <defs>
                                <linearGradient
                                    class="transition-all duration-300"
                                    id="gridFade"
                                    x1="0"
                                    x2="0"
                                    y1="0"
                                    y2="1"
                                >
                                    <stop
                                        class="transition-all duration-300"
                                        offset="0%"
                                        stop-color="rgba(255,255,255,0.08)"
                                    />
                                    <stop
                                        class="transition-all duration-300"
                                        offset="100%"
                                        stop-color="rgba(255,255,255,0.02)"
                                    />
                                </linearGradient>
                            </defs>

                            {#each dashboard.chart.yTicks as tick}
                                <g data-sr data-sr-delay="320">
                                    <line
                                        class="transition-all duration-300"
                                        x1="74"
                                        x2="926"
                                        y1={tick.y}
                                        y2={tick.y}
                                        stroke="rgba(148,163,184,0.22)"
                                        stroke-dasharray="4 4"
                                    ></line>
                                    <text
                                        class="transition-all duration-300"
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
                                    data-sr
                                    data-sr-delay={340 + index * 40}
                                    class="transition-all duration-300"
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
                                    class="transition-all duration-300"
                                    x={dashboard.chart.dateAxisRows.length === 1
                                        ? 500
                                        : 74 +
                                          (index * 852) /
                                              (dashboard.chart.dateAxisRows
                                                  .length -
                                                  1)}
                                    y="405"
                                    fill="rgba(226,232,240,0.82)"
                                    font-size="10"
                                    text-anchor="middle"
                                    transform={`rotate(-45 ${
                                        dashboard.chart.dateAxisRows.length ===
                                        1
                                            ? 500
                                            : 74 +
                                              (index * 852) /
                                                  (dashboard.chart.dateAxisRows
                                                      .length -
                                                      1)
                                    } 405)`}
                                >
                                    {axisRow.dateLabel}
                                </text>
                            {/each}

                            {#if predictionAxisX !== null}
                                <line
                                    data-sr
                                    data-sr-delay="380"
                                    class="transition-all duration-300"
                                    x1={predictionAxisX}
                                    x2={predictionAxisX}
                                    y1="42"
                                    y2="378"
                                    stroke="rgba(148,163,184,0.12)"
                                    stroke-dasharray="3 6"
                                ></line>
                            {/if}

                            {#each dashboard.chart.series as series, seriesIndex (series.fuelSlug)}
                                <g
                                    data-sr
                                    data-sr-delay={420 + seriesIndex * 90}
                                    transition:fly={{ y: 20, duration: 300 }}
                                >
                                    <path
                                        data-sr
                                        data-sr-delay={440 + seriesIndex * 90}
                                        class="transition-all duration-300"
                                        d={series.areaPath}
                                        fill={series.fill}
                                        pointer-events="none"
                                        opacity={dashboard.selectedFuel ===
                                            "all" ||
                                        dashboard.selectedFuel ===
                                            series.fuelSlug
                                            ? 1
                                            : 0.55}
                                    ></path>
                                    <path
                                        data-sr
                                        data-sr-delay={460 + seriesIndex * 90}
                                        class="transition-all duration-300"
                                        d={series.linePath}
                                        fill="none"
                                        stroke={series.stroke}
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        style={`filter: drop-shadow(0 0 6px ${series.stroke})`}
                                        pointer-events="none"
                                        opacity={dashboard.selectedFuel ===
                                            "all" ||
                                        dashboard.selectedFuel ===
                                            series.fuelSlug
                                            ? 1
                                            : 0.55}
                                    />

                                    {#each series.points as point}
                                        <g
                                            data-sr
                                            data-sr-delay={480 +
                                                seriesIndex * 90}
                                            tabindex="0"
                                            role="button"
                                            aria-label={`${point.fuelLabel} ${point.fullDateLabel} ${point.priceText}`}
                                            class="cursor-pointer transition-all duration-300"
                                        >
                                            <circle
                                                class="outline-none transition-all duration-300"
                                                cx={point.x}
                                                cy={point.y}
                                                r="12"
                                                fill="transparent"
                                                stroke="transparent"
                                                pointer-events="all"
                                                role="button"
                                                tabindex="0"
                                                on:mouseenter={(event) => {
                                                    setHoveredPoint(
                                                        {
                                                            ...point,
                                                            color: series.stroke,
                                                            priceText:
                                                                point.priceText,
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
                                                        priceText:
                                                            point.priceText,
                                                    })}
                                                on:blur={clearHoveredPoint}
                                            ></circle>
                                            <circle
                                                class="transition-all duration-300"
                                                cx={point.x}
                                                cy={point.y}
                                                r="4"
                                                pointer-events="none"
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

                                    {#if predictionPlotPointsByFuel.has(series.fuelSlug)}
                                        {@const predictionPoint =
                                            predictionPlotPointsByFuel.get(
                                                series.fuelSlug,
                                            )}
                                        {@const latestSeriesPoint =
                                            series.points.at(-1)}
                                        {@const latestPointRightEdgeX =
                                            latestSeriesPoint.x + 4}
                                        <line
                                            data-sr
                                            data-sr-delay={480 +
                                                seriesIndex * 90}
                                            class="transition-all duration-300"
                                            x1={latestPointRightEdgeX}
                                            y1={latestSeriesPoint.y}
                                            x2={predictionPoint.x}
                                            y2={predictionPoint.y}
                                            stroke={predictionPoint.lineColor}
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            style="filter: drop-shadow(0 0 5px rgba(241,245,249,0.5));"
                                        ></line>
                                        <g
                                            data-sr
                                            data-sr-delay={520 +
                                                seriesIndex * 90}
                                            tabindex="0"
                                            role="button"
                                            aria-label={`${series.fuelLabel} prediction ${predictionPoint.priceText}`}
                                            class="cursor-pointer transition-all duration-300"
                                        >
                                            <circle
                                                class="outline-none transition-all duration-300"
                                                cx={predictionPoint.x}
                                                cy={predictionPoint.y}
                                                r="12"
                                                fill="transparent"
                                                stroke="transparent"
                                                pointer-events="all"
                                                role="button"
                                                tabindex="0"
                                                on:mouseenter={(event) => {
                                                    setHoveredPoint(
                                                        predictionPoint,
                                                        event,
                                                    );
                                                }}
                                                on:mousemove={moveHoveredPoint}
                                                on:mouseleave={clearHoveredPoint}
                                                on:focus={() =>
                                                    setHoveredPoint(
                                                        predictionPoint,
                                                    )}
                                                on:blur={clearHoveredPoint}
                                            ></circle>
                                            <circle
                                                class="transition-all duration-300"
                                                cx={predictionPoint.x}
                                                cy={predictionPoint.y}
                                                r="4.6"
                                                pointer-events="none"
                                                fill={predictionPoint.dotFill}
                                                stroke={predictionPoint.dotStroke}
                                                stroke-width="2"
                                                style="filter: drop-shadow(0 0 8px rgba(248,250,252,0.85));"
                                            ></circle>
                                        </g>
                                    {/if}
                                </g>
                            {/each}
                        </svg>
                    </div>
                </div>
            </section>

            <aside
                class="flex w-full flex-col gap-6 xl:max-w-[22rem] transition-all duration-300"
            >
                <div
                    bind:this={briefingWrapper}
                    data-sr
                    data-sr-delay="140"
                    class="transition-all duration-300 flex flex-col rounded-[28px] border-2 border-white/75 bg-[#152A42]/20 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm"
                >
                    <div
                        class="flex items-center gap-2 border-b border-[white/15] pb-4 transition-all duration-300"
                    >
                        <div
                            class="flex items-center gap-3 transition-all duration-300"
                        >
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

                            <p
                                data-sr
                                data-sr-delay="20"
                                data-sr-duration="1600"
                                class="text-lg font-semibold text-white transition-all duration-300"
                            >
                                Decision Briefing
                            </p>
                        </div>
                        <p
                            data-sr
                            data-sr-delay="60"
                            data-sr-duration="1600"
                            class="text-sm text-slate-400 transition-all duration-300"
                        >
                            {`(${dashboard.selectedMonthLabel || "Latest"})`}
                        </p>
                    </div>

                    <div
                        class="mt-4 flex flex-col gap-4 transition-all duration-300"
                    >
                        {#each dashboard.briefings as briefing, briefingIndex (briefing.id)}
                            <div
                                data-sr
                                data-sr-delay={briefingIndex * 100}
                                data-sr-duration="1600"
                                class="rounded-2xl border p-4 bg-[#061E29] transition-all duration-300 overflow-hidden"
                                style={`border-color: ${briefing.tone === "danger" ? "rgba(255,146,138,1)" : "white"}`}
                                transition:fly={{ y: 20, duration: 500 }}
                                animate:flip={{ duration: 300 }}
                            >
                                <p
                                    data-sr
                                    data-sr-delay={briefingIndex * 100 + 40}
                                    data-sr-duration="1600"
                                    class={`transition-all duration-300 text-sm font-semibold ${briefing.tone === "danger" ? "text-[#FF928A]" : briefing.label === "Recommended Action:" ? "text-[#6FB8E7]" : "text-[#7BE495]"}`}
                                >
                                    {briefing.label}
                                    {briefing.action}
                                </p>

                                <p
                                    data-sr
                                    data-sr-delay={briefingIndex * 100 + 80}
                                    data-sr-duration="1600"
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
                    class="prediction-highlight flex flex-col rounded-[28px] border-2 border-white/75 bg-[#152A42]/20 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm transition-all duration-300"
                >
                    <div
                        class="flex w-full items-center justify-center gap-3 border-b border-[white]/30 pb-4 transition-all duration-300"
                    >
                        <p
                            data-sr
                            data-sr-duration="1600"
                            class="text-md w-full text-center font-semibold uppercase text-white transition-all duration-300"
                        >
                            NEXT WEEK'S PRICES (FORECASTS)
                        </p>
                    </div>

                    <div
                        class="mt-4 flex flex-col gap-4 transition-all duration-300"
                    >
                        {#if predictionCards.length}
                            {#each predictionCards as card, index}
                                <div
                                    data-sr
                                    data-sr-delay={index * 100}
                                    data-sr-duration="1600"
                                    class={`flex flex-col gap-3 transition-all duration-300 ${index !== predictionCards.length - 1 ? "border-b border-[white]/30 pb-4" : ""}`}
                                    transition:fly={{ y: 20, duration: 500 }}
                                >
                                    <div
                                        class="flex flex-col items-center justify-between gap-3 transition-all duration-300"
                                    >
                                        <div
                                            class="flex items-center gap-3 transition-all duration-300"
                                        >
                                            <span
                                                class="h-2.5 w-2.5 rounded-full transition-all duration-300"
                                                style={`background-color: ${card.dot}`}
                                            ></span>
                                            <div
                                                class="flex flex-col text-nowrap transition-all duration-300"
                                            >
                                                <p
                                                    data-sr
                                                    data-sr-delay={index * 100 +
                                                        20}
                                                    data-sr-duration="1600"
                                                    class="text-sm text-slate-200 transition-all duration-300"
                                                >
                                                    {card.label}
                                                </p>
                                            </div>
                                        </div>

                                        <div
                                            class="text-center transition-all duration-300"
                                        >
                                            <p
                                                data-sr
                                                data-sr-delay={index * 200 + 40}
                                                data-sr-duration="1600"
                                                class={`text-3xl leading-none transition-all duration-300 ${card.priceClass}`}
                                            >
                                                {card.price}
                                            </p>
                                            <p
                                                data-sr
                                                data-sr-delay={index * 200 + 40}
                                                data-sr-duration="1600"
                                                class={`mt-1 text-xs transition-all duration-300 ${card.deltaClass}`}
                                            >
                                                {card.delta}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        {:else}
                            <p class="text-sm text-slate-400">
                                No predictions available yet. Refresh the
                                forecast to load the exported ARIMAX weekly
                                results.
                            </p>
                        {/if}
                    </div>
                </div>
            </aside>
        </div>
    </div>
</Layout>
