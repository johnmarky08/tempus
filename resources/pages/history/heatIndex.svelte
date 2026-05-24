<script>
    import History from "../History.svelte";
    import { buildHeatIndexHistoryModel } from "../../js/historyTable.js";

    export let rows = [];
    export let isActive = "History";
    export let isActiveSub = "Heat Index History";

    $: model = buildHeatIndexHistoryModel(rows);
</script>

<History {isActive} {isActiveSub} {model} />
