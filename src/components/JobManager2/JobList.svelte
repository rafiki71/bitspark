<script>
    import { onMount, onDestroy } from 'svelte';
    import { nostrCache } from '../../backend/NostrCacheStore.js';
    import { nostrManager } from '../../backend/NostrManagerStore.js';
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
    let jobs = [];

    // Methode zum Abonnieren von Job-Events
    function subscribeToJobs() {
        if($nostrManager && $nostrManager.publicKey) {
            $nostrManager.subscribeToEvents({
                kinds: [1337], // Annahme: Kind 1337 für Job-Postings
                authors: [$nostrManager.publicKey],
                "#s": ["bitspark"]
            });
        }
    }

    // Methode zum Abrufen von Jobs aus dem Cache
    function fetchJobs() {
        if($nostrCache && $nostrManager && $nostrManager.publicKey) {
            jobs = $nostrCache.getEventsByCriteria({
                kinds: [1337], // Annahme: Kind 1337 für Job-Postings
                authors: [$nostrManager.publicKey],
                tags: {s: ["bitspark"]}
            });
        }
    }

    onMount(() => {
        if ($nostrManager) {
            subscribeToJobs();
        }
    });

    onDestroy(() => {
        $nostrManager.unsubscribeAll();
    });

    function selectJob(job) {
        dispatch('selectJob', { job });
    }

    // Reaktive Anweisungen
    $: $nostrManager, subscribeToJobs();
    $: $nostrCache, fetchJobs();
</script>

<div class="job-list">
    {#each jobs as job}
        <div class="job-item" on:click={() => selectJob(job)}>
            {job.tags.find((tag) => tag[0] === "jTitle")[1]}
        </div>
    {/each}
</div>

<style>
    /* CSS-Stile für die Job-Liste */
</style>
