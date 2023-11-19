<script>
    import { onMount } from "svelte";
    import { helperStore } from "../../helperStore.js";
    export let accept;
    export let jobId;
    let pullRequestUrl = "";
    let pullRequests = [];
    let offer = null; // Initialisierung
    let isOwner = false;

    onMount(async () => {
        await loadOffer();
        if (offer) {
            await loadPullRequests();
        }
    });

    function getOfferId() {
        return accept.tags.find((tag) => tag[0] === "o")[1];
    }

    function getPullRequestUrl(pr) {
        const prUrlTag = pr.tags.find((tag) => tag[0] === "pr_url");
        return prUrlTag ? prUrlTag[1] : "#"; // Rückgabe der URL oder eines Platzhalters, falls nicht vorhanden
    }

    async function loadOffer() {
        const offerId = getOfferId();
        offer = await $helperStore.getEvent(offerId);
    }

    async function loadPullRequests() {
        pullRequests = await $helperStore.getPullRequests(jobId, getOfferId());
    }

    async function submitPullRequest() {
        await $helperStore.postPullRequest(
            jobId,
            getOfferId(),
            pullRequestUrl,
            accept.pubkey
        );
        pullRequestUrl = ""; // URL zurücksetzen
        await loadPullRequests(); // Aktualisiert die Pull Requests Liste
    }

    async function setPullRequestStatus(pullRequestId, status) {
        await $helperStore.setPullRequestStatus(
            pullRequestId,
            offer.pubKey,
            status
        );
        await loadPullRequests(); // Aktualisiert die Pull Requests Liste
    }

    $: isOwner = offer ? $helperStore.publicKey === offer.pubkey : false;
    $: console.log("isOwner updated:", isOwner);
</script>

{#if accept && offer}
    <div class="pull-request-dialog">
        <!-- Angebot und PR-Einreichung (Nur wenn der Benutzer der Eigentümer des Angebots ist) -->
        {#if $helperStore.publicKey === offer.pubkey}
            <div class="pr-header" />
            <textarea
                class="pr-textarea"
                bind:value={pullRequestUrl}
                placeholder="Enter Pull Request URL"
            />
            <div class="pr-footer">
                <button class="pr-submit" on:click={submitPullRequest}
                    >Submit PR</button
                >
            </div>
        {/if}

        <!-- Angezeigte Pull Requests -->
        {#each pullRequests as pr}
            <div class="pull-request-item">
                <a href={getPullRequestUrl(pr)} target="_blank"
                    >{getPullRequestUrl(pr)}</a
                >
                {#if isOwner}
                    <div class="pr-actions">
                        <button
                            class="pr-accept"
                            on:click={() =>
                                setPullRequestStatus(pr.id, "accepted")}
                            >Accept</button
                        >
                        <button
                            class="pr-decline"
                            on:click={() =>
                                setPullRequestStatus(pr.id, "declined")}
                            >Decline</button
                        >
                    </div>
                {/if}
            </div>
        {/each}

        <p class="pr-date">
            {new Date(accept.created_at * 1000).toLocaleString()}
        </p>
    </div>
{/if}

<style>
    /* Grundlegende Styles für den Dialog */
    .pull-request-dialog {
        background-color: #e7f5ff; /* Ein leichtes Blau */
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    /* Stile für Kopfzeile und Datum */
    .pr-header,
    .pr-date {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        text-align: center;
        width: 100%;
        padding-top: 10px;
        font-size: inherit; /* Erbt die Schriftgröße vom Elternelement */
        color: inherit; /* Erbt die Schriftfarbe vom Elternelement */
    }

    /* Stile für den Textbereich */
    .pr-textarea {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #ddd;
        background-color: #fff;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        resize: none;
    }

    /* Stile für den Fußbereich und den Submit-Button */
    .pr-footer,
    .pr-submit {
        display: flex;
        justify-content: center; /* Zentriert den Button */
        padding-top: 10px;
        background-color: #34c759; /* Ein kräftiges Grün für den Submit-Button */
        color: white;
        border: none;
        padding: 10px 20px;
        margin-top: 10px;
        border-radius: 20px; /* Abgerundete Ecken für den Button */
        cursor: pointer;
        transition: background-color 0.3s, transform 0.2s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .pr-submit:hover {
        background-color: #1b7e32; /* Etwas dunkleres Grün beim Hover */
        transform: translateY(-2px); /* Leichtes Anheben beim Hover */
    }

    /* Stile für Aktionsschaltflächen */
    .pr-actions {
        display: flex;
        justify-content: space-around; /* Gleichmäßige Verteilung */
        padding: 10px;
    }

    .pr-actions button {
        padding: 5px 10px;
        border: none;
        color: white;
        cursor: pointer;
        border-radius: 5px;
        transition: background-color 0.3s;
    }

    .pr-accept {
        background-color: #4caf50; /* Grüner Hintergrund */
    }

    .pr-accept:hover {
        background-color: #43a047; /* Dunkleres Grün beim Hover */
    }

    .pr-decline {
        background-color: #f44336; /* Roter Hintergrund */
    }

    .pr-decline:hover {
        background-color: #e53935; /* Dunkleres Rot beim Hover */
    }

    /* Anpassungen für kleinere Bildschirme */
    @media (max-width: 600px) {
        /* Anpassungen für kleinere Bildschirme hier einfügen */
    }
</style>

