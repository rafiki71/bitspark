<!-- ManagePullRequestDialog.svelte -->
<script>
    import { helperStore } from "../../helperStore.js";
    import { onMount } from "svelte";
    export let pullRequest;

    let offer = null;
    let isOwner = false;
    let prStatus = { status: 'pending', reason: '' };

    onMount(async () => {
        const offerId = pullRequest.tags.find(tag => tag[0] === "o")[1];
        offer = await $helperStore.getEvent(offerId);
        isOwner = $helperStore.publicKey === offer.pubkey;
        prStatus = await $helperStore.getPullRequestStatus(pullRequest.id);
    });

    async function setPullRequestStatus(status) {
        await $helperStore.setPullRequestStatus(pullRequest.id, offer.pubkey, status);
        prStatus = await $helperStore.getPullRequestStatus(pullRequest.id);
    }

    function getPullRequestUrl() {
        const prUrlTag = pullRequest.tags.find(tag => tag[0] === "pr_url");
        return prUrlTag ? prUrlTag[1] : "#";
    }

    $: isOwner = offer ? $helperStore.publicKey === offer.pubkey : false;
</script>

{#if offer}
    <div class="pull-request-dialog {prStatus.status}">
        <div class="pull-request-item">
            <div class="pr-info">
                <i class="fas fa-code-branch pr-icon"></i>
                <div>
                    <div class="pr-title">Pull Request</div>
                    <a href={getPullRequestUrl()} target="_blank" class="pr-url">{getPullRequestUrl()}</a>
                </div>
            </div>
            {#if prStatus.status === "pending" && isOwner}
                <div class="pr-actions">
                    <button class="pr-accept" on:click={() => setPullRequestStatus("accepted")}><i class="fas fa-check"></i> Accept</button>
                    <button class="pr-decline" on:click={() => setPullRequestStatus("declined")}><i class="fas fa-times"></i> Decline</button>
                </div>
            {:else}
                <div class="pr-status">Status: {prStatus.status}{#if prStatus.reason} (Reason: {prStatus.reason}) {/if}</div>
            {/if}
        </div>
        <span class="offer-date">{new Date(pullRequest.created_at * 1000).toLocaleString()}</span>
    </div>
{/if}

<style>
    .pull-request-dialog.accepted {
        border: 2px solid #4caf50; /* Grün für akzeptierte PRs */
    }

    .pull-request-dialog.declined {
        border: 2px solid #f44336; /* Rot für abgelehnte PRs */
    }

    .pr-status {
        font-weight: bold;
        color: #6c757d;
        margin-top: 10px;
        text-align: center;
    }

    .offer-date {
        display: block; /* Stellt sicher, dass es eine eigene Zeile einnimmt */
        margin-top: 10px; /* Abstand nach oben */
        text-align: center; /* Zentriert den Text */
        color: #6c757d; /* Etwas dunkler für gute Lesbarkeit */
        font-size: 0.9rem; /* Leicht kleinere Schriftgröße für ein subtiles Aussehen */
        font-style: italic; /* Leichter Stil für das Datum */
    }

    @media (max-width: 600px) {
        .offer-date {
            font-size: 0.8rem; /* Noch kleinere Schriftgröße für kleinere Bildschirme */
        }
    }

    .pr-info {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }

    .pr-icon {
        font-size: 1.5rem;
        color: #6c757d;
        margin-right: 10px;
    }

    .pr-title {
        font-weight: bold;
        margin-bottom: 5px;
    }

    .pr-url {
        color: #007bff;
        text-decoration: none;
    }

    .pr-url:hover {
        text-decoration: underline;
    }
    /* Grundlegende Styles für den Dialog */
    .pull-request-dialog {
        background-color: #f3f4f6; /* Weiches Grau für einen moderneren Look */
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    /* Stile für Aktionsschaltflächen */
    .pr-actions {
        display: flex;
        justify-content: space-around;
        padding-top: 10px;
    }

    .pr-actions button {
        padding: 5px 10px;
        border: none;
        color: #555;
        background-color: #fff;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.3s, color 0.3s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 5px; /* Abstand zwischen Icon und Text */
    }

    .pr-accept {
        color: #4caf50;
    }

    .pr-accept:hover {
        background-color: #e8f5e9; /* Helles Grün für Hover */
    }

    .pr-decline {
        color: #f44336;
    }

    .pr-decline:hover {
        background-color: #ffebee; /* Helles Rot für Hover */
    }

    .pr-accept i,
    .pr-decline i {
        font-size: 1rem;
    }

    @media (max-width: 600px) {
        .pr-actions button {
            padding: 4px 8px;
            font-size: 0.9rem;
        }
    }
</style>
