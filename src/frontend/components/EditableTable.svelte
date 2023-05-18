<style>
  .table-wrapper {
    display: flex;
    flex-direction: column;
  }
  .table {
    width: 100%;
    height: 500px;
  }
</style>

<script lang="ts">
  import { onMount } from "svelte";
  import { CSVResults } from "../types";
  import { Grid } from 'ag-grid-community';
  import type { GridOptions } from 'ag-grid-community/dist/lib/entities/gridOptions';
  import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
  import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
  import '../css/alpinedark.min.css'
  export let data : CSVResults = new CSVResults({income: [], expenses: []});
  let incomeDiv : HTMLDivElement;
  let expensesDiv : HTMLDivElement;
  let incomeColumnDefs = [
    { field: 'date' },
    { field: 'description' },
    { field: 'amount' }
  ]
  let defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
    editable: true
  }
  let incomeGridOptions : GridOptions = {
    columnDefs: incomeColumnDefs,
    rowData: data.income,
    defaultColDef
  }
  let expensesGridOptions : GridOptions = {
    columnDefs: [...incomeColumnDefs, { field: 'category' }],
    rowData: data.income,
    defaultColDef
  }
  $: {
    incomeGridOptions.api?.setRowData(data.income);
    expensesGridOptions.api?.setRowData(data.expenses);
  }
  onMount(() => {
    new Grid(incomeDiv, incomeGridOptions);
    new Grid(expensesDiv, expensesGridOptions);
  });
</script>

<main>
  <div class="table-wrapper">
    <div class="ag-theme-alpine-dark table" bind:this={incomeDiv}></div>
    <div class="ag-theme-alpine-dark table" bind:this={expensesDiv}></div>
  </div>
</main>