<!-- PaymentRequestBubble.svelte -->
<script>
    import BaseBubble from "./BaseBubble.svelte";
    import { onMount } from "svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import { socialMediaManager } from "../../backend/SocialMediaManager.js";
    import { zapManager } from "../../backend/ZapManager.js";
    import { sendZap } from "../../LNHelper.js"; // Importieren Sie die sendZap Funktion
    import { nostrJobManager } from "../../backend/NostrJobManager";

    export let event;
    let offerEvent = null;
    let offerCreatorProfile = null;
    let satsAmount = 0;
    let lnAddress = "";
    let totalReceivedSats = 0;
    let progressPercentage = 0;

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
        totalReceivedSats = await zapManager.getTotalZaps(offerEvent.id)
        updateProgress();
    }

    function updateProgress() {
        progressPercentage = (totalReceivedSats / satsAmount) * 100;
        if (progressPercentage > 100) {
            progressPercentage = 100; // Begrenzen Sie den Fortschritt auf 100%
        }
    }

    onMount(async () => {
        const offerId = event.tags.find((tag) => tag[0] === "o")?.[1];
        if (offerId) {
            await zapManager.subscribeZaps(offerId);
            await loadOfferEvent(offerId);
            fetchZaps();
        }
    });

    async function loadOfferEvent(offerId) {
        offerEvent = await nostrJobManager.loadOffer(offerId);
        satsAmount = offerEvent.tags.find((tag) => tag[0] === "sats")?.[1] || 0;
    }

    async function loadOfferCreatorProfile() {
        if (offerEvent) {
            offerCreatorProfile = await socialMediaManager.getProfile(offerEvent.pubkey);
            lnAddress = offerCreatorProfile.lud16 || "";
        }
    }

    function handleSendSats() {
        // Hier rufen Sie sendZap statt sendSatsLNurl auf
        if (lnAddress && satsAmount > 0) {
            sendZap(
                lnAddress,
                satsAmount,
                "Zahlung für Angebot", $nostrManager.relays,
                offerEvent.id,
            )
                .then((response) => {
                    console.log("Zapped");
                })
                .catch((error) => {
                    console.error("Fehler beim Senden des Zaps:", error);
                });
        } else {
            console.error("Keine gültige Lightning-Adresse oder Sats-Menge");
        }
    }
</script>

<BaseBubble {event} backgroundColor="#fddb3a" textColor="#000">
    <div class="payment-request-content">
        <p class="sats-amount">{satsAmount} Sats requested</p>
        <button class="send-sats-button" on:click={handleSendSats}>
            <i class="fas fa-bolt"></i> Send Sats
        </button>
        <div class="progress-bar">
            <div class="progress" style="width: {progressPercentage}%;"></div>
        </div>
    </div>
</BaseBubble>

<style>
    .progress-bar {
        width: 100%;
        background-color: #000;
        border-radius: 5px;
        margin-top: 10px;
        overflow: hidden;
    }

    .progress {
        height: 10px;
        background: repeating-linear-gradient(
            45deg,
            #ffd700,
            #ffd700 10px,
            #ffeb3b 10px,
            #ffeb3b 20px
        );
        border-radius: 5px;
        animation: progressAnimation 2s infinite linear;
    }

    @keyframes progressAnimation {
        0% { background-position: 0 0; }
        100% { background-position: 40px 0; }
    }

    .payment-request-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 10px;
        border-radius: 8px;
        background-color: #fddb3a;
    }

    .sats-amount {
        font-size: 1.2rem;
        margin-bottom: 10px;
        color: #000;
    }

    .send-sats-button {
        background-color: #000;
        color: #fddb3a;
        border: none;
        padding: 10px 15px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        font-weight: bold;
        transition: background-color 0.3s, color 0.3s;
    }

    .send-sats-button:hover {
        background-color: #fddb3a;
        color: #000;
    }

    .send-sats-button i {
        margin-right: 5px;
    }
</style>