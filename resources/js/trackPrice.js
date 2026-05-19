function buildFallbackRows() {
    const monthlySets = [
        {
            dates: [
                "2026-01-01",
                "2026-01-02",
                "2026-01-03",
                "2026-01-04",
                "2026-01-05",
                "2026-01-06",
                "2026-01-07",
            ],
            petrol: [71.2, 69.8, 68.6, 67.4, 69.1, 70.0, 71.4],
            diesel: [120.4, 117.8, 114.9, 113.6, 116.2, 118.8, 120.0],
        },
        {
            dates: [
                "2026-02-01",
                "2026-02-02",
                "2026-02-03",
                "2026-02-04",
                "2026-02-05",
                "2026-02-06",
                "2026-02-07",
            ],
            petrol: [72.8, 71.1, 69.4, 68.2, 69.8, 71.3, 72.1],
            diesel: [118.5, 115.7, 112.4, 110.8, 112.6, 115.0, 116.8],
        },
        {
            dates: [
                "2026-03-01",
                "2026-03-02",
                "2026-03-03",
                "2026-03-04",
                "2026-03-05",
                "2026-03-06",
                "2026-03-07",
            ],
            petrol: [73.9, 72.6, 70.4, 69.2, 71.0, 73.3, 74.4],
            diesel: [121.6, 118.2, 112.1, 111.4, 115.7, 123.1, 126.5],
        },
        {
            dates: [
                "2026-04-01",
                "2026-04-02",
                "2026-04-03",
                "2026-04-04",
                "2026-04-05",
                "2026-04-06",
                "2026-04-07",
            ],
            petrol: [70.8, 66.2, 58.4, 64.2, 74.5, 60.8, 54.3],
            diesel: [120.2, 109.6, 87.9, 89.4, 132.0, 86.2, 94.5],
        },
    ];

    const rows = [];

    monthlySets.forEach((monthSet, monthIndex) => {
        monthSet.dates.forEach((date, index) => {
            rows.push({
                date,
                price: monthSet.petrol[index],
                fuel_type: "Premium Petrol",
                exchange_rate_to_usd: 57.0 + monthIndex * 0.2,
                normal_supply_flag: index % 3 !== 2,
            });

            rows.push({
                date,
                price: monthSet.diesel[index],
                fuel_type: "Premium Diesel",
                exchange_rate_to_usd: 57.0 + monthIndex * 0.2,
                normal_supply_flag: index % 4 !== 3,
            });
        });
    });

    return rows;
}

const FALLBACK_ROWS = buildFallbackRows();

const PALETTE = {
    petrol: {
        line: "#8b7cff",
        fill: "rgba(139,124,255,0.18)",
        dot: "#8b7cff",
        glow: "rgba(139,124,255,0.45)",
    },
    diesel: {
        line: "#ff8b82",
        fill: "rgba(255,139,130,0.18)",
        dot: "#ff8b82",
        glow: "rgba(255,139,130,0.45)",
    },
    default: {
        line: "#7dd3fc",
        fill: "rgba(125,211,252,0.18)",
        dot: "#7dd3fc",
        glow: "rgba(125,211,252,0.45)",
    },
};

function parseDate(value) {
    if (value instanceof Date) {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    const stringValue = String(value ?? "").trim();
    const dateParts = stringValue.slice(0, 10).split("-");

    if (
        dateParts.length === 3 &&
        dateParts.every((part) => /^\d+$/.test(part))
    ) {
        return new Date(
            Number(dateParts[0]),
            Number(dateParts[1]) - 1,
            Number(dateParts[2]),
        );
    }

    const parsed = new Date(stringValue);
    return Number.isNaN(parsed.getTime())
        ? new Date()
        : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function pad(value) {
    return String(value).padStart(2, "0");
}

function slugify(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeFuelSlug(value) {
    const slug = slugify(value);

    if (slug.includes("diesel")) return "diesel";
    if (slug.includes("petrol")) return "petrol";

    return slug.replace(/[^a-z0-9]+/g, "-");
}

function titleCase(value) {
    return slugify(value)
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function formatMoney(value) {
    return `₱${Number(value).toFixed(2)}`;
}

function formatDelta(value, suffix = "vs previous entry") {
    const prefix = value >= 0 ? "+" : "-";
    return `${prefix}${formatMoney(Math.abs(value)).slice(1)} ${suffix}`;
}

function formatLongDate(date) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    }).format(date);
}

function formatHoverTitle(date) {
    const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
        date,
    );
    const day = new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(
        date,
    );
    const weekday = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
    }).format(date);

    return `${month} ${day} (${weekday})`;
}

function formatMonthLabel(date) {
    return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
}

function formatAxisLabel(date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
    }).format(date);
}

function formatDayLabel(date) {
    return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
}

function getMonthKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function resolvePalette(fuelSlug) {
    return PALETTE[fuelSlug] ?? PALETTE.default;
}

function resolveAxisScale(maxPrice) {
    if (maxPrice <= 100) {
        return { axisMax: 100, axisStep: 20 };
    }

    if (maxPrice <= 200) {
        return { axisMax: 200, axisStep: 40 };
    }

    if (maxPrice <= 500) {
        return { axisMax: 500, axisStep: 100 };
    }

    const axisMax = Math.ceil(maxPrice / 100) * 100;
    return { axisMax, axisStep: axisMax / 5 };
}

function enrichRows(rows) {
    return rows
        .map((row, index) => {
            const date = parseDate(row.date);
            const fuelLabel = titleCase(row.fuel_type || "Fuel");
            const fuelSlug = normalizeFuelSlug(row.fuel_type || fuelLabel);

            return {
                ...row,
                index,
                date,
                dateIso: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
                    date.getDate(),
                )}`,
                monthKey: getMonthKey(date),
                monthLabel: formatMonthLabel(date),
                dateLabel: formatAxisLabel(date),
                fullDateLabel: formatLongDate(date),
                dayLabel: formatDayLabel(date),
                fuelLabel,
                fuelSlug,
                price: Number(row.price ?? 0),
                exchange_rate_to_usd: Number(row.exchange_rate_to_usd ?? 0),
                normal_supply_flag: Boolean(row.normal_supply_flag),
            };
        })
        .sort(
            (a, b) => a.date - b.date || a.fuelLabel.localeCompare(b.fuelLabel),
        );
}

function buildMonthTabs(rows) {
    const months = new Map();

    rows.forEach((row) => {
        if (!months.has(row.monthKey)) {
            months.set(row.monthKey, {
                value: row.monthKey,
                label: row.monthLabel,
                sortValue: row.date.getTime(),
            });
        }
    });

    return [...months.values()].sort((a, b) => b.sortValue - a.sortValue);
}

function buildFuelOptions(rows) {
    const fuels = new Map();

    rows.forEach((row) => {
        if (!fuels.has(row.fuelSlug)) {
            fuels.set(row.fuelSlug, {
                value: row.fuelSlug,
                label: row.fuelLabel,
                sortValue: row.fuelLabel,
            });
        }
    });

    return [
        { value: "all", label: "All Types", sortValue: "0" },
        ...[...fuels.values()].sort((a, b) =>
            a.sortValue.localeCompare(b.sortValue),
        ),
    ];
}

function buildCurrentPriceCards(rows) {
    const latestRows = new Map();

    rows.forEach((row) => {
        const existing = latestRows.get(row.fuelSlug);

        if (!existing || row.date > existing.date) {
            latestRows.set(row.fuelSlug, row);
        }
    });

    const order = { petrol: 0, diesel: 1 };

    return [...latestRows.values()]
        .sort((a, b) => {
            const left = order[a.fuelSlug] ?? 9;
            const right = order[b.fuelSlug] ?? 9;

            return left - right || a.fuelLabel.localeCompare(b.fuelLabel);
        })
        .map((latest) => {
            const history = rows
                .filter((row) => row.fuelSlug === latest.fuelSlug)
                .sort((a, b) => a.date - b.date);
            const previous = history.at(-2) ?? null;
            const change = previous ? latest.price - previous.price : 0;
            const palette = resolvePalette(latest.fuelSlug);

            return {
                label: latest.fuelLabel,
                price: formatMoney(latest.price),
                delta: formatDelta(change, "vs last week"),
                deltaClass: change >= 0 ? "text-[#FF928A]" : "text-[#7BE495]",
                priceClass: change >= 0 ? "text-[#FF928A]" : "text-[#7BE495]",
                dot: palette.dot,
                accent: palette.line,
                note: previous
                    ? `${previous.dateLabel} baseline`
                    : "Latest available entry",
            };
        });
}

function buildSeries(rows, selectedFuel, selectedMonth) {
    const scopedRows = rows.filter((row) => {
        const fuelMatches =
            selectedFuel === "all" || row.fuelSlug === selectedFuel;
        const monthMatches = !selectedMonth || row.monthKey === selectedMonth;

        return fuelMatches && monthMatches;
    });

    const fallbackRows = scopedRows.length ? scopedRows : rows;
    const dateAxisRows = [
        ...new Map(fallbackRows.map((row) => [row.dateIso, row])).values(),
    ].sort((a, b) => a.date - b.date);

    const xIndex = new Map(
        dateAxisRows.map((row, index) => [row.dateIso, index]),
    );
    const grouped = new Map();

    fallbackRows.forEach((row) => {
        if (selectedFuel !== "all" && row.fuelSlug !== selectedFuel) {
            return;
        }

        if (!grouped.has(row.fuelSlug)) {
            grouped.set(row.fuelSlug, []);
        }

        grouped.get(row.fuelSlug).push(row);
    });

    const prices = fallbackRows.map((row) => row.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const { axisMax, axisStep } = resolveAxisScale(maxPrice);
    const scaleMax = axisMax || 1;

    const width = 1000;
    const height = 420;
    const paddingX = 74;
    const paddingY = 42;
    const innerWidth = width - paddingX * 2;
    const innerHeight = height - paddingY * 2;

    const series = [...grouped.entries()].map(([fuelSlug, fuelRows]) => {
        const palette = resolvePalette(fuelSlug);
        const sortedRows = [...fuelRows].sort((a, b) => a.date - b.date);
        const peakPrice = Math.max(...sortedRows.map((row) => row.price));

        const points = sortedRows.map((row, index) => {
            const axisIndex = xIndex.get(row.dateIso) ?? index;
            const x =
                dateAxisRows.length === 1
                    ? width / 2
                    : paddingX +
                      (axisIndex * innerWidth) / (dateAxisRows.length - 1);
            const y =
                paddingY + ((scaleMax - row.price) / scaleMax) * innerHeight;
            const previous = sortedRows[index - 1] ?? null;
            const change = previous ? row.price - previous.price : 0;

            return {
                ...row,
                x,
                y,
                change,
                changeLabel: formatDelta(change, "vs last week"),
                priceText: formatMoney(row.price),
                tooltipTitle: row.fullDateLabel,
                tooltipBody: `${row.fuelLabel} reached ${formatMoney(row.price)}`,
                isPeakPoint: row.price === peakPrice,
            };
        });

        const linePath = points
            .map(
                (point, index) =>
                    `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
            )
            .join(" ");
        const areaPath = points.length
            ? `${linePath} L ${points.at(-1).x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
            : "";

        const trend = sortedRows.length
            ? sortedRows.at(-1).price - sortedRows[0].price
            : 0;

        return {
            fuelSlug,
            fuelLabel: sortedRows[0]?.fuelLabel ?? titleCase(fuelSlug),
            linePath,
            areaPath,
            stroke: palette.line,
            fill: palette.fill,
            glow: palette.glow,
            points,
            latest: points.at(-1) ?? null,
            trend,
            trendLabel: formatDelta(trend, "across selected window"),
        };
    });

    const visiblePoints = series.flatMap((item) => item.points);
    const summaryPoint =
        visiblePoints.sort((a, b) => b.price - a.price)[0] ?? null;
    const lowPoint = visiblePoints.sort((a, b) => a.price - b.price)[0] ?? null;
    const latestPoint =
        visiblePoints.sort((a, b) => b.date - a.date)[0] ?? null;

    const yTicks = Array.from({ length: 6 }, (_, index) => {
        const value = axisMax - axisStep * index;
        return {
            value: Number(value.toFixed(0)),
            y: paddingY + (innerHeight * index) / 5,
        };
    });

    const hoverGroups = new Map();

    dateAxisRows.forEach((dateRow) => {
        const entries = [];

        series.forEach((seriesItem) => {
            const point = seriesItem.points.find(
                (item) => item.dateIso === dateRow.dateIso,
            );

            if (!point) return;

            entries.push({
                fuelSlug: seriesItem.fuelSlug,
                fuelLabel: seriesItem.fuelLabel,
                priceText: point.priceText,
                changeLabel: point.changeLabel,
                color: seriesItem.stroke,
                isPeakPoint: point.isPeakPoint,
                price: point.price,
            });
        });

        if (!entries.length) return;

        const peakEntry = [...entries].sort((a, b) => b.price - a.price)[0];
        const lowestEntry = [...entries].sort((a, b) => a.price - b.price)[0];

        hoverGroups.set(dateRow.dateIso, {
            key: dateRow.dateIso,
            title: formatHoverTitle(dateRow.date),
            subtitle: peakEntry?.isPeakPoint
                ? "Peak Price this week"
                : "Price snapshot this week",
            entries: entries.sort((a, b) => b.price - a.price),
            forecastTitle:
                peakEntry?.price > lowestEntry?.price + 20
                    ? "Tempus Forecast: Critical price peak reached"
                    : "Tempus Forecast: Stable price window ahead",
            forecastBody:
                peakEntry?.price > lowestEntry?.price + 20
                    ? "Avoid non-essential refueling today. Our ARIMA model predicts a significant cool-off starting Monday."
                    : "Localized movement stays within a manageable band. Re-fuel normally and watch the next weekly close.",
        });
    });

    return {
        series,
        dateAxisRows,
        yTicks,
        axisMax,
        axisStep,
        minPrice,
        maxPrice,
        summaryPoint,
        lowPoint,
        latestPoint,
        hoverGroups,
        priceRange: `${formatMoney(minPrice)} - ${formatMoney(maxPrice)}`,
        hasData: visiblePoints.length > 0,
    };
}

function buildBriefings(
    rows,
    series,
    selectedFuel,
    selectedMonth,
    selectedMonthLabel,
) {
    const singleSeries =
        selectedFuel === "all"
            ? ([...series].sort(
                  (a, b) => Math.abs(b.trend) - Math.abs(a.trend),
              )[0] ?? null)
            : (series[0] ?? null);

    if (!singleSeries) {
        return [
            {
                id: "summary",
                tone: "calm",
                action: "Awaiting data",
                label: "Next 7days:",
                body: "No matching fuel-price rows were found for the current filters.",
            },
            {
                id: "recommended",
                tone: "calm",
                action: "Review filters",
                label: "Recommended action:",
                body: "Switch month or fuel type to inspect another trend window.",
            },
        ];
    }

    const startPrice = singleSeries.points[0]?.price ?? 0;
    const latestPrice = singleSeries.points.at(-1)?.price ?? 0;
    const delta = latestPrice - startPrice;
    const direction = delta >= 0 ? "upward" : "downward";
    const cadence = selectedMonthLabel || "the selected window";

    const recommendedAction = delta >= 0 ? "Re-fuel NOW" : "Re-fuel NORMALLY";

    return [
        {
            id: "summary",
            tone: delta >= 0 ? "danger" : "calm",
            action: delta >= 0 ? "Price Surge Imminent" : "Continued Stability",
            label: "Next 7days:",
            body: `${singleSeries.fuelLabel} is moving ${direction} by ${formatMoney(Math.abs(delta))} across ${cadence}.`,
        },
        {
            id: "recommended",
            tone: delta >= 0 ? "danger" : "calm",
            action: recommendedAction,
            label: "Recommended action:",
            body:
                delta >= 0
                    ? `Lock in pricing for ${singleSeries.fuelLabel} before the next jump becomes visible on the chart.`
                    : `There is no sharp rise in ${singleSeries.fuelLabel} during ${cadence}; regular refueling is fine.`,
        },
    ];
}

export function buildTrackPriceDashboard(
    rows = [],
    selectedFuel = "all",
    selectedMonth = "",
) {
    const sourceRows = enrichRows(rows.length ? rows : FALLBACK_ROWS);
    const monthTabs = buildMonthTabs(sourceRows);
    const fuelOptions = buildFuelOptions(sourceRows);
    const normalizedFuel = fuelOptions.some(
        (option) => option.value === selectedFuel,
    )
        ? selectedFuel
        : "all";
    const normalizedMonth = monthTabs.some(
        (option) => option.value === selectedMonth,
    )
        ? selectedMonth
        : (monthTabs[0]?.value ?? "");
    const chart = buildSeries(sourceRows, normalizedFuel, normalizedMonth);
    const currentPriceCards = buildCurrentPriceCards(sourceRows);
    const briefings = buildBriefings(
        sourceRows,
        chart.series,
        normalizedFuel,
        normalizedMonth,
        monthTabs.find((option) => option.value === normalizedMonth)?.label ??
            "",
    );

    return {
        fuelOptions,
        monthTabs,
        selectedFuel: normalizedFuel,
        selectedMonth: normalizedMonth,
        selectedMonthLabel:
            monthTabs.find((option) => option.value === normalizedMonth)
                ?.label ?? "",
        chart,
        currentPriceCards,
        briefings,
        latestDateLabel:
            sourceRows.at(-1)?.fullDateLabel ?? "No date available",
        subtitle: chart.hasData
            ? `Tracking ${chart.series.length > 1 ? "multiple fuel types" : "one fuel type"} across ${chart.priceRange}.`
            : "No matching fuel-price records were found.",
        selectedSummary: chart.summaryPoint,
    };
}
