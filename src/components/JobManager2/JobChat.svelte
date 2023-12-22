<!-- JobChat.svelte -->
<script>
  import JobBubble from "./JobBubble.svelte";
  import OfferBubble from "./OfferBubble.svelte";
  import { nostrCache } from "../../backend/NostrCacheStore.js";
  import { nostrManager } from "../../backend/NostrManagerStore.js";

  export let selectedJob;

  let authors = new Set(); // Set, um doppelte Abonnements zu vermeiden
  let bubbles = [];
  let relatedEvents = [];

  function createBubble(event) {
    const eventType = event.tags.find((tag) => tag[0] === "t")?.[1];

    switch (eventType) {
      case "job":
        return JobBubble;
      case "offer":
        return OfferBubble;
      case "ao": // Akzeptiertes Angebot
        return AcceptanceBubble;
      case "do": // Abgelehntes Angebot
        return DeclineBubble;
      case "pr":
        return PRBubble;
      case "apr": // Akzeptierter PR
        return PRResponseBubble;
      // ... weitere Fälle für andere Event-Typen
      default:
        return null; // oder ein Standard-Bubble-Komponent
    }
  }

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
    console.log("selectedJob:", selectedJob);
    relatedEvents = $nostrCache.getEventsByCriteria({
      kinds: [1337],
      tags: {
        e: [selectedJob.id],
        s: ["bitspark"],
      },
    });

    relatedEvents.push(selectedJob);

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

    bubbles = relatedEvents.map((event) => {
      const BubbleComponent = createBubble(event);
      return { component: BubbleComponent, props: { event } };
    });

    // Sortieren der Bubbles
    bubbles.sort((a, b) => a.props.event.created_at - b.props.event.created_at);
    console.log("relatedEvents:", relatedEvents);
    console.log("bubbles:", bubbles);
  }

  $: $nostrCache, subscribeAuthorsFromEvents(); // Reagiert auf Änderungen im Cache
</script>

<div class="job-chat">
  {#if selectedJob}
    {#each bubbles as bubble}
      <svelte:component this={bubble.component} {...bubble.props} />
    {/each}
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
