<script>
    import BaseBubble from "./BaseBubble.svelte";
    import { onMount } from "svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import {
        NOSTR_KIND_JOB,
        NOSTR_KIND_IDEA,
    } from "../../constants/nostrKinds";
    import { navigate } from "svelte-routing";

    export let event;

    let jobTitle = "Unbekannter Job";
    let jobDescription = "Keine Beschreibung verfügbar.";
    let jobApprovalStatus = "pending"; // Initialzustand auf 'pending' setzen
    let backgroundColor = "#F5A623"; // Standardfarbe
    let ideaId = "";
    let isIdeaCreator = false; // Zustand, der angibt, ob der aktuelle Benutzer der Ideenersteller ist

    onMount(async () => {
        subscribeToIdea();
        await checkJobApprovalStatus();
        checkIdeaCreator();
    });

    function subscribeToIdea() {
        if ($nostrManager) {
            const ideaIdTag = event.tags.find((tag) => tag[0] === "e");
            ideaId = ideaIdTag ? ideaIdTag[1] : null;

            if (!ideaId) {
                console.error("Keine Ideen-ID im Event gefunden.");
                isIdeaCreator = false;
                return;
            }
            // Eigene Job-Postings
            $nostrManager.subscribeToEvents({
                kinds: [NOSTR_KIND_IDEA],
                ids: [ideaId],
                "#s": ["bitspark"],
            });
        }
    }

    async function checkIdeaCreator() {
        // Extrahiere die Ideen-ID aus den Event-Tags
        const ideaIdTag = event.tags.find((tag) => tag[0] === "e");
        ideaId = ideaIdTag ? ideaIdTag[1] : null;

        if (!ideaId) {
            console.error("Keine Ideen-ID im Event gefunden.");
            isIdeaCreator = false;
            return;
        }

        // Hole das Event, das die Idee repräsentiert, um den Pubkey des Erstellers zu ermitteln
        const ideaEvent = await $nostrCache.getEventById(ideaId);
        if (ideaEvent && $nostrManager.publicKey === ideaEvent.pubkey) {
            isIdeaCreator = true;
        } else {
            isIdeaCreator = false;
        }
    }

    async function checkJobApprovalStatus() {
        const responses = await $nostrCache.getEventsByCriteria({
            kinds: [NOSTR_KIND_JOB],
            tags: {
                e: [event.id],
                t: ["job_approved", "job_declined"],
                s: ["bitspark"],
            },
        });

        // Sortiere die Events nach ihrem Erstellungsdatum in aufsteigender Reihenfolge
        const sortedResponses = responses.sort(
            (a, b) => a.created_at - b.created_at,
        );

        // Filtere die Events, um nur jene zu behalten, die vom Ideen-Ersteller stammen
        const ideaEvent = await $nostrCache.getEventById(
            event.tags.find((tag) => tag[0] === "e")[1],
        );
        const ideaCreatorPubKey = ideaEvent ? ideaEvent.pubkey : null;

        const validResponses = sortedResponses.filter(
            (response) => response.pubkey === ideaCreatorPubKey,
        );

        // Verwende das erste gültige Genehmigungs- oder Ablehnungs-Event
        if (validResponses.length > 0) {
            const firstResponse = validResponses[0]; // Das erste gültige Event
            jobApprovalStatus =
                firstResponse.tags.find((tag) => tag[0] === "t")[1] ===
                "job_approved"
                    ? "approved"
                    : "declined";
        }
        updateColors();
    }

    function updateColors() {
        backgroundColor =
            jobApprovalStatus === "approved"
                ? "#f7931a" // Bitcoin-Orange für "approved"
                : jobApprovalStatus === "declined"
                  ? "#6c8cd5" // Gedämpftes Blau für "declined"
                  : "#9e9e9e"; // Sanftes Grau für "pending"
    }

    async function handleApprovalChange(approval) {
        if (!isIdeaCreator) {
            console.error(
                "Nur der Ideenersteller kann diesen Job genehmigen oder ablehnen.",
            );
            return;
        }

        //const witnessEventString = btoa(JSON.stringify(event));
        const tags = [
            ["e", event.id],
            ["t", approval ? "job_approved" : "job_declined"],
            ["s", "bitspark"],
            //  ["witness", witnessEventString]
        ];

        try {
            jobApprovalStatus = approval ? "approved" : "declined";
            await $nostrManager.sendEvent(
                NOSTR_KIND_JOB,
                jobApprovalStatus,
                tags,
            );
            updateColors();
        } catch (error) {
            console.error("Error changing job approval status:", error);
        }
    }

    $: $nostrCache && checkJobApprovalStatus();
    $: $nostrCache && checkIdeaCreator();

    $: if (event && event.tags) {
        const titleTag = event.tags.find((tag) => tag[0] === "jTitle");
        jobTitle = titleTag ? titleTag[1] : "Unbekannter Job";
        jobDescription = event.content || "Keine Beschreibung verfügbar.";
    }
</script>

<BaseBubble
    {event}
    showRatingButton={false}
    {backgroundColor}
    textColor="#ffffff"
>
    <div class="job-content" on:click={() => navigate(`/idea/${ideaId}`)}>
        <h3>{jobTitle}</h3>
        {@html jobDescription}
        {#if jobApprovalStatus === "pending" && isIdeaCreator}
            <button
                on:click={() => handleApprovalChange(true)}
                class="approve-button">Approve</button
            >
            <button
                on:click={() => handleApprovalChange(false)}
                class="decline-button">Decline</button
            >
        {/if}
    </div>
</BaseBubble>

<style>
    .job-content {
        max-width: 100%;
    }

    .job-content h3 {
        margin-bottom: 5px;
        color: #ffffff;
    }

    .job-content p {
        margin-top: 5px;
        color: #ffffff;
    }

    button {
        margin-top: 10px;
        margin-right: 10px;
        cursor: pointer;
        padding: 8px 16px;
        border: none;
        border-radius: 20px;
        color: #ffffff;
        font-weight: bold;
        transition:
            background-color 0.3s,
            box-shadow 0.3s;
        outline: none;
    }

    button:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    button:active {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    /* Spezifische Farben für Approve und Decline Buttons */
    .approve-button {
        background-color: #f7931a;
    }

    .approve-button:hover,
    .approve-button:focus {
        background-color: #be7113;
    }

    .decline-button {
        background-color: #6c8cd5;
    }

    .decline-button:hover,
    .decline-button:focus {
        background-color: #394a72;
    }
</style>
