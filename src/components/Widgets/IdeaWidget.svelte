<script>
    import { nostrManager } from "../../backend/NostrManagerStore.js";

    export let creator_profile;
    export let idea;
    export let preview = false;

    async function deleteIdea() {
        const confirmDelete = confirm(
            "Do you really want to delete this idea?",
        );
        if (confirmDelete) {
            await $nostrManager.sendEvent(5, "", [["e", idea.id]]);
        }
    }
</script>

<div class="single-card container">
    {#if creator_profile && creator_profile.pubkey === $nostrManager.publicKey}
        <button
            on:click={deleteIdea}
            class="absolute top-4 right-4 text-gray-400"
        >
            <i class="fas fa-times-circle" />
        </button>
    {/if}

    <div class="text-center mt-6 px-6">
        <h2 class="base-h2 text-color-df">
            {idea.name}
        </h2>
        {#if preview}
            <h5>Preview</h5>
        {/if}
        <h4 class="base-h4 text-color-df">
            {"Abstract"}
        </h4>
        <p class="abstract-text text-color-df">
            {idea.abstract}
        </p>
        <hr style="width: 65%; margin: auto;" />
        <div class="single-card-content text-color-df">
            {@html idea.message}
        </div>
    </div>
</div>
