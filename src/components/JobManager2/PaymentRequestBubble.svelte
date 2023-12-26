<!-- PaymentRequestBubble.svelte -->
<script>
    import BaseBubble from "./BaseBubble.svelte";
    import { onMount } from "svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { sendZap } from "../../LNHelper.js"; // Importieren Sie die sendZap Funktion

    export let event;
    let offerEvent = null;
    let offerCreatorProfile = null;
    let satsAmount = 0;
    let lnAddress = "";
    let zaps = [];

    $: if ($nostrCache && offerEvent) {
        fetchZaps();
    }

    $: if ($nostrCache) {
        const offerId = event.tags.find((tag) => tag[0] === "o")?.[1];
        if (offerId) {
            loadOfferEvent(offerId);
        }
    }

    $: offerEvent, loadOfferCreatorProfile();

    async function fetchZaps() {
        const offerId = offerEvent.id;
        zaps = $nostrCache.getEventsByCriteria({
            kinds: [9734], // Annahme, dass 9734 das Kind für Zap-Events ist
            tags: { e: [offerId] },
        });

        // Konsolenausgabe zur Überprüfung, ob Zaps gefunden wurden
        console.log("Gefundene Zaps für das Angebot:", zaps);
    }

    onMount(async () => {
        const offerId = event.tags.find((tag) => tag[0] === "o")?.[1];
        if (offerId) {
            await loadOfferEvent(offerId);
        }
    });

    async function loadOfferEvent(offerId) {
        offerEvent = $nostrCache.getEventById(offerId);
        satsAmount = offerEvent.tags.find((tag) => tag[0] === "sats")?.[1] || 0;
    }

    async function loadOfferCreatorProfile() {
        if (offerEvent) {
            const profileEvents = $nostrCache.getEventsByCriteria({
                kinds: [0],
                authors: [offerEvent.pubkey],
            });

            if (profileEvents.length > 0) {
                profileEvents.sort((a, b) => b.created_at - a.created_at);
                offerCreatorProfile = profileEvents[0].profileData;
                lnAddress = offerCreatorProfile.lud16 || "No LN Address";
            }
        }
    }

    function handleSendSats() {
        // Hier rufen Sie sendZap statt sendSatsLNurl auf
        if (lnAddress && satsAmount > 0) {
            console.log("offerEvent.id:", offerEvent.id);
            sendZap(
                lnAddress,
                satsAmount,
                "Zahlung für Angebot",
                ["wss://relay.damus.io", "wss://relay.plebstr.com"],
                offerEvent.id,
            )
                .then((response) => {
                    console.log(
                        "Zap erfolgreich gesendet, Preimage:",
                        response.preimage,
                    );
                })
                .catch((error) => {
                    console.error("Fehler beim Senden des Zaps:", error);
                });
        } else {
            console.error("Keine gültige Lightning-Adresse oder Sats-Menge");
        }
    }
</script>

<BaseBubble {event} backgroundColor="#ffeb7a" textColor="#333333">
    <div class="payment-request-content">
        <p class="sats-amount">{satsAmount} Sats requested</p>
        <button class="send-sats-button" on:click={handleSendSats}>
            <i class="fas fa-bolt"></i> Send Sats
        </button>
    </div>
</BaseBubble>

<style>
    .payment-request-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 10px;
        border-radius: 8px;
    }

    .sats-amount {
        font-size: 1.2rem;
        margin-bottom: 10px;
    }

    .send-sats-button {
        background-color: #fcd535;
        color: #333;
        border: none;
        padding: 10px 15px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        font-weight: bold;
    }

    .send-sats-button i {
        margin-right: 5px;
    }
</style>
