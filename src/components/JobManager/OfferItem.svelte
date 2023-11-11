<script>
    export let offer;
    export let selectJob;
    export let acceptOffer;
    export let declineOffer;
    export let isOwnJob;

    let showRejectionModal = false;
    let rejectionReason = "";

    function handleDecline(event) {
        if (rejectionReason.trim() !== "") {
            // Überprüft, ob ein Grund angegeben wurde
            declineOffer(offer.id, event, rejectionReason);
            showRejectionModal = false; // Schließt das Modal
            rejectionReason = ""; // Setzt den Ablehnungsgrund zurück
        } else {
            // Optional: Benachrichtigung, dass ein Ablehnungsgrund angegeben werden muss.
        }
    }

    function openRejectionModal(event) {
        showRejectionModal = true;
        event.stopPropagation();
    }

    function closeRejectionModal(event) {
        showRejectionModal = false;
        event.stopPropagation();
    }
</script>

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
    </div>
    <div class="offer-footer">
        <div class="footer-content">
            <span class="offer-date"
                >{new Date(offer.created_at * 1000).toLocaleString()}</span
            >
        </div>
        {#if isOwnJob && offer.status === "pending"}
            <div class="footer-actions">
                <button
                    class="offer-button accept"
                    on:click={(event) => {
                        acceptOffer(offer.id, event, "");
                        event.stopPropagation();
                    }}
                >
                    <i class="fas fa-check" />
                </button>
                <button
                    class="offer-button decline"
                    on:click={openRejectionModal}
                >
                    <i class="fas fa-times" />
                </button>
            </div>
        {/if}
    </div>
</div>

{#if showRejectionModal}
    <div class="modal-overlay" on:click={closeRejectionModal}>
        <div class="rejection-modal" on:click|stopPropagation>
            <textarea
                bind:value={rejectionReason}
                placeholder="Rejection reason"
            />
            <div class="modal-actions">
                <button on:click={handleDecline}>Submit</button>
                <button on:click={closeRejectionModal}>Cancel</button>
            </div>
        </div>
    </div>
{/if}

<style>
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
        justify-content: space-between;
        border-top: 1px solid #eee;
        padding-top: 10px;
        margin-top: 10px;
    }

    .footer-content {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px; /* Abstand zwischen Datum und Buttons */
    }

    .footer-actions {
        display: flex;
        justify-content: center; /* Zentriert die Buttons horizontal */
        width: 100%; /* Stellt sicher, dass die Buttons die volle Breite einnehmen */
        gap: 10px;
    }

    .offer-footer .offer-date {
        font-size: 0.9em;
        color: #999;
    }

    .offer-actions {
        display: flex;
        gap: 10px;
    }

    .offer-button {
        border: 0;
        outline: none;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 0.9em;
        transition: background-color 0.3s;
    }

    .offer-button.accept {
        color: white;
        background-color: #4caf50;
    }

    .offer-button.accept:hover {
        background-color: #388e3c;
    }

    .offer-button.decline {
        color: white;
        background-color: #f44336;
    }

    .offer-button.decline:hover {
        background-color: #d32f2f;
    }

    .offer.accepted {
        background-color: #e8f5e9; /* helles Grün für angenommene Angebote */
    }

    .offer.declined {
        background-color: #ffebee; /* helles Rot für abgelehnte Angebote */
    }

    .offer.pending {
        background-color: #fff9c4; /* helles Gelb für anstehende Angebote */
    }

    .offer-reason {
        margin-top: 10px;
        padding: 10px;
        background-color: #f7f7f7; /* Hintergrundfarbe für den Bereich Grund */
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-style: italic; /* Kursiv macht es ein wenig subtiler */
        color: #666; /* Dunkelgraue Textfarbe */
    }

    .offer-reason i {
        color: #999; /* Icon-Farbe */
    }
</style>
