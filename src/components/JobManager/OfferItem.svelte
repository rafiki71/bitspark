<!-- OfferItem.svelte -->
<script>
    export let offer;
    export let selectJob;
    export let acceptOffer;
    export let declineOffer;
    export let isOwnJob;

    let rejectionReason = "";

    function handleAction(action, event) {
        event.stopPropagation();
        if (action === "accept") {
            acceptOffer(offer.id, event, rejectionReason);
        } else if (action === "decline") {
            declineOffer(offer.id, event, rejectionReason);
        }
        rejectionReason = ""; // Setzt den Grund zurück, unabhängig von der Aktion
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if offer}
    <div class={`offer ${offer.status}`} on:click={() => selectJob(offer)}>
        <div class="offer-content">
            <p>{offer.content}</p>
            <p class="sats">
                {offer.tags.find((tag) => tag[0] === "sats")[1]} sats
            </p>
            {#if offer.status === "accepted" || offer.status === "declined"}
                <div class="offer-reason">
                    <i class="fas fa-info-circle" title="Reason" />
                    {offer.reason}
                </div>
            {/if}
            {#if isOwnJob && offer.status === "pending"}
                <textarea
                    class="textarea-action"
                    bind:value={rejectionReason}
                    placeholder="Add a note (optional)"
                    on:click|stopPropagation
                />
            {/if}
        </div>
        <div class="offer-footer">
            {#if isOwnJob && offer.status === "pending"}
                <div class="footer-actions">
                    <button
                        class="offer-button accept"
                        on:click={(event) => handleAction("accept", event)}
                    >
                        <i class="fas fa-check" /> Accept
                    </button>
                    <button
                        class="offer-button decline"
                        on:click={(event) => handleAction("decline", event)}
                    >
                        <i class="fas fa-times" /> Decline
                    </button>
                </div>
            {/if}
            <span class="offer-date">
                {new Date(offer.created_at * 1000).toLocaleString()}
            </span>
        </div>
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

    .offer {
        margin-bottom: 20px;
        padding: 20px;
        border-radius: 8px;
        max-width: 100%;
        background-color: #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .offer.accepted {
        background-color: #e8f5e9; /* Helles Grün für angenommene Angebote */
    }

    .offer.declined {
        background-color: #ffebee; /* Helles Rot für abgelehnte Angebote */
    }

    .offer.pending {
        background-color: #fffde7; /* Helles Gelb für anstehende Angebote */
    }

    .offer-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .offer-content p {
        margin: 0;
        color: #333;
        font-size: 1rem;
    }

    .offer-content .sats {
        font-weight: bold;
        color: #4caf50;
    }

    .offer-footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        border-top: 1px solid #eee;
        padding-top: 10px;
        gap: 10px;
    }
    .footer-actions {
        display: flex;
        gap: 10px;
        width: 100%;
        justify-content: center;
    }

    .offer-button.submit-rejection {
        background-color: #ff9800; /* Orange für den Ablehnungs-Submit-Button */
    }
    .offer-button.submit-rejection:hover {
        background-color: #fb8c00;
    }

    .textarea-action {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #ddd;
        margin-top: 10px;
        background-color: #f9f9f9; /* Leichter Hintergrund */
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1); /* Subtiler innerer Schatten */
        resize: none; /* Verhindert, dass der Benutzer die Größe ändert */
    }

    .textarea-rejection {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #ddd;
        margin-top: 10px; /* Platz über dem Textfeld */
    }

    /* Media Query für kleinere Bildschirme */
    @media (max-width: 600px) {
        .offer {
            padding: 15px;
        }

        .offer-content p,
        .offer-content .sats {
            font-size: 0.9rem;
        }

        .offer-button {
            padding: 6px 12px;
            font-size: 0.8em;
        }
    }
</style>
