<script lang="ts">
  import { onMount } from 'svelte';
  import { processChaseCSV } from '../utils/csv-utils';
  import { CSVResults } from '../types';
  let chaseCSVRegex = /Chase.*\.csv/i;
  export let csvResults : CSVResults = new CSVResults({income: [], expenses: []});
  async function handleFileSelection(event: Event) {
    csvResults.clear();
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (chaseCSVRegex.test(files[i].name)) {
          let res : CSVResults = await processChaseCSV(files[i])
          csvResults = csvResults.concat(res);
        }
      }
      console.log(csvResults);
    }
  }

  let inputElement: HTMLInputElement;
  // After the component has been rendered to the DOM.
  onMount(() => {
    inputElement.setAttribute('webkitdirectory', 'true');
  });

</script>

<input type="file" bind:this={inputElement} multiple on:change={handleFileSelection} />