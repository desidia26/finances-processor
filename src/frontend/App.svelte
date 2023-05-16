<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  /* h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  } */

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import { processChaseCSV } from './utils/csv-utils';
  import { CSVResults } from './types';
  let chaseCSVRegex = /Chase.*\.csv/i;
  async function handleFileSelection(event: Event) {
    let csvResults : CSVResults = new CSVResults({income: [], expenses: []});
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (chaseCSVRegex.test(files[i].name)) {
          let res : CSVResults = await processChaseCSV(files[i])
          csvResults.concat(res);
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

<main>
  <input type="file" bind:this={inputElement} multiple on:change={handleFileSelection} />
</main>
