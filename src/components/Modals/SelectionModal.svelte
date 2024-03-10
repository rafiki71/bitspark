<script>
    export let categories;
    export let initialSelectedCategories = [];
    let localSelectedCategories = [...initialSelectedCategories];
    export let onConfirm;
    import { getContext } from "svelte";
    const { close } = getContext("simple-modal");

    function toggleCategory(category) {
        if (localSelectedCategories.includes(category)) {
            localSelectedCategories = localSelectedCategories.filter(
                (c) => c !== category,
            );
        } else {
            localSelectedCategories = [...localSelectedCategories, category];
        }
    }

    function handleConfirm() {
        onConfirm(localSelectedCategories);
        close();
    }

    function handleReset() {
        localSelectedCategories = [];
    }
</script>

<div class="modal-content">
    <h4 class="base-h4 text-color-df" style="margin-top: 0.2em;">Categories</h4>
    <div class="category-container">
        {#each categories as category}
            <button
                class="category-button {localSelectedCategories.includes(
                    category,
                )
                    ? 'selected'
                    : ''}"
                on:click={() => toggleCategory(category)}
            >
                {category}
            </button>
        {/each}
    </div>
    <div class="container mx-auto px-4 py-4 flex justify-end">
        <button
            class="bs-blue text-white font-bold py-2 px-4 block rounded border ml-4 mt-2 hover:shadow-xl"
            on:click={handleReset}>Reset</button
        >
        <button
            class="bs-orange active:bg-orange-600 text-white font-bold py-2 px-4 block rounded border ml-4 mt-2 hover:shadow-xl"
            on:click={handleConfirm}>Confirm Selection</button
        >
    </div>
</div>

<style>
    .modal-content {
        /* Other styles... */
        border: none;
    }

    .category-container {
        display: flex; /* Use flexbox to layout buttons */
        flex-wrap: wrap; /* Allow the items to wrap as needed */
        gap: 8px; /* Adjust the gap between buttons as needed */
    }
    .category-button {
        /* Remove the flex-grow property if you don't want the buttons to grow */
        padding: 4px 8px; /* Adjust padding to fit the text */
        background-color: rgb(238, 238, 238);
        border: none; /* Remove border if you don't need it */
        cursor: pointer; /* Makes it clear the element is clickable */
        white-space: nowrap; /* Prevent text inside the button from wrapping */
        /* You can remove min-width if you want the button to only be as wide as its content plus padding */
        /* min-width: 120px; */
        margin: 2px; /* Provide some space around the buttons */
        border-radius: 4px; /* If you want rounded corners */
        /* Add text alignment and other styles as needed */
        text-align: center;
        font-size: 1rem; /* Adjust font size as needed */
        border: 1px solid rgb(238, 238, 238);
    }

    .category-button:focus {
        outline: none;
    }

    .category-button.selected {
        /* Styles for selected buttons */
        background-color: rgb(249 115 22);
        color: white;
        border: 1px solid rgb(249 115 22);
    }

    .category-button:hover {
        border: 1px solid black;
    }
</style>
