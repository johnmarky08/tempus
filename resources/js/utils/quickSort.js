function quickSort(items = [], comparator = () => 0) {
    if (items.length < 2) {
        return [...items];
    }

    const pivot = items[Math.floor(items.length / 2)];
    const left = [];
    const equal = [];
    const right = [];

    items.forEach((item) => {
        const comparison = comparator(item, pivot);

        if (comparison < 0) {
            left.push(item);
            return;
        }

        if (comparison > 0) {
            right.push(item);
            return;
        }

        equal.push(item);
    });

    return [
        ...quickSort(left, comparator),
        ...equal,
        ...quickSort(right, comparator),
    ];
}

export { quickSort };