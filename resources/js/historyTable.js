const FUEL_PRICE_HISTORY_SAMPLE_ROWS = [
    {
        date: "2026-04-24",
        petrolPrice: 89.5,
        dieselPrice: 87.5,
        exchangeRate: 56.7,
        normalSupply: true,
    },
    {
        date: "2026-04-23",
        petrolPrice: 89.5,
        dieselPrice: 87.5,
        exchangeRate: 56.7,
        normalSupply: true,
    },
    {
        date: "2026-04-22",
        petrolPrice: 89.5,
        dieselPrice: 87.5,
        exchangeRate: 56.7,
        normalSupply: true,
    },
    {
        date: "2026-04-21",
        petrolPrice: 88.0,
        dieselPrice: 87.5,
        exchangeRate: 56.75,
        normalSupply: false,
    },
    {
        date: "2026-04-20",
        petrolPrice: 88.0,
        dieselPrice: 86.5,
        exchangeRate: 56.75,
        normalSupply: true,
    },
    {
        date: "2026-04-19",
        petrolPrice: 87.5,
        dieselPrice: 86.0,
        exchangeRate: 56.72,
        normalSupply: true,
    },
    {
        date: "2026-04-18",
        petrolPrice: 87.5,
        dieselPrice: 85.5,
        exchangeRate: 56.7,
        normalSupply: true,
    },
    {
        date: "2026-04-17",
        petrolPrice: 87.5,
        dieselPrice: 85.5,
        exchangeRate: 56.7,
        normalSupply: true,
    },
    {
        date: "2026-04-16",
        petrolPrice: 88.25,
        dieselPrice: 87.5,
        exchangeRate: 56.7,
        normalSupply: false,
    },
    {
        date: "2026-04-15",
        petrolPrice: 87.5,
        dieselPrice: 86.5,
        exchangeRate: 56.75,
        normalSupply: false,
    },
    {
        date: "2026-04-14",
        petrolPrice: 87.5,
        dieselPrice: 85.5,
        exchangeRate: 56.7,
        normalSupply: false,
    },
    {
        date: "2026-04-13",
        petrolPrice: 88.5,
        dieselPrice: 87.5,
        exchangeRate: 56.7,
        normalSupply: false,
    },
];

const HEAT_INDEX_HISTORY_SAMPLE_ROWS = [
    {
        date: "2026-04-25",
        temperature: 34.0,
        humidity: 72,
        windSpeed: 12.4,
        heatIndex: 34.0,
    },
    {
        date: "2026-04-24",
        temperature: 34.0,
        humidity: 72,
        windSpeed: 12.4,
        heatIndex: 34.0,
    },
    {
        date: "2026-04-23",
        temperature: 34.0,
        humidity: 72,
        windSpeed: 12.4,
        heatIndex: 34.0,
    },
    {
        date: "2026-04-22",
        temperature: 34.0,
        humidity: 72,
        windSpeed: 12.4,
        heatIndex: 34.0,
    },
    {
        date: "2026-04-21",
        temperature: 33.5,
        humidity: 68,
        windSpeed: 14.0,
        heatIndex: 39.8,
    },
    {
        date: "2026-04-20",
        temperature: 34.2,
        humidity: 75,
        windSpeed: 10.2,
        heatIndex: 42.1,
    },
    {
        date: "2026-04-19",
        temperature: 33.0,
        humidity: 65,
        windSpeed: 16.3,
        heatIndex: 38.5,
    },
    {
        date: "2026-04-18",
        temperature: 32.8,
        humidity: 70,
        windSpeed: 11.0,
        heatIndex: 38.0,
    },
    {
        date: "2026-04-17",
        temperature: 34.5,
        humidity: 78,
        windSpeed: 9.5,
        heatIndex: 43.4,
    },
    {
        date: "2026-04-16",
        temperature: 33.8,
        humidity: 74,
        windSpeed: 13.1,
        heatIndex: 40.0,
    },
    {
        date: "2026-04-15",
        temperature: 32.5,
        humidity: 66,
        windSpeed: 15.7,
        heatIndex: 37.2,
    },
    {
        date: "2026-04-14",
        temperature: 33.2,
        humidity: 69,
        windSpeed: 12.0,
        heatIndex: 38.9,
    },
    {
        date: "2026-04-13",
        temperature: 34.8,
        humidity: 80,
        windSpeed: 8.3,
        heatIndex: 44.7,
    },
];

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

function formatTemperature(value) {
    return `${Number(value).toFixed(1)}°`;
}

function formatHumidity(value) {
    return `${Number(value).toFixed(0)}%`;
}

function formatWindSpeed(value) {
    return `${Number(value).toFixed(1)} km/h`;
}

function formatHeatIndex(value) {
    return `${Number(value).toFixed(1)}°`;
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
            ? "border-green-500/90 bg-green-500/20 text-green-300 shadow-[0_0_18px_rgba(34,197,94,0.2)]"
            : tone === "danger"
              ? "border-red-500/90 bg-red-500/20 text-red-300 shadow-[0_0_18px_rgba(239,68,68,0.2)]"
              : "border-sky-400/40 bg-sky-400/10 text-sky-100";

    return {
        value,
        wrapperClass: "justify-center",
        valueClass: `rounded-full border px-4 py-1.5 text-sm leading-none ${toneClasses}`,
    };
}

function buildFuelPriceHistoryModel(rows = FUEL_PRICE_HISTORY_SAMPLE_ROWS) {
    const normalizedRows = rows.map((row) => ({
        id: row.date,
        cells: [
            cell(formatDate(row.date), "justify-start", "text-slate-100"),
            cell(
                formatFuelPrice(row.petrolPrice),
                "justify-center",
                "text-slate-100",
            ),
            cell(
                formatFuelPrice(row.dieselPrice),
                "justify-center",
                "text-slate-100",
            ),
            cell(
                formatExchangeRate(row.exchangeRate),
                "justify-center",
                "text-slate-100",
            ),
            badgeCell(
                formatBoolean(row.normalSupply),
                row.normalSupply ? "success" : "danger",
            ),
        ],
    }));

    return {
        heading: {
            primary: "FUEL PRICE",
            accent: "PREDICTION",
        },
        columns: [
            {
                key: "date",
                label: "DATE",
                align: "left",
                width: "1.08fr",
                filterOptions: ["Newest first", "Oldest first"],
            },
            {
                key: "petrolPrice",
                label: "PRICE(PETROL)",
                align: "center",
                width: "1.1fr",
                filterOptions: ["Highest first", "Lowest first"],
            },
            {
                key: "dieselPrice",
                label: "PRICE(DIESEL)",
                align: "center",
                width: "1.1fr",
                filterOptions: ["Highest first", "Lowest first"],
            },
            {
                key: "exchangeRate",
                label: "EXC. RT.(USD)",
                align: "center",
                width: "1fr",
                filterOptions: ["Highest first", "Lowest first"],
            },
            {
                key: "normalSupply",
                label: "NOR. SUPPLY",
                align: "center",
                width: "0.9fr",
                filterOptions: ["All", "True", "False"],
            },
        ],
        gridTemplateColumns:
            "minmax(7rem,1.08fr) minmax(9rem,1.1fr) minmax(9rem,1.1fr) minmax(8rem,1fr) minmax(8rem,0.9fr)",
        rows: normalizedRows,
        footer: {
            label: "Normal Supply Flag:",
            items: [
                {
                    value: "True",
                    tone: "success",
                    description: "Supply is stable",
                },
                {
                    value: "False",
                    tone: "danger",
                    description:
                        "Supply disrupted (war, sanctions, outage) -> price hike expected",
                },
            ],
        },
    };
}

function buildHeatIndexHistoryModel(rows = HEAT_INDEX_HISTORY_SAMPLE_ROWS) {
    const normalizedRows = rows.map((row) => ({
        id: row.date,
        cells: [
            cell(formatDate(row.date), "justify-start", "text-slate-100"),
            cell(
                formatTemperature(row.temperature),
                "justify-center",
                "text-slate-100",
            ),
            cell(
                formatHumidity(row.humidity),
                "justify-center",
                "text-slate-100",
            ),
            cell(
                formatWindSpeed(row.windSpeed),
                "justify-center",
                "text-slate-100",
            ),
            cell(
                formatHeatIndex(row.heatIndex),
                "justify-center",
                "text-orange-400",
            ),
        ],
    }));

    return {
        heading: {
            primary: "HEAT INDEX",
            accent: "PREDICTION",
        },
        columns: [
            {
                key: "date",
                label: "DATE",
                align: "left",
                width: "1.08fr",
                filterOptions: ["Newest first", "Oldest first"],
            },
            {
                key: "temperature",
                label: "TEMPERATURE",
                align: "center",
                width: "1fr",
                filterOptions: ["Highest first", "Lowest first"],
            },
            {
                key: "humidity",
                label: "HUMIDITY",
                align: "center",
                width: "1fr",
                filterOptions: ["Highest first", "Lowest first"],
            },
            {
                key: "windSpeed",
                label: "WIND SPEED",
                align: "center",
                width: "1.05fr",
                filterOptions: ["Highest first", "Lowest first"],
            },
            {
                key: "heatIndex",
                label: "HEAT INDEX",
                align: "center",
                width: "0.95fr",
                filterOptions: ["Highest first", "Lowest first"],
            },
        ],
        gridTemplateColumns:
            "minmax(7rem,1.08fr) minmax(8rem,1fr) minmax(8rem,1fr) minmax(8.5rem,1.05fr) minmax(7rem,0.95fr)",
        rows: normalizedRows,
    };
}

export {
    FUEL_PRICE_HISTORY_SAMPLE_ROWS,
    HEAT_INDEX_HISTORY_SAMPLE_ROWS,
    buildFuelPriceHistoryModel,
    buildHeatIndexHistoryModel,
};
