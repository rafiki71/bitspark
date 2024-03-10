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
    import { nostrJobManager } from "../../backend/NostrJobManager.js";

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
        nostrJobManager.subscribeIdea(ideaId);
    }

    async function checkIdeaCreator() {
        const ideaIdTag = event.tags.find((tag) => tag[0] === "e");
        ideaId = ideaIdTag ? ideaIdTag[1] : null;

        if (!ideaId) {
            isIdeaCreator = false;
            return;
        }

        isIdeaCreator = await nostrJobManager.isCreator(
            ideaId,
            $nostrManager.publicKey,
        );
    }

    async function checkJobApprovalStatus() {
        // console.log("ideaId:", ideaId);
        jobApprovalStatus = await nostrJobManager.getJobApprovalStatus(
            event.id,
        );
        updateColors();
    }

    function updateColors() {
        backgroundColor =
            jobApprovalStatus === "job_approved"
                ? "#f7931a" // Bitcoin-Orange für "approved"
                : jobApprovalStatus === "job_declined"
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

        nostrJobManager.setApprovalStatus(event.id, approval);
    }

    $: $nostrCache && checkJobApprovalStatus();
    $: $nostrCache && checkIdeaCreator();
    $: $nostrManager && subscribeToIdea();

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
    <!-- svelte-ignore a11y-click-events-have-key-events -->
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
