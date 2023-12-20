<!-- JobList.svelte -->
<script>
    import { onMount, onDestroy } from 'svelte';
    import { nostrCache } from '../../backend/NostrCacheStore.js';
    import { nostrManager } from '../../backend/NostrManagerStore.js';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    let jobs = [];
    let jobIdsFromOffers = new Set();

    // Abonnieren von eigenen Job-Postings und Offers
    function subscribeToJobsAndOffers() {
        if ($nostrManager && $nostrManager.publicKey) {
            // Eigene Job-Postings
            $nostrManager.subscribeToEvents({
                kinds: [1337],
                authors: [$nostrManager.publicKey],
                "#t": ["job"],
                "#s": ["bitspark"]
            });

            // Eigene Offers
            $nostrManager.subscribeToEvents({
                kinds: [1337], // Kind für Offers
                authors: [$nostrManager.publicKey],
                "#t": ["offer"],
                "#s": ["bitspark"]
            });
        }
    }

    // Abrufen von Jobs und Offers aus dem Cache
    function fetchJobsAndOffers() {
        if ($nostrCache && $nostrManager && $nostrManager.publicKey) {
            // Jobs abrufen
            jobs = $nostrCache.getEventsByCriteria({
                kinds: [1337],
                authors: [$nostrManager.publicKey],
                tags: {s: ["bitspark"]}
            });

            // Offers abrufen und Job-IDs extrahieren
            const offers = $nostrCache.getEventsByCriteria({
                kinds: [2],
                authors: [$nostrManager.publicKey],
                tags: {t: ["offer"]}
            });
            offers.forEach(offer => {
                const jobIdTag = offer.tags.find(tag => tag[0] === 'e');
                if (jobIdTag) {
                    jobIdsFromOffers.add(jobIdTag[1]);
                }
            });

            // Jobs für extrahierte Job-IDs abonnieren
            jobIdsFromOffers.forEach(jobId => {
                $nostrManager.subscribeToEvents({
                    kinds: [1337],
                    ids: [jobId],
                    "#s": ["bitspark"]
                });
            });

            // Jobs für extrahierte Job-IDs aus dem Cache abrufen
            jobIdsFromOffers.forEach(jobId => {
                const job = $nostrCache.getEventById(jobId);
                if (job) {
                    jobs.push(job);
                }
            });
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
        dispatch('selectJob', { job });
    }

    // Reaktive Anweisungen
    $: $nostrManager, subscribeToJobsAndOffers();
    $: $nostrCache, fetchJobsAndOffers();
</script>

<div class="job-list">
    {#each jobs as job}
        <div class="job-item" on:click={() => selectJob(job)}>
            {job.tags.find(tag => tag[0] === "jTitle")?.[1] || "Unbekannter Job"}
        </div>
    {/each}
</div>

<style>
   .job-list {
    max-height: calc(100vh - 120px); /* Maximalhöhe basierend auf der Höhe des Viewports und des Headers */
    width: 30%;
    border-right: 2px solid #e0e0e0;
    box-sizing: border-box;
    padding: 15px;
    overflow-y: auto; /* Ermöglicht Scrollen innerhalb der Liste */
}

.job-item {
    padding: 10px 15px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    transition: background-color 0.3s, color 0.3s;
    display: flex;
    align-items: center;
    gap: 10px;
}

.job-item:hover {
    background-color: #f5f5f5;
    color: #333;
}

</style>
