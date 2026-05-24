<script>
    import History from "../History.svelte";
    import { buildFuelPriceHistoryModel } from "../../js/historyTable.js";

    export let rows = [];
    export let isActive = "History";
    export let isActiveSub = "Fuel Price History";
    export let errors = null;

    void errors;

    $: model = buildFuelPriceHistoryModel(rows);
</script>

<History {isActive} {isActiveSub} {model} />
