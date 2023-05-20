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
  import EditableTable from "./components/EditableTable.svelte";
  import { onMount } from 'svelte';
    import type { Finance } from "./types";
  let financesDir: string = "";
  let finances: Finance[] = [];
  onMount(async () => {
    // @ts-ignore
    window.eventListener.on('finances-loaded', (res: CSVResults) => {
      finances = finances.concat(res);
    });
    // @ts-ignore
    window.eventListener.on('finances-path-changed', (path) => {
      finances = [];
      financesDir = path;
    });
    // @ts-ignore
    window.electronStore.get("financesFolderPath").then(res => {
      financesDir = res;
    });
    // @ts-ignore
    window.electronStore.get("finances").then(res => {
      finances = res;
    });
  });
</script>

<main>
  {#if financesDir === ""}
    <h1>Choose a directory to pull financial records from</h1>
  {:else if finances.length > 0}
    <EditableTable bind:rowData={finances} />
  {:else}
    <h1>No data in {financesDir}</h1>
  {/if}
</main>
