<script>
  import { onMount, onDestroy } from "svelte";
  import { nostrCache } from "../backend/NostrCacheStore.js";
  import { nostrManager } from "../backend/NostrManagerStore.js";

  // Beispielvariablen
  let exampleId = "some-id";
  let exampleKind = 1; // Ersetzen Sie dies durch den korrekten Kind-Wert

  let events = [];

  // Methode zur Initialisierung und zum Abonnieren von Events
  function initialize() {
    if ($nostrManager) {
      $nostrManager.subscribeToEvents({
        kinds: [exampleKind],
        ids: [exampleId],
        authors: [exampleId],
        "#s": "bitspark",
      });
    }
  }

  // Methode zum Abrufen von Events aus dem Cache
  function fetchEvents() {
    if ($nostrCache) {
      events = $nostrCache.getEventsByCriteria({
        kinds: [exampleKind],
        ids: [exampleId],
        authors: [exampleId],
        tags: {
          e: [exampleId],
        },
      });
    }
  }

  async function postEvent() {
    if (!$nostrManager)
      return;

    const tags = [
      ["e", id],
      ["s", "bitspark"],
    ];
    try {
      await $nostrManager.sendEvent(kind, "content", tags);
      newComment = "";
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  }

  onMount(() => {
    initialize();
  });

  onDestroy(() => {
    if ($nostrManager) {
      $nostrManager.unsubscribeAll();
    }
  });

  // Reaktive Anweisungen
  $: $nostrCache && fetchEvents();
  $: $nostrManager && initialize();
</script>

<!-- HTML-Markup für die Darstellung der Events -->
<div>
  {#each events as event}
    <div>{event.content}</div>
  {/each}
</div>

<style>
  /* CSS-Styles hier */
</style>
