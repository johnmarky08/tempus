<script>
    import { fade, fly } from "svelte/transition";
    import Layout from "./components/layout.svelte";
    import {
        AGE_GROUPS,
        DEFAULT_INTRADAY_LABELS,
        HEAT_INDEX_STATE_META,
        buildChartModel,
        formatTemperature,
        formatWindSpeed,
        getIntensityMeta,
        getSafetyMeta,
        resolveSafetyState,
        SAFETY_HIGHLIGHTS,
        clamp,
    } from "../js/heatIndexData.js";

    export let heatIndexData = null;

    const csrfToken =
        typeof document === "undefined"
            ? ""
            : (document.querySelector('meta[name="csrf-token"]')?.content ??
              "");

    let selectedAgeRange = heatIndexData?.ageRange ?? "0-3";
    let exertionLevel = heatIndexData?.exertionLevel ?? 0;
    let isAssessing = !(heatIndexData?.assess ?? false);
    let isSubmitting = false;
    let hoveredPointIndex = null;

    const ageRiskMap = AGE_GROUPS.reduce((accumulator, group) => {
        accumulator[group.value] = group.risk;
        return accumulator;
    }, {});

    function selectAgeRange(ageRange) {
        selectedAgeRange = ageRange;
    }

    function handleExertionChange(event) {
        exertionLevel = Number(event.currentTarget.value);
    }

    async function handleAssessSubmit(event) {
        event.preventDefault();

        isSubmitting = true;

        try {
            const form = event.currentTarget;
            const response = await fetch(form.action, {
                method: form.method,
                body: new FormData(form),
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
            });

            if (!response.ok) {
                throw new Error(
                    `Assess request failed with ${response.status}`,
                );
            }

            const payload = await response.json();

            heatIndexData = {
                ...heatIndexData,
                safetyPrediction: payload.safetyPrediction,
                safetyMeta: payload.safetyMeta,
                safetyHighlights: payload.safetyHighlights,
                ageRange: payload.ageRange,
                exertionLevel: payload.exertionLevel,
                assess: payload.assess,
            };
            selectedAgeRange = payload.ageRange;
            exertionLevel = payload.exertionLevel;
            isAssessing = false;
        } finally {
            isSubmitting = false;
        }
    }

    function hexToRgb(hex) {
        const clean = hex.replace("#", "");
        const bigint = parseInt(clean, 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }

    function rgbToHex(r, g, b) {
        return (
            "#" +
            [r, g, b]
                .map((n) => {
                    const s = Math.round(n).toString(16);
                    return s.length === 1 ? "0" + s : s;
                })
                .join("")
        );
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function interpColor(aHex, bHex, t) {
        const a = hexToRgb(aHex);
        const b = hexToRgb(bHex);
        return rgbToHex(
            lerp(a[0], b[0], t),
            lerp(a[1], b[1], t),
            lerp(a[2], b[2], t),
        );
    }

    function getExertionColor(level) {
        const stops = [
            { t: 0, c: "#33FF2F" },
            { t: 5, c: "#FF7B00" },
            { t: 10, c: "#FF2B2B" },
        ];

        if (level <= stops[1].t) {
            const span = stops[1].t - stops[0].t;
            const rel = (level - stops[0].t) / Math.max(span, 0.0001);
            return interpColor(stops[0].c, stops[1].c, rel);
        }

        if (level <= stops[2].t) {
            const span = stops[2].t - stops[1].t;
            const rel = (level - stops[1].t) / Math.max(span, 0.0001);
            return interpColor(stops[1].c, stops[2].c, rel);
        }

        return stops[2].c;
    }

    $: exertionPercent = clamp(exertionLevel * 9.5, 0, 100);
    $: exertionFillColor = getExertionColor(exertionLevel);
    $: exertionShadowColor = `${exertionFillColor}66`;
    $: selectedPreset = heatIndexData?.selectedPreset ?? {
        graphLabels: DEFAULT_INTRADAY_LABELS,
        graphValues: [],
        forecast: [],
    };
    $: displayPreset = {
        ...selectedPreset,
        graphLabels: selectedPreset.graphLabels ?? DEFAULT_INTRADAY_LABELS,
        graphValues: selectedPreset.graphValues ?? [],
        forecastLabels:
            selectedPreset.forecastLabels ??
            selectedPreset.graphLabels ??
            DEFAULT_INTRADAY_LABELS,
        forecastValues:
            selectedPreset.forecastValues ?? selectedPreset.forecast ?? [],
        forecast:
            selectedPreset.forecast ?? selectedPreset.forecastValues ?? [],
    };

    $: intradayLabels =
        heatIndexData?.selectedPreset?.graphLabels ??
        (displayPreset.graphValues.length === DEFAULT_INTRADAY_LABELS.length
            ? DEFAULT_INTRADAY_LABELS
            : displayPreset.graphLabels);

    $: chartModel = buildChartModel(displayPreset.graphValues, intradayLabels);
    $: heatTone = getIntensityMeta(displayPreset.heatIndexStateKey);
    $: heatCard =
        HEAT_INDEX_STATE_META[displayPreset.heatIndexStateKey] ??
        HEAT_INDEX_STATE_META.safe;
    $: safetyStateKey =
        heatIndexData?.safetyPrediction?.label ??
        (isAssessing
            ? "assessing"
            : resolveSafetyState(
                  displayPreset.heatIndexValue,
                  ageRiskMap[selectedAgeRange] ?? 0.15,
                  exertionLevel,
              ));
    $: safetyMeta =
        isAssessing && !heatIndexData?.assess
            ? getSafetyMeta("assessing")
            : (heatIndexData?.safetyMeta ?? getSafetyMeta(safetyStateKey));
    $: selectedHighlights =
        isAssessing && !heatIndexData?.assess
            ? SAFETY_HIGHLIGHTS.safe
            : (heatIndexData?.safetyHighlights ??
              SAFETY_HIGHLIGHTS[safetyStateKey] ??
              SAFETY_HIGHLIGHTS.safe);
</script>

<Layout isActive="Heat Index">
    <div
        class="smooth-scroll flex flex-col space-y-36 -mt-8 text-slate-100 font-jetbrainsMono scale-[0.95]"
    >
        <section class="flex flex-col space-y-16 -mb-12">
            <div
                data-sr
                class=" mx-28 flex flex-col space-y-10 bg-[#152A42]/50 border border-white rounded-[24px] p-8 justify-center items-center"
            >
                <p
                    data-sr
                    class="text-2xl font-semibold text-white sm:text-4xl"
                >
                    Heat Index Assessment
                </p>

                <form
                    class="flex flex-col gap-5 xl:flex-row"
                    method="POST"
                    action="/heat-index"
                    on:submit={handleAssessSubmit}
                >
                    <input type="hidden" name="_token" value={csrfToken} />
                    <div class="space-y-5">
                        <div
                            data-sr
                            class="flex flex-wrap flex-col gap-4 rounded-[22px] border
                            border-white bg-[#152A42] p-4 sm:p-5 max-w-lg
                     transition-all duration-300 ease-out hover:shadow-[0px_0px_10px_rgba(56,189,248,2)]"
                        >
                            <div
                                data-sr
                                class="flex items-center justify-between"
                            >
                                <p
                                    class="text-base tracking-[0.2em] text-slate-300"
                                >
                                    AGE GROUP
                                </p>
                                <p
                                    class="text-xs uppercase tracking-[0.28em] text-slate-500"
                                >
                                    Single select
                                </p>
                            </div>

                            <div data-sr class="flex flex-wrap gap-3">
                                {#each AGE_GROUPS as ageGroup (ageGroup.value)}
                                    <button
                                        type="button"
                                        on:click={() =>
                                            selectAgeRange(ageGroup.value)}
                                        class={`hover:scale-[1.15] flex min-w-[5.75rem] flex-1 items-center justify-center 
                                        rounded-lg border px-4 py-3 text-sm transition duration-300
                                         ${selectedAgeRange === ageGroup.value ? "border-sky-300 bg-sky-400/15 text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.16)]" : "border-sky-900/60 bg-[#061E29] text-slate-300 hover:border-sky-400/40 hover:bg-sky-900/40"}`}
                                    >
                                        {ageGroup.label}
                                    </button>
                                {/each}
                            </div>

                            <input
                                type="hidden"
                                name="age_range"
                                value={selectedAgeRange}
                            />
                        </div>
                        <div
                            data-sr
                            class="transition-all duration-300 ease-out hover:shadow-[0_0_20px_var(--exertion-shadow)] flex flex-col gap-3 rounded-[20px] border border-white bg-[#152A42] p-5"
                            style={`--exertion-shadow: ${exertionShadowColor};`}
                        >
                            <div
                                data-sr
                                class="flex items-center justify-between"
                            >
                                <p
                                    class="text-base tracking-[0.2em] text-slate-300"
                                >
                                    EXERTION LEVEL
                                </p>
                                <p class="text-sm text-amber-200">
                                    {exertionLevel}/10
                                </p>
                            </div>

                            <div data-sr class="relative w-full">
                                <div
                                    class="relative h-4 rounded-full bg-[#061E29] border border-white/8 overflow-hidden"
                                >
                                    <div
                                        class="absolute left-0 top-0 h-4 rounded-full"
                                        style="width: 100%; background: {exertionFillColor}; transition: background .25s ease;"
                                    ></div>

                                    <div
                                        class="absolute top-1/2 transform -translate-y-1/2"
                                        style="left: calc({exertionPercent}% - 8px); transition: left .18s ease;"
                                    >
                                        <div
                                            class="h-8 w-8 rounded-full bg-[#0b4a7a] border-2 border-white flex items-center justify-center shadow-lg"
                                        >
                                            <div
                                                class="h-3 w-3 rounded-full bg-white/90"
                                            ></div>
                                        </div>
                                    </div>

                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        step="1"
                                        bind:value={exertionLevel}
                                        on:input={handleExertionChange}
                                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <input
                                        type="hidden"
                                        name="exertion_level"
                                        value={exertionLevel}
                                    />
                                </div>

                                <div
                                    class="flex justify-between text-xs text-slate-400 mt-3 w-full tracking-widest px-1"
                                >
                                    {#each Array.from({ length: 11 }, (_, index) => index) as tick}
                                        <span class="text-center text-base"
                                            >{tick}</span
                                        >
                                    {/each}
                                </div>
                            </div>
                        </div>

                        <input type="hidden" name="assess" value="1" />

                        <div
                            class="mt-1 flex items-center justify-center gap-3"
                        >
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                class="rounded-xl w-40 border border-sky-300/40 bg-sky-400/15 px-5 py-3 text-sm font-semibold text-sky-100 transition duration-300 hover:scale-[1.02] hover:bg-sky-400/25 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isAssessing ? "Assess" : "Re-Assess"}
                            </button>

                            {#if isSubmitting}
                                <div
                                    class="flex items-center gap-2 text-sm text-sky-100"
                                >
                                    <span
                                        class="h-4 w-4 animate-spin rounded-full border-2 border-sky-200/30 border-t-sky-100"
                                    ></span>
                                    <span>Processing...</span>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div
                        data-sr
                        class={`hover:shadow-[0_0_10px_${safetyMeta.accent}] transition-all duration-300 ease-out
                         flex w-full place-items-center flex-col gap-4 rounded-[22px] border border-white bg-[#152A42]
                        p-4 sm:p-5 max-w-sm`}
                    >
                        <div data-sr class="flex items-center justify-between">
                            <div class="flex flex-col gap-1">
                                <p
                                    data-sr
                                    class="
                                group-hover:scale-105 group-hover:translate-x-2
                         transition-all duration-300 ease-out
                                text-2xl font-semibold text-white"
                                >
                                    Today's Safety Label
                                </p>
                            </div>
                        </div>

                        <div
                            data-sr
                            class="flex items-center place-items-center"
                        >
                            <div
                                class={`flex items-center  rounded-[15px]
                                 border px-4 py-3 w-full ${safetyMeta.border} ${safetyMeta.bg} 
                        hover:shadow-[0_0_10px_${safetyMeta.accent}] transition-all duration-300 ease-out`}
                            >
                                {#if safetyMeta.icon === "check"}
                                    <svg
                                        class="animate-[pulse_8s_ease-in-out_infinite] transition-all duration-300"
                                        width="65"
                                        height="65"
                                        viewBox="0 0 65 65"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M32.5 4.0625L8.125 12.1875V36.5625C8.125 50.0259 19.0366 60.9375 32.5 60.9375C45.9634 60.9375 56.875 50.0259 56.875 36.5625V12.1875L32.5 4.0625ZM52.3047 36.5625C52.3047 47.4995 43.437 56.3672 32.5 56.3672C21.563 56.3672 12.6953 47.4995 12.6953 36.5625V15.6152L32.5 8.63281L52.3047 15.6152V36.5625Z"
                                            fill="#33FF2F"
                                        />
                                        <path
                                            d="M24.0195 30.1576C23.8077 29.9448 23.556 29.776 23.2787 29.6608C23.0015 29.5456 22.7043 29.4863 22.404 29.4863C22.1038 29.4863 21.8066 29.5456 21.5293 29.6608C21.2521 29.776 21.0004 29.9448 20.7886 30.1576C20.5758 30.3694 20.407 30.6211 20.2918 30.8984C20.1766 31.1756 20.1172 31.4729 20.1172 31.7731C20.1172 32.0733 20.1766 32.3705 20.2918 32.6478C20.407 32.925 20.5758 33.1768 20.7886 33.3886L29.0024 41.6024L29.1357 41.7357C29.3361 41.9364 29.574 42.0957 29.836 42.2043C30.0979 42.313 30.3787 42.3689 30.6623 42.3689C30.9459 42.3689 31.2267 42.313 31.4887 42.2043C31.7506 42.0957 31.9886 41.9364 32.1889 41.7357L46.376 27.5487C46.5767 27.3484 46.7359 27.1104 46.8446 26.8485C46.9532 26.5865 47.0091 26.3057 47.0091 26.0221C47.0091 25.7385 46.9532 25.4577 46.8446 25.1957C46.7359 24.9338 46.5767 24.6958 46.376 24.4955L46.1982 24.3178C45.9979 24.117 45.7599 23.9578 45.498 23.8491C45.236 23.7405 44.9552 23.6846 44.6716 23.6846C44.388 23.6846 44.1072 23.7405 43.8453 23.8491C43.5833 23.9578 43.3453 24.117 43.145 24.3178L30.6592 36.7972L24.0195 30.1576Z"
                                            fill="#33FF2F"
                                        />
                                    </svg>
                                {:else if safetyMeta.icon === "shield"}
                                    <svg
                                        class="animate-[pulse_5s_ease-in-out_infinite] transition-all duration-300"
                                        width="65"
                                        height="65"
                                        viewBox="0 0 65 65"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M42.0821 42.0819C44.7218 39.4404 46.0416 36.2464 46.0416 32.4998C46.0416 28.7533 44.7209 25.5602 42.0794 22.9205C39.4378 20.2807 36.2447 18.96 32.5 18.9582C28.7553 18.9564 25.5621 20.2771 22.9206 22.9205C20.2791 25.5638 18.9583 28.7569 18.9583 32.4998C18.9583 36.2428 20.2791 39.4368 22.9206 42.0819C25.5621 44.7271 28.7553 46.0469 32.5 46.0415C36.2447 46.0361 39.4387 44.7153 42.0821 42.0792M33.8541 31.9582L37.9166 36.0207C38.1875 36.2915 38.3229 36.6075 38.3229 36.9686C38.3229 37.3297 38.1875 37.6457 37.9166 37.9165C37.6458 38.1873 37.3298 38.3228 36.9687 38.3228C36.6076 38.3228 36.2916 38.1873 36.0208 37.9165L31.9583 33.854C31.6875 33.5832 31.4844 33.2789 31.3489 32.9413C31.2135 32.6037 31.1458 32.2534 31.1458 31.8905V25.729C31.1458 25.3679 31.2812 25.0519 31.5521 24.7811C31.8229 24.5103 32.1389 24.3748 32.5 24.3748C32.8611 24.3748 33.1771 24.5103 33.4479 24.7811C33.7187 25.0519 33.8541 25.3679 33.8541 25.729V31.9582ZM31.6198 59.2446C31.3489 59.1995 31.0781 59.1318 30.8073 59.0415C24.7135 57.0103 19.8611 53.252 16.25 47.7667C12.6389 42.2814 10.8333 36.38 10.8333 30.0623V17.2655C10.8333 16.137 11.161 15.1214 11.8164 14.2186C12.4719 13.3158 13.3178 12.6613 14.3541 12.255L30.6041 6.1613C31.2361 5.9356 31.868 5.82275 32.5 5.82275C33.1319 5.82275 33.7639 5.9356 34.3958 6.1613L50.6458 12.255C51.684 12.6613 52.5308 13.3158 53.1862 14.2186C53.8417 15.1214 54.1685 16.137 54.1666 17.2655V30.0623C54.1666 36.3818 52.3611 42.2841 48.75 47.7694C45.1389 53.2547 40.2864 57.0121 34.1927 59.0415C33.9219 59.1318 33.651 59.1995 33.3802 59.2446C33.1094 59.2898 32.816 59.3123 32.5 59.3123C32.184 59.3123 31.8906 59.2898 31.6198 59.2446Z"
                                            fill="#009BFF"
                                        />
                                    </svg>
                                {:else if safetyMeta.icon === "warning"}
                                    <svg
                                        class="animate-[pulse_3s_ease-in-out_infinite] transition-all duration-300"
                                        width="65"
                                        height="65"
                                        viewBox="0 0 65 65"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M22.3438 56.875L8.125 42.6562V22.3438L22.3438 8.125H42.6562L56.875 22.3438V42.6562L42.6562 56.875H22.3438ZM24.7812 44.0104L32.5 36.2917L40.2188 44.0104L44.0104 40.2188L36.2917 32.5L44.0104 24.7812L40.2188 20.9896L32.5 28.7083L24.7812 20.9896L20.9896 24.7812L28.7083 32.5L20.9896 40.2188L24.7812 44.0104ZM24.6458 51.4583H40.3542L51.4583 40.3542V24.6458L40.3542 13.5417H24.6458L13.5417 24.6458V40.3542L24.6458 51.4583Z"
                                            fill="#FF7B00"
                                        />
                                    </svg>
                                {:else}
                                    <svg
                                        class="transition-all duration-300 animate-[pulse_1s_ease-in-out_infinite]"
                                        width="65"
                                        height="65"
                                        viewBox="0 0 65 65"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M14.3867 29.1471C22.2896 15.1315 26.241 8.125 32.5 8.125C38.759 8.125 42.7104 15.1315 50.6133 29.1471L51.5992 30.8912C58.1669 42.5371 61.4521 48.36 58.4837 52.6175C55.5154 56.875 48.1704 56.875 33.4858 56.875H31.5142C16.8296 56.875 9.48458 56.875 6.51625 52.6175C3.54792 48.36 6.83313 42.5371 13.4008 30.8912L14.3867 29.1471Z"
                                            stroke="#FF0000"
                                            stroke-width="1.5"
                                        />
                                        <path
                                            d="M32.5 21.6665V35.2082"
                                            stroke="#FF0000"
                                            stroke-width="1.5"
                                            stroke-linecap="round"
                                        />
                                        <path
                                            d="M32.4997 41.125C33.7192 41.125 34.7085 42.1135 34.7087 43.333C34.7087 44.5526 33.7193 45.542 32.4997 45.542C31.2802 45.5418 30.2917 44.5525 30.2917 43.333C30.2919 42.1136 31.2803 41.1252 32.4997 41.125Z"
                                            fill="#FF0000"
                                            stroke="#FF0000"
                                        />
                                    </svg>
                                {/if}

                                <div
                                    class="flex flex-col text-center place-self-center"
                                >
                                    <p class={`text-lg text-white `}>
                                        {isAssessing && !heatIndexData?.assess
                                            ? "No Assessment Yet"
                                            : safetyMeta.title}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            data-sr
                            class="flex flex-col text-sm leading-6 px-5
                        transition-all duration-300 ease-out group-hover:scale-105 group-hover:translate-y-3 group-hover:translate-x-3"
                        >
                            <div class="flex gap-20 justify-between">
                                <p class="min-w-[4.75rem] text-slate-400">
                                    Alert: <span class="text-slate-200">
                                        {isAssessing && !heatIndexData?.assess
                                            ? "Waiting for your inputs."
                                            : selectedHighlights.alert}
                                    </span>
                                </p>
                            </div>
                            <div class="flex gap-2 justify-between">
                                <p class="min-w-[4.75rem] text-slate-400">
                                    Recommendation: <span
                                        class="text-slate-200"
                                    >
                                        {isAssessing && !heatIndexData?.assess
                                            ? "Choose an age group and exertion level, then press Assess."
                                            : selectedHighlights.recommendation}
                                    </span>
                                </p>
                            </div>
                            <div class="flex gap-2 justify-between">
                                <span class="min-w-[4.75rem] text-slate-400"
                                    >Travel: <span class="text-slate-200">
                                        {isAssessing && !heatIndexData?.assess
                                            ? "Assessment will appear after you submit the inputs."
                                            : selectedHighlights.travel}
                                    </span></span
                                >
                            </div>
                            <div class="flex gap-2 justify-between">
                                <p class="min-w-[4.75rem] text-slate-400">
                                    Health Tip: <span class="text-slate-200">
                                        {isAssessing && !heatIndexData?.assess
                                            ? "Use the inputs above to calculate the current safety label."
                                            : selectedHighlights.tip}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div class="space-y-10">
                <h1
                    data-sr
                    class=" px-28 text-xl text-start font-semibold text-white sm:text-4xl"
                >
                    7-Hour Heat Index Predictions
                </h1>
                <div class="flex flex-col space-y-10 scale-[0.95]">
                    <div
                        class="flex gap-3 overflow-visible pb-1 justify-center"
                    >
                        {#each selectedPreset.forecast as forecastTemp, index (index)}
                            <div
                                data-sr
                                data-sr-delay={index * 120}
                                class="group
                                hover:scale-110 hover:shadow-[0_0px_10px_#FF7B00]
                                 transition-all duration-500 ease-out
                                flex place-items-center flex-col space-y-5 rounded-[18px] border border-white/80 bg-[#152A42]
                             px-9 py-9 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                                transition:fade
                            >
                                <div class=" flex flex-col gap-1">
                                    <p
                                        data-sr
                                        class="group-hover:scale-[1.18] transition-all duration-500 ease-out text-xl text-slate-200"
                                    >
                                        {selectedPreset.forecastLabels[index] ??
                                            selectedPreset.graphLabels[index] ??
                                            `Hour ${index + 1}`}
                                    </p>
                                    <svg
                                        class="group-hover:drop-shadow-[0_0_8px_#FFA629] animate-[spin_10s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite] transition-all duration-300"
                                        width="60"
                                        height="60"
                                        viewBox="0 0 70 70"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M35 4.375C35.5802 4.375 36.1366 4.60547 36.5468 5.0157C36.957 5.42594 37.1875 5.98234 37.1875 6.5625V10.9375C37.1875 11.5177 36.957 12.0741 36.5468 12.4843C36.1366 12.8945 35.5802 13.125 35 13.125C34.4198 13.125 33.8634 12.8945 33.4532 12.4843C33.043 12.0741 32.8125 11.5177 32.8125 10.9375V6.5625C32.8125 5.98234 33.043 5.42594 33.4532 5.0157C33.8634 4.60547 34.4198 4.375 35 4.375ZM50.3125 35C50.3125 39.0611 48.6992 42.9559 45.8276 45.8276C42.9559 48.6992 39.0611 50.3125 35 50.3125C30.9389 50.3125 27.0441 48.6992 24.1724 45.8276C21.3008 42.9559 19.6875 39.0611 19.6875 35C19.6875 30.9389 21.3008 27.0441 24.1724 24.1724C27.0441 21.3008 30.9389 19.6875 35 19.6875C39.0611 19.6875 42.9559 21.3008 45.8276 24.1724C48.6992 27.0441 50.3125 30.9389 50.3125 35ZM63.4375 37.1875C64.0177 37.1875 64.5741 36.957 64.9843 36.5468C65.3945 36.1366 65.625 35.5802 65.625 35C65.625 34.4198 65.3945 33.8634 64.9843 33.4532C64.5741 33.043 64.0177 32.8125 63.4375 32.8125H59.0625C58.4823 32.8125 57.9259 33.043 57.5157 33.4532C57.1055 33.8634 56.875 34.4198 56.875 35C56.875 35.5802 57.1055 36.1366 57.5157 36.5468C57.9259 36.957 58.4823 37.1875 59.0625 37.1875H63.4375ZM35 56.875C35.5802 56.875 36.1366 57.1055 36.5468 57.5157C36.957 57.9259 37.1875 58.4823 37.1875 59.0625V63.4375C37.1875 64.0177 36.957 64.5741 36.5468 64.9843C36.1366 65.3945 35.5802 65.625 35 65.625C34.4198 65.625 33.8634 65.3945 33.4532 64.9843C33.043 64.5741 32.8125 64.0177 32.8125 63.4375V59.0625C32.8125 58.4823 33.043 57.9259 33.4532 57.5157C33.8634 57.1055 34.4198 56.875 35 56.875ZM10.9375 37.1875C11.5177 37.1875 12.0741 36.957 12.4843 36.5468C12.8945 36.1366 13.125 35.5802 13.125 35C13.125 34.4198 12.8945 33.8634 12.4843 33.4532C12.0741 33.043 11.5177 32.8125 10.9375 32.8125H6.5625C5.98234 32.8125 5.42594 33.043 5.0157 33.4532C4.60547 33.8634 4.375 34.4198 4.375 35C4.375 35.5802 4.60547 36.1366 5.0157 36.5468C5.42594 36.957 5.98234 37.1875 6.5625 37.1875H10.9375ZM11.5806 11.5806C11.9908 11.1705 12.5471 10.9402 13.1272 10.9402C13.7072 10.9402 14.2635 11.1705 14.6737 11.5806L19.0487 15.9556C19.2577 16.1574 19.4243 16.3988 19.539 16.6657C19.6536 16.9326 19.714 17.2196 19.7165 17.5101C19.719 17.8005 19.6637 18.0886 19.5537 18.3574C19.4437 18.6262 19.2813 18.8705 19.0759 19.0759C18.8705 19.2813 18.6262 19.4437 18.3574 19.5537C18.0886 19.6637 17.8005 19.719 17.5101 19.7165C17.2196 19.714 16.9326 19.6536 16.6657 19.539C16.3988 19.4243 16.1574 19.2577 15.9556 19.0487L11.5806 14.6737C11.1705 14.2635 10.9402 13.7072 10.9402 13.1272C10.9402 12.5471 11.1705 11.9908 11.5806 11.5806ZM14.6737 58.4238C14.2612 58.8222 13.7086 59.0427 13.1351 59.0377C12.5615 59.0327 12.0129 58.8027 11.6073 58.3971C11.2017 57.9915 10.9716 57.4429 10.9667 56.8693C10.9617 56.2958 11.1822 55.7432 11.5806 55.3306L15.9556 50.9556C16.1574 50.7467 16.3988 50.58 16.6657 50.4654C16.9326 50.3508 17.2196 50.2904 17.5101 50.2879C17.8005 50.2854 18.0886 50.3407 18.3574 50.4507C18.6262 50.5607 18.8705 50.7231 19.0759 50.9285C19.2813 51.1339 19.4437 51.3781 19.5537 51.647C19.6637 51.9158 19.719 52.2039 19.7165 52.4943C19.714 52.7848 19.6536 53.0718 19.539 53.3387C19.4243 53.6056 19.2577 53.847 19.0487 54.0488L14.6737 58.4238ZM58.4238 11.5806C58.0135 11.1705 57.4572 10.9402 56.8772 10.9402C56.2971 10.9402 55.7408 11.1705 55.3306 11.5806L50.9556 15.9556C50.5572 16.3682 50.3367 16.9208 50.3417 17.4943C50.3466 18.0679 50.5767 18.6165 50.9823 19.0221C51.3879 19.4277 51.9365 19.6577 52.5101 19.6627C53.0836 19.6677 53.6362 19.4472 54.0488 19.0487L58.4238 14.6737C58.8338 14.2635 59.0642 13.7072 59.0642 13.1272C59.0642 12.5471 58.8338 11.9908 58.4238 11.5806ZM55.3306 58.4238C55.7432 58.8222 56.2958 59.0427 56.8693 59.0377C57.4429 59.0327 57.9915 58.8027 58.3971 58.3971C58.8027 57.9915 59.0327 57.4429 59.0377 56.8693C59.0427 56.2958 58.8222 55.7432 58.4238 55.3306L54.0488 50.9556C53.847 50.7467 53.6056 50.58 53.3387 50.4654C53.0718 50.3508 52.7848 50.2904 52.4943 50.2879C52.2039 50.2854 51.9158 50.3407 51.647 50.4507C51.3781 50.5607 51.1339 50.7231 50.9285 50.9285C50.7231 51.1339 50.5607 51.3781 50.4507 51.647C50.3407 51.9158 50.2854 52.2039 50.2879 52.4943C50.2904 52.7848 50.3508 53.0718 50.4654 53.3387C50.58 53.6056 50.7467 53.847 50.9556 54.0488L55.3306 58.4238Z"
                                            fill="#FFA629"
                                        />
                                    </svg>
                                </div>
                                <p
                                    data-sr
                                    class="text-xl text-[#FF7B00] group-hover:[text-shadow:0_0_10px_#FF7B00] transition-all duration-300"
                                >
                                    {forecastTemp}°C
                                </p>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </section>

        <section
            class="flex flex-col gap-6 xl:flex-row justify-center scale-[1.10]"
        >
            <div class="flex flex-col gap-6">
                <div
                    data-sr
                    class={`group hover:scale-105 hover:-translate-y-2 hover:-translate-x-5
                     transition-all duration-300 hover:shadow-[0_0px_10px_#ffffff] ease-out
                    flex flex-col space-y-8 rounded-[20px] border border-white
                    bg-[#152A42]/50 shadow-[0_0px_0_rgba(0,0,0,0.25)] backdrop-blur-sm sm:p-7 sm:py-12 `}
                >
                    <div
                        data-sr
                        class="transition-all duration-300 ease-out
                    flex flex-col gap-1"
                    >
                        <p
                            class="text-2xl font-semibold text-white sm:text-[2rem]"
                        >
                            {selectedPreset.location}
                        </p>
                        <p class="text-sm text-slate-300 sm:text-base">
                            {selectedPreset.condition}
                        </p>
                    </div>

                    <div class=" gap-4 lg:flex-row space-y-10">
                        <div class="flex items-center gap-4">
                            <p
                                data-sr
                                class=" 
                                 transition-all duration-300 ease-out
                                text-[2rem] font-semibold leading-none text-amber-300 sm:text-[3rem]"
                            >
                                {formatTemperature(selectedPreset.temperature)}
                            </p>

                            <div
                                data-sr
                                class={`transition-all duration-300 ease-out 
                                flex h-full flex-col justify-end gap-3 rounded-[15px] border
                                ${heatCard.border}  ${heatCard.bg} px-4 py-5 shadow-[0_0_30px_rgba(245,158,11,0.16)]`}
                            >
                                <div class="flex items-center gap-3">
                                    <div class="flex flex-col gap-1">
                                        <p class="text-xl text-white font-bold">
                                            Heat Index Level
                                        </p>
                                        <div class="flex items-center gap-5">
                                            <span
                                                class="text-lg font-semibold {heatCard.text}"
                                                >{heatTone.label}</span
                                            >
                                            <span
                                                class="rounded-[8px] {heatCard.bg} px-10 py-1 text-xs
                                                 font-semibold text-white border border-white"
                                                >{heatTone.title}</span
                                            >
                                        </div>
                                    </div>
                                    <div
                                        class={`flex h-10 w-10 items-center justify-center`}
                                    >
                                        {#if heatCard.key === "safe"}
                                            <svg
                                                class="transition-all duration-300"
                                                width="65"
                                                height="65"
                                                viewBox="0 0 65 65"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M32.5 4.0625L8.125 12.1875V36.5625C8.125 50.0259 19.0366 60.9375 32.5 60.9375C45.9634 60.9375 56.875 50.0259 56.875 36.5625V12.1875L32.5 4.0625ZM52.3047 36.5625C52.3047 47.4995 43.437 56.3672 32.5 56.3672C21.563 56.3672 12.6953 47.4995 12.6953 36.5625V15.6152L32.5 8.63281L52.3047 15.6152V36.5625Z"
                                                    fill="#33FF2F"
                                                />
                                                <path
                                                    d="M24.0195 30.1576C23.8077 29.9448 23.556 29.776 23.2787 29.6608C23.0015 29.5456 22.7043 29.4863 22.404 29.4863C22.1038 29.4863 21.8066 29.5456 21.5293 29.6608C21.2521 29.776 21.0004 29.9448 20.7886 30.1576C20.5758 30.3694 20.407 30.6211 20.2918 30.8984C20.1766 31.1756 20.1172 31.4729 20.1172 31.7731C20.1172 32.0733 20.1766 32.3705 20.2918 32.6478C20.407 32.925 20.5758 33.1768 20.7886 33.3886L29.0024 41.6024L29.1357 41.7357C29.3361 41.9364 29.574 42.0957 29.836 42.2043C30.0979 42.313 30.3787 42.3689 30.6623 42.3689C30.9459 42.3689 31.2267 42.313 31.4887 42.2043C31.7506 42.0957 31.9886 41.9364 32.1889 41.7357L46.376 27.5487C46.5767 27.3484 46.7359 27.1104 46.8446 26.8485C46.9532 26.5865 47.0091 26.3057 47.0091 26.0221C47.0091 25.7385 46.9532 25.4577 46.8446 25.1957C46.7359 24.9338 46.5767 24.6958 46.376 24.4955L46.1982 24.3178C45.9979 24.117 45.7599 23.9578 45.498 23.8491C45.236 23.7405 44.9552 23.6846 44.6716 23.6846C44.388 23.6846 44.1072 23.7405 43.8453 23.8491C43.5833 23.9578 43.3453 24.117 43.145 24.3178L30.6592 36.7972L24.0195 30.1576Z"
                                                    fill="#33FF2F"
                                                />
                                            </svg>
                                        {:else if heatCard.key === "moderate"}
                                            <svg
                                                class="animate-[pulse_8s_ease-in-out_infinite] transition-all duration-300"
                                                width="65"
                                                height="65"
                                                viewBox="0 0 65 65"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M42.0821 42.0819C44.7218 39.4404 46.0416 36.2464 46.0416 32.4998C46.0416 28.7533 44.7209 25.5602 42.0794 22.9205C39.4378 20.2807 36.2447 18.96 32.5 18.9582C28.7553 18.9564 25.5621 20.2771 22.9206 22.9205C20.2791 25.5638 18.9583 28.7569 18.9583 32.4998C18.9583 36.2428 20.2791 39.4368 22.9206 42.0819C25.5621 44.7271 28.7553 46.0469 32.5 46.0415C36.2447 46.0361 39.4387 44.7153 42.0821 42.0792M33.8541 31.9582L37.9166 36.0207C38.1875 36.2915 38.3229 36.6075 38.3229 36.9686C38.3229 37.3297 38.1875 37.6457 37.9166 37.9165C37.6458 38.1873 37.3298 38.3228 36.9687 38.3228C36.6076 38.3228 36.2916 38.1873 36.0208 37.9165L31.9583 33.854C31.6875 33.5832 31.4844 33.2789 31.3489 32.9413C31.2135 32.6037 31.1458 32.2534 31.1458 31.8905V25.729C31.1458 25.3679 31.2812 25.0519 31.5521 24.7811C31.8229 24.5103 32.1389 24.3748 32.5 24.3748C32.8611 24.3748 33.1771 24.5103 33.4479 24.7811C33.7187 25.0519 33.8541 25.3679 33.8541 25.729V31.9582ZM31.6198 59.2446C31.3489 59.1995 31.0781 59.1318 30.8073 59.0415C24.7135 57.0103 19.8611 53.252 16.25 47.7667C12.6389 42.2814 10.8333 36.38 10.8333 30.0623V17.2655C10.8333 16.137 11.161 15.1214 11.8164 14.2186C12.4719 13.3158 13.3178 12.6613 14.3541 12.255L30.6041 6.1613C31.2361 5.9356 31.868 5.82275 32.5 5.82275C33.1319 5.82275 33.7639 5.9356 34.3958 6.1613L50.6458 12.255C51.684 12.6613 52.5308 13.3158 53.1862 14.2186C53.8417 15.1214 54.1685 16.137 54.1666 17.2655V30.0623C54.1666 36.3818 52.3611 42.2841 48.75 47.7694C45.1389 53.2547 40.2864 57.0121 34.1927 59.0415C33.9219 59.1318 33.651 59.1995 33.3802 59.2446C33.1094 59.2898 32.816 59.3123 32.5 59.3123C32.184 59.3123 31.8906 59.2898 31.6198 59.2446Z"
                                                    fill="#009BFF"
                                                />
                                            </svg>
                                        {:else if heatCard.key === "high"}
                                            <svg
                                                class="animate-[pulse_3s_ease-in-out_infinite] transition-all duration-300"
                                                width="65"
                                                height="65"
                                                viewBox="0 0 65 65"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M22.3438 56.875L8.125 42.6562V22.3438L22.3438 8.125H42.6562L56.875 22.3438V42.6562L42.6562 56.875H22.3438ZM24.7812 44.0104L32.5 36.2917L40.2188 44.0104L44.0104 40.2188L36.2917 32.5L44.0104 24.7812L40.2188 20.9896L32.5 28.7083L24.7812 20.9896L20.9896 24.7812L28.7083 32.5L20.9896 40.2188L24.7812 44.0104ZM24.6458 51.4583H40.3542L51.4583 40.3542V24.6458L40.3542 13.5417H24.6458L13.5417 24.6458V40.3542L24.6458 51.4583Z"
                                                    fill="#FF7B00"
                                                />
                                            </svg>
                                        {:else}
                                            <svg
                                                class="animate-[pulse_1s_ease-in-out_infinite] transition-all duration-300"
                                                width="65"
                                                height="65"
                                                viewBox="0 0 65 65"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M14.3867 29.1471C22.2896 15.1315 26.241 8.125 32.5 8.125C38.759 8.125 42.7104 15.1315 50.6133 29.1471L51.5992 30.8912C58.1669 42.5371 61.4521 48.36 58.4837 52.6175C55.5154 56.875 48.1704 56.875 33.4858 56.875H31.5142C16.8296 56.875 9.48458 56.875 6.51625 52.6175C3.54792 48.36 6.83313 42.5371 13.4008 30.8912L14.3867 29.1471Z"
                                                    stroke="#FF0000"
                                                    stroke-width="1.5"
                                                />
                                                <path
                                                    d="M32.5 21.6665V35.2082"
                                                    stroke="#FF0000"
                                                    stroke-width="1.5"
                                                    stroke-linecap="round"
                                                />
                                                <path
                                                    d="M32.4997 41.125C33.7192 41.125 34.7085 42.1135 34.7087 43.333C34.7087 44.5526 33.7193 45.542 32.4997 45.542C31.2802 45.5418 30.2917 44.5525 30.2917 43.333C30.2919 42.1136 31.2803 41.1252 32.4997 41.125Z"
                                                    fill="#FF0000"
                                                    stroke="#FF0000"
                                                />
                                            </svg>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            class="transition-all duration-300 ease-out flex flex-col gap-3 lg:max-w-[18rem] place-self-center"
                        >
                            <div
                                class="flex items-center justify-between border-b border-t
                                 border-white/50 pb-2 text-sm text-slate-300"
                            >
                                <p class="items-center">Humidity</p>
                                <p class="items-center">
                                    {selectedPreset.humidity}°C
                                </p>
                            </div>

                            <div
                                class="space-x-40 flex items-center border-b border-white/50 justify-between text-sm text-slate-300"
                            >
                                <p class="items-center">Wind</p>
                                <p class="items-center">
                                    {formatWindSpeed(selectedPreset.windSpeed)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                data-sr
                class="flex w-full flex-col gap-4 xl:max-w-[27rem] transition-all duration-300"
            >
                <div class="flex flex-col transition-all duration-300">
                    <div
                        data-sr
                        class="hover:scale-105 hover:-translate-y-3 hover:translate-x-3 hover:shadow-[0_0_10px_#fb923c] transition-all duration-300 ease-in-out relative rounded-[24px] border border-white bg-[#152A42]/50 p-3"
                    >
                        <svg
                            data-sr
                            viewBox="0 0 300 150"
                            class="  h-44 w-full overflow-visible transition-all duration-300"
                            preserveAspectRatio="none"
                        >
                            <defs>
                                <filter
                                    id="graphGlow"
                                    x="-50%"
                                    y="-50%"
                                    width="200%"
                                    height="200%"
                                >
                                    <feGaussianBlur
                                        stdDeviation="6"
                                        result="coloredBlur"
                                    />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <g
                                data-sr
                                transition:fly={{ y: 8, duration: 400 }}
                                class=""
                            >
                                <path
                                    data-sr
                                    class="transition-all duration-300 ease-in-out"
                                    d={chartModel.areaPath}
                                    fill="rgba(249,115,22,0.18)"
                                    stroke="none"
                                ></path>
                                <path
                                    data-sr
                                    class="transition-all duration-300"
                                    d={chartModel.linePath}
                                    fill="none"
                                    stroke="#fb923c"
                                    stroke-width="2.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    filter="url(#graphGlow)"
                                ></path>

                                {#each chartModel.points as point, index (index)}
                                    <g
                                        data-sr
                                        data-sr-delay={index * 80}
                                        tabindex="0"
                                        role="button"
                                        aria-label={`${point.label} ${point.value} degrees`}
                                        class="cursor-pointer transition-all duration-300 ease-in-out"
                                        opacity={hoveredPointIndex !== null &&
                                        hoveredPointIndex !== index
                                            ? 0.25
                                            : 1}
                                        on:mouseenter={() =>
                                            (hoveredPointIndex = index)}
                                        on:mouseleave={() =>
                                            (hoveredPointIndex = null)}
                                        on:focus={() =>
                                            (hoveredPointIndex = index)}
                                        on:blur={() =>
                                            (hoveredPointIndex = null)}
                                        transition:fade
                                    >
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r={hoveredPointIndex === index
                                                ? 10
                                                : 8}
                                            fill="rgba(21,42,66,0.5)"
                                            stroke="none"
                                            class="transition-all duration-200 ease-in-out"
                                        ></circle>

                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r={hoveredPointIndex === index
                                                ? 10
                                                : 8}
                                            fill="none"
                                            stroke="#fb923c"
                                            stroke-width={hoveredPointIndex ===
                                            index
                                                ? 2
                                                : 0.9}
                                            class="transition-all duration-500 ease-in-out"
                                        ></circle>

                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r={hoveredPointIndex === index
                                                ? "5"
                                                : "3.5"}
                                            fill="#fb923c"
                                            stroke="none"
                                            class="transition-all duration-500 ease-in-out"
                                        ></circle>

                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r={hoveredPointIndex === index
                                                ? 14
                                                : 12}
                                            fill="rgba(251,146,60,0.15)"
                                            opacity={hoveredPointIndex === index
                                                ? "1"
                                                : "0.55"}
                                            class="transition-all duration-500 ease-in-out"
                                            filter="url(#graphGlow)"
                                        ></circle>
                                    </g>
                                {/each}
                            </g>

                            {#each chartModel.points as point, index (index)}
                                {#if hoveredPointIndex === index}
                                    <text
                                        data-sr
                                        in:fly={{ y: 8, duration: 300 }}
                                        out:fade={{ duration: 400 }}
                                        x={point.x}
                                        y={point.y - 16}
                                        fill="rgba(251,146,60,0.98)"
                                        font-size="9"
                                        font-weight="700"
                                        text-anchor="middle"
                                        style="pointer-events: none"
                                        class="transition-all duration-300 ease-in-out"
                                        >{point.value}°C</text
                                    >
                                {/if}
                            {/each}

                            {#each chartModel.points as point, index (index)}
                                <text
                                    data-sr
                                    data-sr-delay={index * 50}
                                    class="transition-all duration-300 ease-in-out"
                                    x={point.x}
                                    y="142"
                                    fill="rgba(226,232,240,0.72)"
                                    font-size="10"
                                    text-anchor="middle">{point.label}</text
                                >
                            {/each}
                        </svg>
                    </div>
                </div>
                <div
                    data-sr
                    class="group hover:scale-105 hover:translate-y-3 hover:translate-x-3
                    hover:shadow-[0_0_10px_#6FB8E7] transition-all duration-300 flex flex-col gap-3 rounded-[20px] border border-white bg-[#152A42]/50 p-4"
                >
                    <div
                        data-sr
                        class="flex items-center gap-3 border-b border-[#888888] pb-2"
                    >
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 0 50 50"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M20.8334 18.75C20.8334 18.1975 21.0529 17.6676 21.4436 17.2769C21.8343 16.8862 22.3642 16.6667 22.9167 16.6667C23.4693 16.6667 23.9992 16.8862 24.3899 17.2769C24.7806 17.6676 25.0001 18.1975 25.0001 18.75V28.0625L27.5209 28.3333L37.8126 32.8958C38.9167 33.3958 39.5834 34.5 39.5834 35.7083V44.7917C39.5209 46.5 38.1667 47.8542 36.4584 47.9167H22.9167C22.1251 47.9167 21.3751 47.6042 20.8334 47.0208L10.6251 38.2708L12.1667 36.6667C12.5626 36.2292 13.1251 36 13.7084 36H14.1667L20.8334 39.5833V18.75ZM22.9167 10.4167C25.1269 10.4167 27.2465 11.2946 28.8093 12.8574C30.3721 14.4202 31.2501 16.5399 31.2501 18.75C31.2501 21.875 29.5834 24.5208 27.0834 25.9583V23.4167C28.3542 22.2708 29.1667 20.6042 29.1667 18.75C29.1667 17.0924 28.5083 15.5027 27.3362 14.3306C26.1641 13.1585 24.5744 12.5 22.9167 12.5C21.2591 12.5 19.6694 13.1585 18.4973 14.3306C17.3252 15.5027 16.6667 17.0924 16.6667 18.75C16.6667 20.6042 17.4792 22.2708 18.7501 23.4167V25.9583C16.2501 24.5208 14.5834 21.875 14.5834 18.75C14.5834 16.5399 15.4614 14.4202 17.0242 12.8574C18.587 11.2946 20.7066 10.4167 22.9167 10.4167ZM22.9167 6.25C26.232 6.25 29.4114 7.56696 31.7556 9.91117C34.0998 12.2554 35.4167 15.4348 35.4167 18.75C35.4167 22.2917 33.9376 25.4792 31.5834 27.7708L29.5001 26.8333C30.6971 25.8534 31.6618 24.62 32.3247 23.2222C32.9876 21.8244 33.3321 20.297 33.3334 18.75C33.3334 15.9873 32.2359 13.3378 30.2824 11.3843C28.3289 9.4308 25.6794 8.33333 22.9167 8.33333C20.1541 8.33333 17.5046 9.4308 15.5511 11.3843C13.5975 13.3378 12.5001 15.9873 12.5001 18.75C12.5001 23.0208 15.0626 26.6875 18.7501 28.2917V30.5417C13.8959 28.8125 10.4167 24.1875 10.4167 18.75C10.4167 15.4348 11.7337 12.2554 14.0779 9.91117C16.4221 7.56696 19.6015 6.25 22.9167 6.25Z"
                                fill="#6FB8E7"
                            />
                        </svg>

                        <div
                            class="transition-all duration-300 ease-out group-hover:scale-105 group-hover:translate-x-2 flex flex-col"
                        >
                            <p class="text-xl font-semibold text-white">
                                Recommended Actions
                            </p>
                        </div>
                    </div>

                    <p data-sr class="text-sm leading-6 text-slate-200">
                        {selectedPreset.recommendation}
                    </p>
                </div>
            </div>
        </section>
    </div>
</Layout>
