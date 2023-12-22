<!-- JobChat.svelte -->
<script>
  import JobBubble from "./JobBubble.svelte";
  import { nostrCache } from "../../backend/NostrCacheStore.js";
  import { nostrManager } from "../../backend/NostrManagerStore.js";
  export let selectedJob;

  let authors = new Set(); // Set, um doppelte Abonnements zu vermeiden

  // Autoren aus den verknüpften Events extrahieren und abonnieren
  function subscribeAuthorsFromEvents() {
    // Überprüfen und Abonnieren des Autors des Jobs selbst
    if (selectedJob && selectedJob.pubkey && !authors.has(selectedJob.pubkey)) {
      authors.add(selectedJob.pubkey);
      $nostrManager.subscribeToEvents({
        kinds: [0],
        authors: [selectedJob.pubkey],
      });
    }

    // Abrufen und Abonnieren der Autoren verknüpfter Events
    const relatedEvents = $nostrCache.getEventsByCriteria({
      kinds: [1337],
      tags: {
        e: [selectedJob.id],
        s: ["bitspark"],
      },
    });

    relatedEvents.forEach((event) => {
      if (event.pubkey && !authors.has(event.pubkey)) {
        authors.add(event.pubkey);
        $nostrManager.subscribeToEvents({
          kinds: [0],
          authors: [event.pubkey],
        });
      }
    });
  }

  // Reaktive Anweisung für selectedJob und nostrCache
  $: if (selectedJob) {
    $nostrManager.subscribeToEvents({
      kinds: [1337],
      "#e": [selectedJob.id],
      "#s": ["bitspark"],
    });
    subscribeAuthorsFromEvents();
  }
  $: $nostrCache, subscribeAuthorsFromEvents(); // Reagiert auf Änderungen im Cache
</script>

<div class="job-chat">
  {#if selectedJob}
    <JobBubble job={selectedJob} />
    <JobBubble job={{...selectedJob, pubkey: "32ff6345af6bea020295e43cd71c3d2365396f1a740d196af64d16e18db15d2a"}} />
  {/if}
</div>

<style>
  .job-chat {
    background-color: #ffffff;
    padding: 10px;
    border-radius: 5px;
    margin: 10px;
  }
</style>
