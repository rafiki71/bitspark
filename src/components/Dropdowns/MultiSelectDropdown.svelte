<script>
  export let categories = [];
  export let selected = []; // Hinweis: der Name "selected" wurde in Übereinstimmung mit dem Namen der übergeordneten Variable gewählt

  let dropdownOpen = false; 

  let checkboxStates = {};

  $: categories.forEach(category => {
    checkboxStates[category] = selected.includes(category);
  });

  function toggleCategory(category) {
    const isSelected = selected.includes(category);
    if (isSelected) {
      selected = selected.filter(item => item !== category);
    } else if (selected.length < 3) {
      selected = [...selected, category];
    }
  }
</script>

<div class="">
  <button 
    class="input-style" 
    on:click={() => dropdownOpen = !dropdownOpen}>
    Select Categories
  </button>
  <div class="{dropdownOpen ? 'block' : 'hidden'} absolute w-full bg-white border-t-0 rounded-b-md border-2 border-gray-200 z-10">
    {#each categories as category}
      <label class="block px-4 py-2 hover:bg-blue-50 rounded-md">
        <input type="checkbox" class="mr-2" bind:checked={checkboxStates[category]} on:change={() => toggleCategory(category)} />
        {category}
      </label>
    {/each}
  </div>
</div>



