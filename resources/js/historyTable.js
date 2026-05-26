import { binarySearch } from "./utils/binarySearch";
import { quickSort } from "./utils/quickSort";

function pad(value) {
    return String(value).padStart(2, "0");
}

function parseDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

function formatDate(value) {
    const date = parseDate(value);

    if (!date) {
        return "—";
    }

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDateTime(value) {
    const date = parseDate(value);

    if (!date) {
        return "—";
    }

    const hours = date.getHours();
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(hour12)}:${pad(date.getMinutes())} ${period}`;
}

function normalizeText(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
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

function formatTemperature(value) {
    return `${Number(value).toFixed(2)}°`;
}

function formatHumidity(value) {
    return `${Number(value).toFixed(2)}%`;
}

function formatWindSpeed(value) {
    return `${Number(value).toFixed(2)} km/h`;
}

function formatHeatIndex(value) {
    return `${Number(value).toFixed(2)}°`;
}

function formatCurrency(value) {
    return `₱${Number(value).toFixed(2)}`;
}

function formatFuelPrice(value) {
    return `${formatCurrency(value)}/L`;
}

function formatExchangeRate(value) {
    return formatCurrency(value);
}

function formatBoolean(value) {
    return value ? "True" : "False";
}

function cell(value, wrapperClass = "justify-center", valueClass = "") {
    return { value, wrapperClass, valueClass };
}

function badgeCell(value, tone) {
    const toneClasses =
        tone === "success"
            ? "border-green-500/90 bg-green-500/20 dark:text-green-300 text-green-600 shadow-[0_0_18px_rgba(34,197,94,0.2)]"
            : tone === "danger"
              ? "border-red-500/90 bg-red-500/20 dark:text-red-300 text-red-600 shadow-[0_0_18px_rgba(239,68,68,0.2)]"
              : "border-sky-400/40 bg-sky-400/10 text-sky-100";

    return {
        value,
        wrapperClass: "justify-center",
        valueClass: `rounded-full border px-4 py-1.5 text-sm leading-none ${toneClasses}`,
    };
}

function createHistoryRow({ id, cellsByKey, searchValues, sortValues }) {
    return {
        id,
        cellsByKey,
        searchValues,
        sortValues,
    };
}

function buildFuelPriceHistoryModel(rows = []) {
    const normalizedRows = rows.map((row, index) => {
        const id = row.id ?? `${row.date}-${row.fuel_type}-${index}`;

        return createHistoryRow({
            id,
            searchValues: {
                date: normalizeText(row.date),
                fuelType: normalizeText(row.fuel_type),
                price: normalizeText(row.price),
                exchangeRate: normalizeText(row.exchange_rate_to_usd),
                normalSupply: normalizeText(
                    formatBoolean(row.normal_supply_flag),
                ),
            },
            sortValues: {
                date: parseDate(row.date)?.getTime() ?? 0,
                fuelType: normalizeText(row.fuel_type),
                price: Number(row.price) || 0,
                exchangeRate: Number(row.exchange_rate_to_usd) || 0,
                normalSupply: row.normal_supply_flag ? 1 : 0,
            },
            cellsByKey: {
                date: cell(
                    formatDate(row.date),
                    "justify-start",
                    "dark:text-slate-100 text-[var(--primary-text)] ",
                ),
                fuelType: cell(
                    titleCase(row.fuel_type),
                    "justify-center",
                    "dark:text-slate-100 text-[var(--primary-text)]",
                ),
                price: cell(
                    formatFuelPrice(row.price),
                    "justify-center",
                    "dark:text-slate-100 text-[var(--primary-text)]",
                ),
                exchangeRate: cell(
                    formatExchangeRate(row.exchange_rate_to_usd),
                    "justify-center",
                    "dark:text-slate-100 text-[var(--primary-text)]",
                ),
                normalSupply: badgeCell(
                    formatBoolean(row.normal_supply_flag),
                    row.normal_supply_flag ? "success" : "danger",
                ),
            },
        });
    });

    return {
        heading: {
            primary: "FUEL PRICE",
            accent: "HISTORY",
        },
        columns: [
            {
                key: "date",
                label: "DATE",
                align: "left",
                kind: "date",
                width: "minmax(7rem,1.08fr)",
                filterOptions: ["Newest first", "Oldest first"],
            },
            {
                key: "fuelType",
                label: "FUEL TYPE",
                align: "center",
                kind: "filter",
                width: "minmax(8rem,1fr)",
                filterOptions: [
                    "All Types",
                    "Shell Fuelsave Diesel",
                    "Shell Fuelsave Gasoline Ron91",
                ],
            },
            {
                key: "price",
                label: "PRICE",
                align: "center",
                kind: "number",
                width: "minmax(8rem,1.05fr)",
                filterOptions: ["Highest first", "Lowest first"],
            },
            {
                key: "exchangeRate",
                label: "EXC. RT.(USD)",
                align: "center",
                kind: "number",
                width: "minmax(8rem,1fr)",
                filterOptions: ["Highest first", "Lowest first"],
            },
            {
                key: "normalSupply",
                label: "NOR. SUPPLY",
                align: "center",
                kind: "boolean",
                width: "minmax(8rem,0.9fr)",
                filterOptions: ["All", "True", "False"],
            },
        ],
        gridTemplateColumns:
            "minmax(7rem,1.08fr) minmax(8rem,1fr) minmax(8rem,1.05fr) minmax(8rem,1fr) minmax(8rem,0.9fr)",
        rows: normalizedRows,
        searchPlaceholder: "Search Fuel Prices History",
        footer: {
            label: "Normal Supply Flag:",
            items: [
                {
                    value: "True",
                    tone: "success",
                    description: "Supply is Stable",
                },
                {
                    value: "False",
                    tone: "danger",
                    description:
                        "Supply Disrupted (War, Sanctions, Outage) -> Price Hike Expected",
                },
            ],
        },
    };
}

function buildHeatIndexHistoryModel(rows = []) {
    const normalizedRows = rows.map((row, index) => {
        const id = row.id ?? `${row.date}-${index}`;

        return createHistoryRow({
            id,
            searchValues: {
                date: normalizeText(row.date),
                temperature: normalizeText(row.temperature),
                humidity: normalizeText(row.humidity),
                windSpeed: normalizeText(row.wind_speed),
                heatIndex: normalizeText(row.heat_index),
            },
            sortValues: {
                date: parseDate(row.date)?.getTime() ?? 0,
                temperature: Number(row.temperature) || 0,
                humidity: Number(row.humidity) || 0,
                windSpeed: Number(row.wind_speed) || 0,
                heatIndex: Number(row.heat_index) || 0,
            },
            cellsByKey: {
                date: cell(
                    formatDateTime(row.date),
                    "justify-start",
                    "dark:text-slate-100 text-[var(--primary-text)] text-base",
                ),
                temperature: cell(
                    formatTemperature(row.temperature),
                    "justify-center",
                    "dark:text-slate-100 text-[var(--primary-text)]",
                ),
                humidity: cell(
                    formatHumidity(row.humidity),
                    "justify-center",
                    "dark:text-slate-100 text-[var(--primary-text)]",
                ),
                windSpeed: cell(
                    formatWindSpeed(row.wind_speed),
                    "justify-center",
                    "dark:text-slate-100 text-[var(--primary-text)]",
                ),
                heatIndex: cell(
                    formatHeatIndex(row.heat_index),
                    "justify-center",
                    "dark:text-orange-400 text-orange-500",
                ),
            },
        });
    });

    return {
        heading: {
            primary: "HEAT INDEX",
            accent: "HISTORY",
        },
        columns: [
            {
                key: "date",
                label: "DATE AND TIME",
                align: "left",
                kind: "date",
                width: "minmax(7rem,1.08fr)",
                filterOptions: ["Newest first", "Oldest first"],
            },
            {
                key: "temperature",
                label: "TEMPERATURE",
                align: "center",
                kind: "number",
                width: "minmax(8rem,1fr)",
                filterOptions: ["Highest first", "Lowest first"],
            },
            {
                key: "humidity",
                label: "HUMIDITY",
                align: "center",
                kind: "number",
                width: "minmax(8rem,1fr)",
                filterOptions: ["Highest first", "Lowest first"],
            },
            {
                key: "windSpeed",
                label: "WIND SPEED",
                align: "center",
                kind: "number",
                width: "minmax(8.5rem,1.05fr)",
                filterOptions: ["Highest first", "Lowest first"],
            },
            {
                key: "heatIndex",
                label: "HEAT INDEX",
                align: "center",
                kind: "number",
                width: "minmax(7rem,0.95fr)",
                filterOptions: ["Highest first", "Lowest first"],
            },
        ],
        gridTemplateColumns:
            "minmax(7rem,1.08fr) minmax(8rem,1fr) minmax(8rem,1fr) minmax(8.5rem,1.05fr) minmax(7rem,0.95fr)",
        rows: normalizedRows,
        searchPlaceholder: "Search Heat Index History...",
    };
}

function sortHistoryRows(rows = [], column = null, option = "") {
    if (!column || !option) {
        return rows;
    }

    if (column.key === "fuelType") {
        if (option === "All Types") {
            return rows;
        }

        const normalizedOption = normalizeText(option);

        return rows.filter(
            (row) => row.sortValues?.fuelType === normalizedOption,
        );
    }

    if (column.kind === "boolean") {
        if (option === "All") {
            return rows;
        }

        const shouldShowTrue = option === "True";

        return rows.filter(
            (row) => Boolean(row.sortValues?.[column.key]) === shouldShowTrue,
        );
    }

    const descending =
        option === "Newest first" ||
        option === "Highest first" ||
        option === "Z to A";

    return quickSort(rows, (left, right) => {
        const leftValue = left.sortValues?.[column.key];
        const rightValue = right.sortValues?.[column.key];

        if (column.kind === "date" || column.kind === "number") {
            const numericComparison = Number(leftValue) - Number(rightValue);
            return descending ? -numericComparison : numericComparison;
        }

        const textComparison = String(leftValue).localeCompare(
            String(rightValue),
        );
        return descending ? -textComparison : textComparison;
    });
}

function searchHistoryRows(rows = [], query = "", columns = []) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return rows;
    }

    const searchableColumns = columns.length
        ? columns
        : Object.keys(rows[0]?.searchValues ?? {}).map((key) => ({ key }));
    const matches = new Map();

    searchableColumns.forEach((column) => {
        const indexedRows = quickSort(
            rows.map((row) => ({
                row,
                value: normalizeText(row.searchValues?.[column.key] ?? ""),
            })),
            (left, right) => left.value.localeCompare(right.value),
        );

        const startIndex = binarySearch(indexedRows, (item) =>
            item.value.localeCompare(normalizedQuery),
        );

        if (startIndex < 0) {
            return;
        }

        const scanIndex = Math.min(startIndex, indexedRows.length - 1);

        for (let cursor = scanIndex; cursor >= 0; cursor -= 1) {
            if (indexedRows[cursor].value.includes(normalizedQuery)) {
                matches.set(
                    indexedRows[cursor].row.id,
                    indexedRows[cursor].row,
                );
            }
        }

        for (
            let cursor = scanIndex + 1;
            cursor < indexedRows.length;
            cursor += 1
        ) {
            if (indexedRows[cursor].value.includes(normalizedQuery)) {
                matches.set(
                    indexedRows[cursor].row.id,
                    indexedRows[cursor].row,
                );
            }
        }
    });

    return rows.filter((row) => matches.has(row.id));
}

export {
    buildFuelPriceHistoryModel,
    buildHeatIndexHistoryModel,
    searchHistoryRows,
    sortHistoryRows,
};
