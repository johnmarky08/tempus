export const nav = [
    {
        name: "Home",
        link: "/home",
        description: "The home page of the website",
    },
    {
        name: "About",
        link: "/about",
        description: "Learn more about this project",
    },
    {
        name: "Fuel Prices",
        link: "/fuel-prices",
        description: "View current fuel prices",
    },
    {
        name: "Heat Index",
        link: "/heat-index",
        description: "View heat index information",
    },
    {
        name: "History",
        description: "View historical data",
        subMenu: [
            {
                name: "Fuel Price History",
                link: "/fuel-history",
                description: "View historical fuel price data",
            },
            {
                name: "Heat Index History",
                link: "/heat-history",
                description: "View historical heat index data",
            },
        ],
    },
];
