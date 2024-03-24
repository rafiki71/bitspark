<!-- PRBubble.svelte -->
<script>
    import BaseBubble from "./BaseBubble.svelte";
    import { onMount } from "svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import { nostrJobManager } from "../../backend/NostrJobManager.js";

    export let event;
    let prUrl = "";
    let jobId = null;
    let isJobCreator = false;
    let prStatus = "pending"; // "accepted", "declined", "pending"
    let jobEvent = null;
    let offerID = null;

    onMount(async () => {
        offerID = event.tags.find((tag) => tag[0] === "o")?.[1] || "";
        prUrl = event.tags.find((tag) => tag[0] === "pr_url")?.[1] || "No URL";
        jobId = event.tags.find((tag) => tag[0] === "e")?.[1];
        if (jobId) {
            await loadJobEvent();
            checkIfJobCreator();
        }

        await checkPRStatus();
    });

    async function loadJobEvent() {
        jobEvent = await nostrJobManager.loadJobEvent(jobId);
    }

    async function checkIfJobCreator() {
        if (jobEvent && $nostrManager.publicKey) {
            isJobCreator = await nostrJobManager.isCreator(
                jobEvent.id,
                $nostrManager.publicKey,
            );

        }
    }

    async function checkPRStatus() {
        prStatus = await nostrJobManager.getPRStatus(event.id);
        console.log("prStatus:", prStatus);
    }

    async function handlePRResponse(responseType) {
        if (!$nostrManager) return;

        try {
            await nostrJobManager.handlePRResponse(event.id, responseType);
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

<BaseBubble
    {event}
    backgroundColor={prStatus === "accepted"
        ? "#E8F4FA"
        : prStatus === "declined"
          ? "#FDE8E8"
          : "#F5F5F5"}
    textColor="#333333"
>
    <div class="pr-content">
        <a href={prUrl} target="_blank">{prUrl}</a>
        {#if isJobCreator && prStatus === "pending"}
            <div class="pr-actions">
                <button
                    on:click={() => handlePRResponse(true)}
                    class="accept-button">Accept</button
                >
                <button
                    on:click={() => handlePRResponse(false)}
                    class="decline-button">Decline</button
                >
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
        color: #4a90e2;
        text-decoration: none;
    }

    .pr-actions {
        display: flex;
        margin-top: 10px;
    }

    .accept-button,
    .decline-button {
        padding: 5px 10px;
        border: none;
        color: white;
        border-radius: 4px;
        margin-right: 10px;
        cursor: pointer;
        font-weight: bold;
    }

    .accept-button {
        background-color: #76c79e;
    }

    .decline-button {
        background-color: #f28482;
    }
</style>
