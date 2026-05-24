<script>
    import History from "../History.svelte";
    import {
        buildFuelPriceHistoryModel,
        FUEL_PRICE_HISTORY_SAMPLE_ROWS,
    } from "../../js/historyTable.js";

    export let rows = FUEL_PRICE_HISTORY_SAMPLE_ROWS;
    export let isActive = "History";
    export let isActiveSub = "Fuel Price History";
   

    $: model = buildFuelPriceHistoryModel(rows);
</script>

<History {isActive} {isActiveSub}  {model} />
