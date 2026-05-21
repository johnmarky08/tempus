const AGE_GROUPS = [
    { value: "0-3", label: "0 - 3", risk: 0.9 },
    { value: "4-12", label: "4 - 12", risk: 0.65 },
    { value: "13-17", label: "13 - 17", risk: 0.45 },
    { value: "18-39", label: "18 - 39", risk: 0.15 },
    { value: "40-64", label: "40 - 64", risk: 0.35 },
    { value: "65-79", label: "65 - 79", risk: 0.6 },
    { value: "80+", label: "80+", risk: 0.82 },
];

const HEAT_INDEX_STATE_META = {
    safe: {
        key: "safe",
        title: "SAFE",
        label: "Green",
        tone: "safe",
        accent: "#33FF2F",
        bg: "bg-[#33FF2F]/50",
        border: "border-[#33FF2F]",
        text: "text-[#33FF2F]",
        icon: "check",
    },
    moderate: {
        key: "moderate",
        title: "MODERATE",
        label: "Blue",
        tone: "moderate",
        accent: "#009BFF",
        bg: "bg-[#009BFF]/50",
        border: "border-[#009BFF]",
        text: "text-[#009BFF]",
        icon: "shield",
    },
    high: {
        key: "high",
        title: "HIGH ALERT",
        label: "Orange",
        tone: "high",
        accent: "#FF8400",
        bg: "bg-[#FF8400]/30",
        border: "border-[#FF8400]",
        text: "text-[#FF8400]",
        icon: "warning",
    },
    extreme: {
        key: "extreme",
        title: "EXTREME CAUTION",
        label: "Red",
        tone: "extreme",
        accent: "##FF0000",
        bg: "bg-[#FF0000]/50",
        border: "border-[#FF0000]",
        text: "text-[#FF0000]",
        icon: "alert",
    },
};

const SAFETY_LABEL_META = {
    assessing: {
        key: "assessing",
        title: "ASSESSING...",
        label: "Assessing",
        tone: "assessing",
        accent: "#94a3b8",
        bg: "bg-slate-500/15",
        border: "border-slate-400/50",
        text: "text-slate-200",
        icon: "pulse",
    },
    safe: {
        key: "safe",
        title: "LOW RISK",
        label: "Safe",
        tone: "safe",
        accent: "#33FF2F",
        bg: "bg-[#33FF2F]/50",
        border: "border-[#33FF2F]",
        text: "text-[#33FF2F]",
        icon: "check",
    },
    moderate: {
        key: "moderate",
        title: "CAUTION",
        label: "Moderate",
        tone: "moderate",
        accent: "#009BFF",
        bg: "bg-[#009BFF]/50",
        border: "border-[#009BFF]",
        text: "text-[#009BFF]",
        icon: "shield",
    },
    high: {
        key: "high",
        title: "HIGH ALERT",
        label: "High",
        tone: "high",
        accent: "#FF8400",
        bg: "bg-[#FF8400]/30",
        border: "border-[#FF8400]",
        text: "text-[#FF8400]",
        icon: "warning",
    },
    extreme: {
        key: "extreme",
        title: "EXTREME CAUTION",
        label: "Extreme",
        tone: "extreme",
        accent: "#FF0000",
        bg: "bg-[#FF0000]/50",
        border: "border-[#FF0000]",
        text: "text-[#FF0000]",
        icon: "alert",
    },
};

const DEFAULT_INTRADAY_LABELS = [
    "Hour 1",
    "Hour 2",
    "Hour 3",
    "Hour 4",
    "Hour 5",
    "Hour 6",
    "Hour 7",
];

const SAFETY_HIGHLIGHTS = {
    safe: {
        alert: "No immediate heat risk detected.",
        recommendation: "Proceed with planned outdoor activities normally.",
        travel: "Safe to travel at any hour.",
        tip: "Maintain standard hydration levels.",
    },
    moderate: {
        alert: "Heat levels are rising; comfort may start to drop.",
        recommendation: "Take short shade breaks and keep water nearby.",
        travel: "Standard travel conditions, no restrictions.",
        tip: "Drink water even before you feel thirsty.",
    },
    high: {
        alert: "Heat exposure is significant; reduce long outdoor periods.",
        recommendation:
            "Move heavy tasks earlier in the day or later in the evening.",
        travel: "Avoid non-essential outdoor travel between 12 PM - 4 PM.",
        tip: "Watch for dizziness or nausea.",
    },
    extreme: {
        alert: "Extreme heat risk detected; outdoor strain can rise quickly.",
        recommendation:
            "Limit time outside and move critical tasks indoors if possible.",
        travel: "Avoid outdoor travel unless it is urgent.",
        tip: "Check for confusion, rapid heartbeat, or faintness.",
    },
};

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function formatTemperature(value) {
    return `${Math.round(value)}°C`;
}

function formatWindSpeed(value) {
    return `${Number(value).toFixed(2)} km/h`;
}

function resolveSafetyState(heatIndexValue, ageRisk, exertionLevel) {
    const severityScore = clamp(
        heatIndexValue / 50 + ageRisk * 0.28 + exertionLevel / 18,
        0,
        1.2,
    );

    if (severityScore < 0.35) {
        return "safe";
    }

    if (severityScore < 0.58) {
        return "moderate";
    }

    if (severityScore < 0.86) {
        return "high";
    }

    return "extreme";
}

function buildChartModel(values, labels) {
    const width = 300;
    const height = 150;
    const left = 14;
    const right = 12;
    const top = 14;
    const bottom = 26;
    const innerWidth = width - left - right;
    const innerHeight = height - top - bottom;
    const minValue = Math.min(...values) - 1;
    const maxValue = Math.max(...values) + 1;
    const range = Math.max(maxValue - minValue, 1);

    const points = values.map((value, index) => {
        const x =
            values.length === 1
                ? left + innerWidth / 2
                : left + (index * innerWidth) / (values.length - 1);
        const normalized = (value - minValue) / range;
        const y = top + innerHeight - normalized * innerHeight;

        return {
            x,
            y,
            value,
            label: labels[index] ?? "",
        };
    });

    const linePath = points
        .map(
            (point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
        )
        .join(" ");

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - bottom} L ${points[0].x} ${height - bottom} Z`;

    const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
        y: top + innerHeight - innerHeight * ratio,
        value: Math.round(minValue + range * ratio),
    }));

    return {
        points,
        linePath,
        areaPath,
        ticks,
        width,
        height,
        bottom,
    };
}

function getIntensityMeta(stateKey) {
    return HEAT_INDEX_STATE_META[stateKey] ?? HEAT_INDEX_STATE_META.safe;
}

function getSafetyMeta(stateKey) {
    return SAFETY_LABEL_META[stateKey] ?? SAFETY_LABEL_META.assessing;
}

export {
    AGE_GROUPS,
    DEFAULT_INTRADAY_LABELS,
    HEAT_INDEX_STATE_META,
    SAFETY_HIGHLIGHTS,
    SAFETY_LABEL_META,
    clamp,
    buildChartModel,
    formatTemperature,
    formatWindSpeed,
    getIntensityMeta,
    getSafetyMeta,
    resolveSafetyState,
};
