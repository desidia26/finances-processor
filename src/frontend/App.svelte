<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<script lang="ts">
  import CsvGrabber from "./components/CSVGrabber.svelte";
  import EditableTable from "./components/EditableTable.svelte";
  import { CSVResults } from "./types";

  let incomeOutcome : CSVResults = new CSVResults({income: [], expenses: []});
</script>

<main>
  <CsvGrabber bind:csvResults={incomeOutcome} />
  <EditableTable bind:data={incomeOutcome} />
</main>
