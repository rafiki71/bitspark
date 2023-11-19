<script>
    import { helperStore } from "../../helperStore.js";
    export let accept;
    export let jobId;
    let pullRequestUrl = "";

    function getOfferId() {
        return accept.tags.find((tag) => tag[0] === "o")[1];
    }

    async function submitPullRequest() {
        const offerId = getOfferId();
        await $helperStore.postPullRequest(
            jobId,
            offerId,
            pullRequestUrl,
            accept.pubkey
        );
        console.log("Pull Request submitted:", pullRequestUrl);
        pullRequestUrl = ""; // URL zurücksetzen
    }
</script>

{#if accept}
    <div class="pull-request-dialog">
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
        <p class="pr-date">
            {new Date(accept.created_at * 1000).toLocaleString()}
        </p>
    </div>
{/if}

<style>
    .pull-request-dialog {
        background-color: #e7f5ff; /* Ein leichtes Blau, das Ruhe und Vertrauen ausstrahlt */
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .pr-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .pr-date {
        font-size: inherit; /* Erbt die Schriftgröße vom Elternelement */
        color: inherit; /* Erbt die Schriftfarbe vom Elternelement */
        text-align: center;
        margin-top: 10px;
        width: 100%;
        padding-top: 10px;
        border-top: 1px solid #eee;
    }

    .pr-textarea {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #ddd;
        background-color: #fff;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        resize: none;
    }

    .pr-footer {
        display: flex;
        justify-content: center; /* Zentriert den Button */
        padding-top: 10px;
    }

    .pr-submit {
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

    /* Media Query für kleinere Bildschirme */
    @media (max-width: 600px) {
        /* Stile unverändert */
    }
</style>
