<script>
    import History from "../History.svelte";
    import { buildHeatIndexHistoryModel } from "../../js/historyTable.js";

    export let rows = [];
    export let isActive = "History";
    export let isActiveSub = "Heat Index History";
    export let errors = null;

    void errors;

    $: model = buildHeatIndexHistoryModel(rows);
</script>

<History {isActive} {isActiveSub} {model} />
