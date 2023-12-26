<script>
    import BaseBubble from "./BaseBubble.svelte";
    import { onMount } from "svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";

    export let event;

    let sats = 0;
    let offerMsg = "Kein Text";
    let backgroundColor = "#E8F4FA"; // Ein sanftes Blau
    let textColor = "#333333"; // Dunkelgrau für guten Kontrast
    let satsColor = "#4A90E2"; // Hervorstechendes Blau für Sats
    let acceptButtonColor = "#4CAF50"; // Grün für Akzeptieren
    let declineButtonColor = "#F44336"; // Rot für Ablehnen
    let statusTextColor = "#333333"; // Dunkelgrau für normalen Status
    let isJobCreator = false;
    let offerStatus = "pending"; // "accepted", "declined", "pending"

    async function checkOfferStatus() {
        offerStatus = "pending";
        const responses = $nostrCache.getEventsByCriteria({
            kinds: [1337],
            tags: {
                o: [event.id],
                t: ["ao", "do"],
                s: ["bitspark"],
            },
        });

        console.log("responses:", responses);
        
        if (responses.length > 0) {
            offerStatus =
                responses[0].tags.find((tag) => tag[0] === "t")[1] === "ao"
                    ? "accepted"
                    : "declined";
        }
        console.log("offerStatus:", offerStatus);
    }

    async function handleAccept() {
        await postResponse("ao", "accepted");
    }

    async function handleDecline() {
        await postResponse("do", "declined");
    }

    async function postResponse(responseType, content) {
        if (!$nostrManager || !$nostrManager.write_mode) return;

        const jobId = event.tags.find((tag) => tag[0] === "e")?.[1];
        const offerId = event.id;
        const tags = [
            ["t", responseType],
            ["e", jobId],
            ["o", offerId],
            ["s", "bitspark"],
        ];

        try {
            await $nostrManager.sendEvent(1337, content, tags);
            console.log("Response sent successfully");
        } catch (error) {
            console.error("Error sending response:", error);
        }
    }

    onMount(async () => {
        await checkIfJobCreator();
        await checkOfferStatus();
    });

    async function checkIfJobCreator() {
        const jobId = event.tags.find((tag) => tag[0] === "e")?.[1];
        if (jobId) {
            const jobEvents = $nostrCache.getEventsByCriteria({
                kinds: [1337], // Annahme, dass 1337 das Kind für Job-Postings ist
                ids: [jobId],
                tags: {
                    s: ["bitspark"],
                },
            });

            if (jobEvents.length > 0) {
                const jobEvent = jobEvents[0];
                isJobCreator = jobEvent.pubkey === $nostrManager.publicKey;
                console.log("isJobCreator:", isJobCreator);
            }
        }
    }

    // Reaktive Anweisungen für die Event-Daten
    $: if (event && event.tags) {
        const sats_info = event.tags.find((tag) => tag[0] === "sats");
        sats = sats_info ? sats_info[1] : 0;
    }

    $: if (event) {
        offerMsg = event.content || "Keine Beschreibung verfügbar.";
    }

    // Reaktive Anweisungen
    $: $nostrCache && checkOfferStatus();
    $: backgroundColor = offerStatus === 'accepted' ? '#E8F4FA' : (offerStatus === 'declined' ? '#FDE8E8' : '#F5F5F5');
    $: borderColor = offerStatus === 'accepted' ? '#76C79E' : (offerStatus === 'declined' ? '#F28482' : '#FFAD60');
    $: textColor = '#333333'; // Dunkelgrau für guten Kontrast
    $: satsColor = '#34568B'; // Dunkelblau für Sats
    $: acceptButtonColor = '#76C79E'; // Grün für Akzeptieren
    $: declineButtonColor = '#F28482'; // Rot für Ablehnen
    $: statusTextColor = '#FFFFFF'; // Weiß für Status-Text

    //$: $nostrManager && initialize();
</script>
<BaseBubble {event} {backgroundColor} {textColor} {borderColor} {status}>
    <div class="offer-content">
        <h3 class="sats-amount" style="color: {satsColor};">{sats} Sats</h3>
        <p class="offer-msg">{offerMsg}</p>
        {#if isJobCreator && offerStatus === "pending"}
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
