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
                question: "What is T.E.M.P.U.S.?",
                answer: "T.E.M.P.U.S. is a localized environmental intelligence dashboard built for the Philippines. It aggregates real-time fuel price data and heat index readings to help everyday Filipinos make smarter, more informed decisions — whether planning a commute, a trip, or just deciding when to head outside.",
            },
            {
                question: "Who is T.E.M.P.U.S. built for?",
                answer: "T.E.M.P.U.S. is designed for everyday Filipino users — commuters, drivers, students, and anyone who wants quick, reliable access to localized fuel prices and heat conditions without digging through multiple government websites or news sources.",
            },
            {
                question: "Is T.E.M.P.U.S. free to use?",
                answer: "Yes. T.E.M.P.U.S. is completely free. There are no paywalls, subscriptions, or hidden fees. It's a public-interest tool built to democratize access to important environmental and economic data.",
            },
            {
                question:
                    "Is T.E.M.P.U.S. affiliated with any government agency?",
                answer: "No. T.E.M.P.U.S. is an independent open-sourced project. While it pulls data from official government sources such as the DOE, it is not affiliated with, endorsed by, or operated by any Philippine Government Agency.",
            },
        ],
    },
    {
        category: "Fuel Price Module",
        items: [
            {
                question: "Where do you get the localized fuel price data?",
                answer: "Fuel price data is sourced from the Department of Energy (DOE) Philippines, which publishes weekly oil price bulletins. T.E.M.P.U.S. parses and structures this data to present it in an accessible, location-aware format.",
            },
            {
                question: "How often is the fuel price data updated?",
                answer: "Fuel prices are updated weekly, in sync with the DOE's regular price bulletins — typically released every Tuesday. T.E.M.P.U.S. reflects the latest published prices as soon as they are processed.",
            },
            {
                question: "Why do prices differ by region?",
                answer: "Fuel prices in the Philippines vary by region due to differences in transportation costs, local taxes, and distribution logistics. T.E.M.P.U.S. displays region-specific prices so you always see what's relevant to your area.",
            },
            {
                question: "Can I compare prices across fuel types?",
                answer: "Yes. The Fuel Price Module lets you compare prices across Gasoline, and Diesel variants side by side, helping you identify the best option for your needs and location.",
            },
        ],
    },
    {
        category: "Heat Index Module",
        items: [
            {
                question: 'How is the "Heat Index" calculated?',
                answer: "The Heat Index (Apparent Temperature) is calculated by combining Air Temperature and Relative Humidity using the Rothfusz regression equation. This measures how hot it actually feels to the human body when humidity is factored in — not just the raw temperature reading.",
            },
            {
                question: "Where does the weather data come from?",
                answer: "Weather data is sourced from Open-Meteo, which aggregates weather and historical atmospheric data from global forecasting and observation models. T.E.M.P.U.S. uses that data to present localized readings in a consistent format.",
            },
            {
                question: "What do the heat index danger levels mean?",
                answer: "T.E.M.P.U.S. uses four heat index levels: Safe (0–26°C), Moderate (27–32°C), High (33–41°C), and Extreme (42°C and above). Each level comes with health guidance to help users make safe decisions about outdoor activity.",
            },
            {
                question: "How often is the heat index refreshed?",
                answer: "Heat index readings are refreshed at regular intervals throughout the day, typically every hour, depending on data availability from source stations. Timestamps are always displayed so you know exactly when the reading was last updated.",
            },
            {
                question: "What locations are covered for heat index readings?",
                answer: "T.E.M.P.U.S. only covers San Pablo City, Laguna for heat index readings in this initial version. Future updates may expand coverage to additional locations as more data sources become accessible.",
            },
        ],
    },
    {
        category: "Technical & Behind-the-Scenes",
        items: [
            {
                question: "What technology stack powers T.E.M.P.U.S.?",
                answer: "T.E.M.P.U.S. is built with Svelte on the frontend, styled with Tailwind CSS. The backend handles data fetching, parsing, and caching via a lightweight API layer. Deployments run on modern edge infrastructure for fast load times across the Philippines.",
            },
            {
                question: "Does T.E.M.P.U.S. store my personal data?",
                answer: "No personally identifiable information is collected or stored. T.E.M.P.U.S. may use your region selection or geolocation (with permission) solely to display relevant local data — this is never transmitted to external servers or third parties.",
            },
            {
                question: "Is the source code open?",
                answer: "T.E.M.P.U.S. is fully open-sourced on GitHub. You can browse the full codebase there, follow updates, and contribute improvements through the project's repository.",
            },
            {
                question: "Why does the app sometimes show cached data?",
                answer: "To keep the app fast and reduce unnecessary load on upstream sources, T.E.M.P.U.S. caches data at controlled intervals.",
            },
        ],
    },
    {
        category: "Disclaimer & Use Cases",
        items: [
            {
                question: "Can I rely on T.E.M.P.U.S. for critical decisions?",
                answer: "T.E.M.P.U.S. is designed to be a helpful reference tool, not a substitute for official advisories. For health emergencies, always defer to the DOH or local government units. For weather-critical decisions, verify conditions with trusted local or national weather advisories. For fuel pricing decisions, cross-check with your local station as prices may vary.",
            },
            {
                question: "What is T.E.M.P.U.S. not responsible for?",
                answer: "T.E.M.P.U.S. is not liable for decisions made based on the data displayed. While we strive for accuracy, data may be delayed, incomplete, or subject to upstream errors. Always verify critical information through official channels.",
            },
            {
                question: "Who can I contact for feedback or issues?",
                answer: "You can reach the T.E.M.P.U.S. team through their contacts on the website or via the project's GitHub issue tracker. We welcome bug reports, feature suggestions, and general feedback from the community.",
            },
        ],
    },
];
