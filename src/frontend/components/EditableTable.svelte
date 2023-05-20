<style global>
  .table-wrapper {
    display: flex;
    flex-direction: column;
  }
  .table {
    width: 100%;
    height: 95vh;
  }
</style>

<script lang="ts">
  import { onMount } from "svelte";
  import { Grid } from 'ag-grid-community';
  import type { GridOptions } from 'ag-grid-community/dist/lib/entities/gridOptions';
  import type { Finance } from "../types";
  export let rowData : Finance[] = [];
  let gridDiv : HTMLDivElement;
  let columnDefs = [
    { field: 'date' },
    { field: 'description' },
    { field: 'amount' },
    { field: 'category' },
    { field: 'type' }
    
  ]
  let defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
    editable: true,
    type: 'rightAligned'
  }
  let gridOptions : GridOptions = {
    columnDefs: columnDefs,
    rowData,
    defaultColDef
  }
  $: {
    gridOptions.api?.setRowData(rowData);
  }
  onMount(() => {
    new Grid(gridDiv, gridOptions);
  });
</script>

<main>
  <div class="table-wrapper">
    <div class="ag-theme-alpine-dark table" bind:this={gridDiv}></div>
  </div>
  <button on:click={() => console.log(rowData)}>Log</button>
</main>