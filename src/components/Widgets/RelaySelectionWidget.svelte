<script>
  import { onMount, onDestroy } from "svelte";
  import { nostrManager } from "../../backend/NostrManagerStore.js";
  import { nostrCache } from "../../backend/NostrCacheStore.js";

  let default_relays = [
    "wss://relay.damus.io",
    "wss://relay.plebstr.com",
    "wss://nostr.wine",
  ];
  let relays = [];
  let newRelay = "";

  onMount(async () => {
    await initialize();
  });

  async function initialize() {
    if ($nostrManager) {
      relays = $nostrManager.relays;
    }
  }

  $: $nostrManager, initialize();
  $: $nostrCache, initialize();

  function addRelay() {
    if (newRelay.trim() && !relays.includes(newRelay)) {
      relays = [...relays, newRelay];
      newRelay = "";
    }
  }

  function removeRelay(relayUrl) {
    relays = relays.filter((relay) => relay !== relayUrl);
  }

  function addDefaults() {
    let mergedSet = new Set([...relays, ...default_relays]);
    relays = Array.from(mergedSet);
    console.log("default relays added");
  }

  function removeDefaults() {
    relays = relays.filter((relay) => !default_relays.includes(relay));
    console.log("default relays removed");
  }

  async function updateRelays() {
    if (!$nostrManager || !$nostrManager.write_mode) return;
    sendUpdateRelaysEvent();
  }

  function areSetsEqual(set1, set2) {
    if (set1.size !== set2.size) return false;
    for (let item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }

  async function sendUpdateRelaysEvent() {
    if (!$nostrManager || !$nostrManager.write_mode) return;

    // Holen Sie die aktuellen Relays aus dem Cache
    const existingRelays = $nostrManager.relays;

    const existingRelaysSet = new Set(existingRelays);
    const relaysSet = new Set(relays);
    if (existingRelaysSet.size == existingRelays.length) {
      if (areSetsEqual(existingRelaysSet, relaysSet)) {
        console.log("no relay update required");
        return;
      }
    }
    const updatedRelays = Array.from(relaysSet);
    $nostrManager.updateRelays(updatedRelays);
    // Überprüfen, ob das Relay bereits existiert

    // Event für die Aktualisierung der Relay-Liste erstellen
    const relayEvent = createRelayEvent(updatedRelays);

    // Event senden
    try {
      await $nostrManager.sendEvent(
        relayEvent.kind,
        relayEvent.content,
        relayEvent.tags,
      );
      console.log("Relay added successfully");
    } catch (error) {
      console.error("Error adding relay:", error);
    }
  }

  // Hilfsfunktion zum Erstellen eines Relay-Events
  function createRelayEvent(relays) {
    const content = ""; // Leerer Inhalt für Relay-Liste
    const tags = relays.map((relay) => ["r", relay]);

    return {
      kind: 10002, // Kind für Relay-Liste
      content,
      tags,
    };
  }
</script>

<h5 class="base-h5 text-color-df">Relays</h5>
<div class="add-relay-container">
  <input
    type="text"
    class="input-style add-relay-input"
    bind:value={newRelay}
    placeholder="Enter new relay URL"
  />
  <button class="add-button" on:click={addRelay}> Add </button>
</div>
<div style="margin: 4pt;">
  {#each relays as relay}
    <div class="relay-item">
      <span class="relay-text">{relay}</span>
      <button class="remove-button" on:click={() => removeRelay(relay)}>
        Remove
      </button>
    </div>
  {/each}
</div>
<button class="add-button" on:click={() => addDefaults()}>
  Add defaults
</button>
<button class="remove-button" on:click={() => removeDefaults()}>
  Remove defaults
</button>
<div class="relay-text" style="margin-top: 15pt;">
  Relays are crucial for fetching and publishing your information (ideas,
  profiles, jobs).
  <ul>
    <li>
      <b>Default vs. Custom</b> - Initially, we use default relays for uniform access.
      Customize relays to change where your data is fetched from and published to.
    </li>
    <li>
      <b>Persistence</b> - Changes to relays affect where your data is fetched and
      seen. For these changes to persist across sessions, enable cookies for the
      website, or follow our tutorial for Docker or Umbrel at: tutorial link.
    </li>
  </ul>
  Remember, adjusting your relays changes where you see and share data. Keep it in
  mind to maintain your desired visibility.
  <div class="mx-auto flex justify-end">
    <button
      class="bg-orange-500 text-white font-bold py-2 px-4 rounded"
      on:click={updateRelays}
    >
      Update Relays
    </button>
  </div>
</div>

<style>
  ul {
    list-style-type: disc; /* This will ensure bullet points are shown */
    padding-left: 40px; /* This adds some space inside the list to align the bullets properly */
  }

  .relay-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px; /* Adjust the spacing between relay items */
  }

  .relay-text {
    flex-grow: 1;
    font-size: 1rem;
    /* Additional styling for the relay text, if needed */
  }
  .add-relay-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .add-relay-input {
    flex-grow: 1;
    margin-right: 10px; /* Space between input and button */
    /* Additional styling for input */
    font-size: 1rem;
    height: 28px;
  }
</style>
