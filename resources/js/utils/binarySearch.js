function binarySearch(items = [], comparator = () => 0) {
    let low = 0;
    let high = items.length - 1;
    let match = -1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const comparison = comparator(items[mid]);

        if (comparison >= 0) {
            if (comparison === 0) {
                match = mid;
            }

            high = mid - 1;
            continue;
        }

        low = mid + 1;
    }

    return match >= 0 ? match : low;
}

export { binarySearch };