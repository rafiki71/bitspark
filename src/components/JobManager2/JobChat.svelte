<!-- JobChat.svelte -->
<script>
  import JobBubble from "./JobBubble.svelte";
  import OfferBubble from "./OfferBubble.svelte";
  import AddPRBubble from "./AddPRBubble.svelte";
  import PRBubble from "./PRBubble.svelte";
  import PaymentRequestBubble from "./PaymentRequestBubble.svelte";
  import { nostrCache } from "../../backend/NostrCacheStore.js";
  import { nostrManager } from "../../backend/NostrManagerStore.js";
  import { socialMediaManager } from "../../backend/SocialMediaManager.js";
  import ReviewBubble from "./ReviewBubble.svelte";
  import { NOSTR_KIND_JOB } from '../../constants/nostrKinds';
  import { nostrJobManager } from "../../backend/NostrJobManager";

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
        return AddPRBubble;
      case "pr":
        return PRBubble;
      case "apr": // Akzeptierter PR
        return PaymentRequestBubble;
      case "review": // Akzeptierter PR
        return ReviewBubble;
      default:
        return null; // oder ein Standard-Bubble-Komponent
    }
  }

  function subscribeToOfferZaps() {
    const offerEvents = $nostrCache.getEventsByCriteria({
      kinds: [NOSTR_KIND_JOB],
      tags: { s: ["bitspark"],
              t: ["offer"]},
    });

    offerEvents.forEach((offer) => {
      const offerId = offer.id;
      $nostrManager.subscribeToEvents({
        kinds: [9735], // Kind für Zap-Events
        "#e": [offerId]
      });
    });
  }

  // Autoren aus den verknüpften Events extrahieren und abonnieren
  function subscribeAuthorsFromEvents() {
    // Überprüfen und Abonnieren des Autors des Jobs selbst
    if (selectedJob && selectedJob.pubkey && !authors.has(selectedJob.pubkey)) {
      authors.add(selectedJob.pubkey);
      socialMediaManager.subscribeProfile(selectedJob.pubkey);
    }

    // Abrufen und Abonnieren der Autoren verknüpfter Events
    relatedEvents = $nostrCache.getEventsByCriteria({
      kinds: [NOSTR_KIND_JOB],
      tags: {
        e: [selectedJob.id],
        s: ["bitspark"],
      },
    });

    relatedEvents.push(selectedJob);

    relatedEvents.forEach((event) => {
      if (event.pubkey && !authors.has(event.pubkey)) {
        authors.add(event.pubkey);
        socialMediaManager.subscribeProfile(event.pubkey);
      }
    });
  }

  function updateBubbles() {
    relatedEvents = $nostrCache.getEventsByCriteria({
      kinds: [NOSTR_KIND_JOB],
      tags: {
        e: [selectedJob.id],
        s: ["bitspark"],
      },
    });

    if (selectedJob) {
      relatedEvents.push(selectedJob);
    }

    relatedEvents.forEach((event) => {
      if (event.pubkey && !authors.has(event.pubkey)) {
        authors.add(event.pubkey);
        socialMediaManager.subscribeProfile(event.pubkey);
      }
    });

    bubbles = relatedEvents.map((event) => {
      const BubbleComponent = createBubble(event);
      return { component: BubbleComponent, props: { event } };
    });

    bubbles.sort((a, b) => a.props.event.created_at - b.props.event.created_at);
  }

  $: if ($nostrCache && selectedJob) {
    subscribeAuthorsFromEvents();
    subscribeToOfferZaps();
    updateBubbles();
  }

  $: if (selectedJob) {
    nostrJobManager.subscribeJobRelatedEvents(selectedJob.id);
    subscribeAuthorsFromEvents();
    subscribeToOfferZaps();
    updateBubbles();
  }
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
    max-height: 100%; /* Begrenzt auf die Höhe des übergeordneten Containers */
    overflow-y: auto; /* Ermöglicht Scrollen innerhalb der Komponente */
  }
</style>

