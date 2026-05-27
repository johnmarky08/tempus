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
        loaderDescription: "Preparing updated data and model outputs.",
    },
    {
        name: "Heat Index",
        link: "/heat-index",
        description: "View heat index information",
        loaderDescription: "Preparing updated data and model outputs.",
    },
    {
        name: "History",
        description: "View historical data",
        link: "/history",
        subMenu: [
            {
                name: "Fuel Price History",
                link: "/history/fuel-prices",
                description: "View historical fuel price data",
            },
            {
                name: "Heat Index History",
                link: "/history/heat-index",
                description: "View historical heat index data",
            },
        ],
    },
];

export const defaultLoaderSubtitle = "Waiting for the page to load.";

export function getNavItemByPath(pathname) {
    const normalizedPath = pathname.replace(/\/$/, "") || "/";

    for (const item of nav) {
        const itemPath = item.link.replace(/\/$/, "") || "/";

        if (itemPath === normalizedPath) {
            return item;
        }

        if (item.subMenu) {
            const subItem = item.subMenu.find((entry) => {
                const subPath = entry.link.replace(/\/$/, "") || "/";

                return subPath === normalizedPath;
            });

            if (subItem) {
                return subItem;
            }
        }
    }

    return null;
}
