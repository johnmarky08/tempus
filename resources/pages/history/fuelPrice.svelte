<script>
    import History from "../History.svelte";
    import { buildFuelPriceHistoryModel } from "../../js/historyTable.js";

    export let rows = [];
    export let isActive = "History";
    export let isActiveSub = "Fuel Price History";

    $: model = buildFuelPriceHistoryModel(rows);
</script>

<History {isActive} {isActiveSub} {model} />
