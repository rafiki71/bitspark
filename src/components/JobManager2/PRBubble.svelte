<!-- PRBubble.svelte -->
<script>
    import BaseBubble from "./BaseBubble.svelte";
    import { onMount } from "svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";

    export let event;
    let prUrl = "";
    let isJobCreator = false;
    let prStatus = "pending"; // "accepted", "declined", "pending"
    let jobEvent = null;
    let offerID = null;

    onMount(async () => {
        offerID = event.tags.find(tag => tag[0] === 'o')?.[1] || "";
        prUrl = event.tags.find(tag => tag[0] === 'pr_url')?.[1] || "No URL";
        const jobId = event.tags.find(tag => tag[0] === 'e')?.[1];
        if (jobId) {
            await loadJobEvent(jobId);
            checkIfJobCreator();
        }

        await checkPRStatus();
    });

    async function loadJobEvent(jobId) {
        jobEvent = $nostrCache.getEventById(jobId);
    }

    function checkIfJobCreator() {
        if (jobEvent && $nostrManager.publicKey) {
            isJobCreator = jobEvent.pubkey === $nostrManager.publicKey;
        }
    }

    async function checkPRStatus() {
        // Logik zum Überprüfen des PR-Status
        const responses = $nostrCache.getEventsByCriteria({
            kinds: [1337],
            tags: {
                e: [jobEvent.id],
                pr: [event.id],
                o: [offerID],
                t: ["apr", "dpr"],
            },
        });

        if (responses.length > 0) {
            prStatus = responses[0].tags.find(tag => tag[0] === 't')[1] === "apr" ? "accepted" : "declined";
        }
    }

    async function handlePRResponse(responseType) {
        if (!$nostrManager) return;

        const tags = [
            ["s", "bitspark"], // "apr" für Akzeptanz, "dpr" für Ablehnung
            ["t", responseType], // "apr" für Akzeptanz, "dpr" für Ablehnung
            ["o", offerID], // "apr" für Akzeptanz, "dpr" für Ablehnung
            ["e", jobEvent.id],
            ["pr", event.id]
        ];

        try {
            await $nostrManager.sendEvent(1337, "PR status update", tags);
            console.log("PR Response sent successfully");
        } catch (error) {
            console.error("Error sending PR response:", error);
        }
    }

    $: {
        if ($nostrCache && jobEvent) {
            checkPRStatus();
        }
    }
</script>

<BaseBubble {event} backgroundColor={prStatus === 'accepted' ? '#E8F4FA' : (prStatus === 'declined' ? '#FDE8E8' : '#F5F5F5')} textColor="#333333">
    <div class="pr-content">
        <a href={prUrl} target="_blank">{prUrl}</a>
        {#if isJobCreator && prStatus === "pending"}
            <div class="pr-actions">
                <button on:click={() => handlePRResponse('apr')} class="accept-button">Accept</button>
                <button on:click={() => handlePRResponse('dpr')} class="decline-button">Decline</button>
            </div>
        {/if}
    </div>
</BaseBubble>

<style>
    .pr-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 10px;
    }

    .pr-content a {
        color: #4A90E2;
        text-decoration: none;
    }

    .pr-actions {
        display: flex;
        margin-top: 10px;
    }

    .accept-button, .decline-button {
        padding: 5px 10px;
        border: none;
        color: white;
        border-radius: 4px;
        margin-right: 10px;
        cursor: pointer;
        font-weight: bold;
    }

    .accept-button {
        background-color: #76C79E;
    }

    .decline-button {
        background-color: #F28482;
    }
</style>
