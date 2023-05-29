<script>
  export let categories = [];
  
  let selectedCategories = [];
  let dropdownOpen = false; // Zustandsindikator hinzufügen

  let checkboxStates = {};

  $: categories.forEach(category => {
    checkboxStates[category] = selectedCategories.includes(category);
  });

  function toggleCategory(category) {
    const isSelected = selectedCategories.includes(category);
    if (isSelected) {
      selectedCategories = selectedCategories.filter(item => item !== category);
    } else if (selectedCategories.length < 3) {
      selectedCategories = [...selectedCategories, category];
    }
  }
</script>

<div class="block rounded-md border-1 border-gray-200 relative w-full">
  <button 
    class="w-full bg-white px-4 py-2 text-left border-2 border-gray-200 rounded-md" 
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



