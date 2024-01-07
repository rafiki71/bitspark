<script>
    import BaseBubble from "./BaseBubble.svelte";
    import { onMount } from "svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import { NOSTR_KIND_JOB } from '../../constants/nostrKinds';

    export let event;
    let offer;
    let isOfferCreator = false;
    let prUrl = "";

    onMount(async () => {
        await loadOffer();
        checkIfOfferCreator();
    });

    async function loadOffer() {
        const offerId = event.tags.find(tag => tag[0] === 'o')[1];
        const offerEvents = $nostrCache.getEventsByCriteria({
            kinds: [NOSTR_KIND_JOB],
            ids: [offerId],
        });

        if (offerEvents && offerEvents.length > 0) {
            offer = offerEvents[0];
        }
    }

    function checkIfOfferCreator() {
        if (offer && $nostrManager.publicKey) {
            isOfferCreator = offer.pubkey === $nostrManager.publicKey;
        }
    }

    async function sendPR() {
        if (!$nostrManager || !prUrl) {
            return;
        }

        const witnessEventString = btoa(JSON.stringify(event)); // Kodiert das Event in einen Base64-String

        const tags = [
            ["s", "bitspark"], // Tag für Pull Request
            ["t", "pr"], // Tag für Pull Request
            ["e", event.tags.find(tag => tag[0] === 'e')[1]], // Job ID
            ["o", event.tags.find(tag => tag[0] === 'o')[1]], // Offer ID
            ["pr_url", prUrl], // URL des Pull Requests
            ["witness", witnessEventString], // URL des Pull Requests
        ];

        try {
            await $nostrManager.sendEvent(NOSTR_KIND_JOB, "Pull Request submitted", tags);
            prUrl = ""; // URL-Feld zurücksetzen
        } catch (error) {
            console.error("Error sending PR:", error);
        }
    }
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
