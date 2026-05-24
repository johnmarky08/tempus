<script>
    import History from "../History.svelte";
    import {
        buildHeatIndexHistoryModel,
        HEAT_INDEX_HISTORY_SAMPLE_ROWS,
    } from "../../js/historyTable.js";

    export let rows = HEAT_INDEX_HISTORY_SAMPLE_ROWS;
    export let isActive = "History";
    export let isActiveSub = "Heat Index History";

    $: model = buildHeatIndexHistoryModel(rows);
</script>

<History {isActive} {isActiveSub} {model} />
