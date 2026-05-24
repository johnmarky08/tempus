export const faqTopics = [
    "General",
    "Fuel Prices",
    "Heat Index",
    "Technical",
    "Disclaimer",
    "Data Sources",
    "Accuracy",
    "Updates",
    "Mobile",
    "API",
    "Privacy",
    "Open Source",
];

export const faqData = [
    {
        category: "General & Project Overview",
        items: [
            {
                question: "What is Tempus?",
                answer: "Tempus is a localized environmental intelligence dashboard built for the Philippines. It aggregates real-time fuel price data and heat index readings to help everyday Filipinos make smarter, more informed decisions — whether planning a commute, a trip, or just deciding when to head outside.",
            },
            {
                question: "Who is Tempus built for?",
                answer: "Tempus is designed for everyday Filipino users — commuters, drivers, students, and anyone who wants quick, reliable access to localized fuel prices and heat conditions without digging through multiple government websites or news sources.",
            },
            {
                question: "Is Tempus free to use?",
                answer: "Yes. Tempus is completely free. There are no paywalls, subscriptions, or hidden fees. It's a public-interest tool built to democratize access to important environmental and economic data.",
            },
            {
                question: "Is Tempus affiliated with any government agency?",
                answer: "No. Tempus is an independent project. While it pulls data from official government sources such as the DOE and PAGASA, it is not officially affiliated with, endorsed by, or operated by any Philippine government agency.",
            },
        ],
    },
    {
        category: "The Fuel Price Module",
        items: [
            {
                question: "Where do you get the localized fuel price data?",
                answer: "Fuel price data is sourced from the Department of Energy (DOE) Philippines, which publishes weekly oil price bulletins. Tempus parses and structures this data to present it in an accessible, location-aware format.",
            },
            {
                question: "How often is the fuel price data updated?",
                answer: "Fuel prices are updated weekly, in sync with the DOE's regular price bulletins — typically released every Tuesday. Tempus reflects the latest published prices as soon as they are processed.",
            },
            {
                question: "Why do prices differ by region?",
                answer: "Fuel prices in the Philippines vary by region due to differences in transportation costs, local taxes, and distribution logistics. Tempus displays region-specific prices so you always see what's relevant to your area.",
            },
            {
                question: "Can I compare prices across fuel types?",
                answer: "Yes. The Fuel Price Module lets you compare prices across Gasoline, Diesel, and Kerosene variants side by side, helping you identify the best option for your needs and location.",
            },
        ],
    },
    {
        category: "The Heat Index Module",
        items: [
            {
                question: 'How is the "Heat Index" calculated?',
                answer: "The Heat Index (Apparent Temperature) is calculated by combining Air Temperature and Relative Humidity using the Rothfusz regression equation. This measures how hot it actually feels to the human body when humidity is factored in — not just the raw temperature reading.",
            },
            {
                question: "Where does the weather data come from?",
                answer: "Weather data is sourced from PAGASA (Philippine Atmospheric, Geophysical and Astronomical Services Administration) and supplemented by open meteorological APIs where available. Station-level readings are used when accessible.",
            },
            {
                question: "What do the heat index danger levels mean?",
                answer: "Tempus uses PAGASA's official classification: Caution (27–32°C), Extreme Caution (33–41°C), Danger (42–51°C), and Extreme Danger (52°C and above). Each level comes with health guidance to help users make safe decisions about outdoor activity.",
            },
            {
                question: "How often is the heat index refreshed?",
                answer: "Heat index readings are refreshed at regular intervals throughout the day, typically every hour, depending on data availability from source stations. Timestamps are always displayed so you know exactly when the reading was last updated.",
            },
        ],
    },
    {
        category: "Technical & Behind-the-Scenes",
        items: [
            {
                question: "What technology stack powers Tempus?",
                answer: "Tempus is built with SvelteKit on the frontend, styled with Tailwind CSS. The backend handles data fetching, parsing, and caching via a lightweight API layer. Deployments run on modern edge infrastructure for fast load times across the Philippines.",
            },
            {
                question: "Does Tempus store my personal data?",
                answer: "No personally identifiable information is collected or stored. Tempus may use your region selection or geolocation (with permission) solely to display relevant local data — this is never transmitted to external servers or third parties.",
            },
            {
                question: "Is the source code open?",
                answer: "Tempus is developed with an open-source philosophy. Portions of the codebase are or will be made available publicly. Check the project's GitHub repository for the latest on what's been released and how to contribute.",
            },
            {
                question: "Why does the app sometimes show cached data?",
                answer: "To keep the app fast and reduce unnecessary load on upstream sources, Tempus caches data at controlled intervals. A freshness indicator is always shown so you know if you're viewing live or recently cached information.",
            },
        ],
    },
    {
        category: "Disclaimer & Use Cases",
        items: [
            {
                question: "Can I rely on Tempus for critical decisions?",
                answer: "Tempus is designed to be a helpful reference tool, not a substitute for official advisories. For health emergencies, always defer to PAGASA, DOH, or local government units. For fuel pricing decisions, cross-check with your local station as prices may vary.",
            },
            {
                question: "What is Tempus not responsible for?",
                answer: "Tempus is not liable for decisions made based on the data displayed. While we strive for accuracy, data may be delayed, incomplete, or subject to upstream errors. Always verify critical information through official channels.",
            },
            {
                question: "Who can I contact for feedback or issues?",
                answer: "You can reach the Tempus team through the contact form on the website or via the project's GitHub issue tracker. We welcome bug reports, feature suggestions, and general feedback from the community.",
            },
        ],
    },
];
