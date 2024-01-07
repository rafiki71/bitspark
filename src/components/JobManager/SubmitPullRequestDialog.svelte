<!-- SubmitPullRequestDialog.svelte -->
<script>
    import { helperStore } from "../../helperStore.js";
    export let accept;
    export let jobId;
    let pullRequestUrl = "";

    async function submitPullRequest() {
        await helperStore.postPullRequest(
            jobId,
            getOfferId(),
            pullRequestUrl,
            accept.pubkey
        );
        pullRequestUrl = ""; // URL zurücksetzen
    }

    function getOfferId() {
        return accept.tags.find((tag) => tag[0] === "o")[1];
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
        <span class="offer-date">
            {new Date(accept.created_at * 1000).toLocaleString()}
        </span>
    </div>
{/if}

<style>
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

    /* Grundlegende Styles für den Dialog */
    .pull-request-dialog {
        background-color: #e7f5ff; /* Ein leichtes Blau */
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

    /* Anpassungen für kleinere Bildschirme */
    @media (max-width: 600px) {
        /* Anpassungen für kleinere Bildschirme hier einfügen */
    }
</style>
