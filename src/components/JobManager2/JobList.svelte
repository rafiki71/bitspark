<!-- JobList.svelte -->
<script>
    import { onMount, onDestroy } from "svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import { createEventDispatcher } from "svelte";
    import { nostrJobManager } from "../../backend/NostrJobManager.js";

    const dispatch = createEventDispatcher();
    let jobs = [];

    // Abonnieren von eigenen Job-Postings und Offers
    async function subscribeToJobsAndOffers() {
        if ($nostrManager && $nostrManager.publicKey) {
            nostrJobManager.subscribeUserRelatedJobs($nostrManager.publicKey);
        }
    }

    // Abrufen von Jobs und Offers aus dem Cache
    async function fetchJobsAndOffers() {
        if ($nostrCache && $nostrManager && $nostrManager.publicKey) {
            jobs = await nostrJobManager.fetchUserRelatedJobs($nostrManager.publicKey)
        }
    }

    onMount(() => {
        if ($nostrManager) {
            subscribeToJobsAndOffers();
        }
    });

    onDestroy(() => {
        $nostrManager.unsubscribeAll();
    });

    function selectJob(job) {
        dispatch("selectJob", { job });
    }

    // Reaktive Anweisungen
    $: $nostrManager, subscribeToJobsAndOffers();
    $: $nostrCache, fetchJobsAndOffers();
</script>

<div class="job-list">
    {#each jobs as job}
        <div class="job-item" on:click={() => selectJob(job)}>
            {job.tags.find((tag) => tag[0] === "jTitle")?.[1] ||
                "Unbekannter Job"}
        </div>
    {/each}
</div>

<style>
    .job-list {
        max-height: 100%; /* Begrenzt auf die Höhe des übergeordneten Containers */
        overflow-y: auto; /* Ermöglicht Scrollen innerhalb der Komponente */
    }

    .job-item {
        padding: 10px 15px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
        transition:
            background-color 0.3s,
            color 0.3s;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .job-item:hover {
        background-color: #f5f5f5;
        color: #333;
    }
</style>
