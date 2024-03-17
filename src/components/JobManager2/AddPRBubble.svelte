<script>
    import BaseBubble from "./BaseBubble.svelte";
    import { onMount } from "svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import { nostrJobManager } from "../../backend/NostrJobManager.js";

    export let event;
    let offer;
    let offerId;
    let isOfferCreator = false;
    let prUrl = "";

    onMount(async () => {
        await loadOffer();
        await checkIfOfferCreator();
    });

    async function loadOffer() {
        offerId = event.tags.find(tag => tag[0] === 'o')[1];
        offer = await nostrJobManager.loadOffer(offerId);
    }

    async function checkIfOfferCreator() {
        if (offer && $nostrManager.publicKey) {
            isOfferCreator = await nostrJobManager.isCreator(
            offer.id,
            $nostrManager.publicKey,
        );
        }
    }

    async function sendPR() {
        if (!$nostrManager || !prUrl) {
            return;
        }

        try {
            await nostrJobManager.sendPR(offerId, prUrl);
            prUrl = ""; // URL-Feld zurücksetzen
        } catch (error) {
            console.error("Error sending PR:", error);
        }
    }

    $: $nostrCache && loadOffer() && checkIfOfferCreator();
    
</script>

{#if isOfferCreator && event.tags.find(tag => tag[0] === 't')[1] === 'ao'}
    <BaseBubble {event} backgroundColor="#E8F4FA" textColor="#333333">
        <div class="pr-content">
            <input type="text" bind:value={prUrl} placeholder="Enter your PR URL here" />
            <button on:click={sendPR}>Send PR</button>
        </div>
    </BaseBubble>
{/if}

<style>
    .pr-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 10px;
    }

    .pr-content input {
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .pr-content button {
        padding: 8px 15px;
        background-color: #76C79E; /* Grüne Farbe für den Senden-Button */
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
</style>
