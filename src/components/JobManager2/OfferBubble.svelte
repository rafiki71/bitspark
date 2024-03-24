<script>
    import BaseBubble from "./BaseBubble.svelte";
    import { onMount } from "svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import { nostrJobManager } from "../../backend/NostrJobManager.js";

    export let event;

    let sats = 0;
    let offerMsg = "No Message";
    let reqTime = "No required time";
    let backgroundColor = "#E8F4FA"; // Ein sanftes Blau
    let textColor = "#333333"; // Dunkelgrau für guten Kontrast
    let satsColor = "#4A90E2"; // Hervorstechendes Blau für Sats
    let acceptButtonColor = "#4CAF50"; // Grün für Akzeptieren
    let declineButtonColor = "#F44336"; // Rot für Ablehnen
    let statusTextColor = "#333333"; // Dunkelgrau für normalen Status
    let isJobCreator = false;
    let isJobApproved = false;
    let offerStatus = "pending"; // "accepted", "declined", "pending"

    async function checkOfferStatus() {
        offerStatus = await nostrJobManager.checkOfferStatus(event.id);
    }

    async function handleAccept() {
        await nostrJobManager.setOfferApprovalStatus(event.id, true);
    }
    
    async function handleDecline() {
        await nostrJobManager.setOfferApprovalStatus(event.id, false);
    }

    onMount(async () => {
        await checkIfJobCreator();
        await checkIfJobApproved();
        await checkOfferStatus();
    });

    async function checkIfJobApproved() {
        const jobId = event.tags.find((tag) => tag[0] === "e")?.[1];
        isJobApproved = await nostrJobManager.getJobApprovalStatus(jobId) === "job_approved" ;
    }
    
    async function checkIfJobCreator() {
        const jobId = event.tags.find((tag) => tag[0] === "e")?.[1];
        isJobCreator = await nostrJobManager.isCreator(jobId, $nostrManager.publicKey)
    }

    function formatReqTime(time) {
        if (!time || time === "No required time") {
            return `<span class="time-default">Keine Zeitangabe</span>`;
        }
        return `<span class="time-value"><i class="fas fa-clock"></i> ${time}</span>`;
    }

    // Reaktive Anweisungen für die Event-Daten
    $: if (event && event.tags) {
        const sats_info = event.tags.find((tag) => tag[0] === "sats");
        sats = sats_info ? sats_info[1] : 0;
    }

    $: if (event) {
        offerMsg = event.content || "Keine Beschreibung verfügbar.";
        reqTime =
            event.tags.find((tag) => tag[0] === "reqTime")?.[1] ||
            "No required time";
    }

    // Reaktive Anweisungen
    $: $nostrCache && checkOfferStatus() && checkIfJobApproved();
    $: backgroundColor =
        offerStatus === "accepted"
            ? "#E8F4FA"
            : offerStatus === "declined"
              ? "#FDE8E8"
              : "#F5F5F5";
    $: borderColor =
        offerStatus === "accepted"
            ? "#76C79E"
            : offerStatus === "declined"
              ? "#F28482"
              : "#FFAD60";
    $: textColor = "#333333"; // Dunkelgrau für guten Kontrast
    $: satsColor = "#34568B"; // Dunkelblau für Sats
    $: acceptButtonColor = "#76C79E"; // Grün für Akzeptieren
    $: declineButtonColor = "#F28482"; // Rot für Ablehnen
    $: statusTextColor = "#FFFFFF"; // Weiß für Status-Text

    //$: $nostrManager && initialize();
</script>

<BaseBubble {event} {backgroundColor} {textColor} {borderColor} {status}>
    <div class="offer-content">
        <h3 class="sats-amount" style="color: {satsColor};">{sats} Sats</h3>
        <p class="offer-time">{@html formatReqTime(reqTime)}</p>
        <p class="offer-msg">{offerMsg}</p>
        {#if isJobApproved && isJobCreator && offerStatus === "pending"}
            <div class="offer-actions">
                <button
                    on:click={handleAccept}
                    style="background-color: {acceptButtonColor};"
                    >Accept</button
                >
                <button
                    on:click={handleDecline}
                    style="background-color: {declineButtonColor};"
                    >Decline</button
                >
            </div>
        {/if}
    </div>
</BaseBubble>

<style>
    .offer-time {
        margin-top: 0;
        line-height: 1.4;
    }

    .time-value {
        color: #4a90e2; /* Farbe des Textes */
        font-weight: bold;
    }

    .time-value i {
        margin-right: 5px;
    }

    .time-default {
        color: #777; /* Farbe für 'Keine Zeitangabe' */
    }

    .offer-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 10px;
    }

    .sats-amount {
        font-weight: bold;
        margin-bottom: 5px;
    }

    .offer-msg {
        margin-top: 0;
        line-height: 1.4;
    }

    .offer-actions button {
        padding: 5px 10px;
        border: none;
        color: white;
        border-radius: 4px;
        margin-right: 10px;
        cursor: pointer;
        font-weight: bold;
    }
</style>
