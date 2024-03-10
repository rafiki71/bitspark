<!-- ZapWidget.svelte -->
<script>
  import { onMount, onDestroy } from "svelte";
  import { nostrCache } from "../backend/NostrCacheStore.js";
  import { nostrManager } from "../backend/NostrManagerStore.js";
  import { zapManager } from "../backend/ZapManager.js";
  import { sendZap } from "../LNHelper.js";
  import { socialMediaManager } from "../backend/SocialMediaManager.js";

  export let eventId;
  export let satGoal = null;

  let eventDetails = null;
  let creatorProfile = null;
  let satsAmount = 0;
  let sendSatsMessage = "";
  let totalReceivedSats = 0;
  let progressPercentage = 0;

  function initialize() {
    loadEvent();
    if ($nostrManager) {
      if (eventDetails) {
        socialMediaManager.subscribeProfile(eventDetails.pubkey);
      }

      zapManager.subscribeZaps(eventId)
    }
  }

  onMount(initialize);
  onDestroy(() => $nostrManager.unsubscribeAll());

  $: $nostrManager, initialize();
  $: $nostrCache, fetchTotalReceivedSats();
  $: $nostrCache, loadEvent();
  $: $nostrCache, loadProfile();

  async function loadEvent() {
    eventDetails = $nostrCache.getEventById(eventId);
  }

  async function loadProfile() {
    if (eventDetails) {
      creatorProfile = await socialMediaManager.getProfile(eventDetails.pubkey)
      fetchTotalReceivedSats();
    }
  }

  async function fetchTotalReceivedSats() {
    totalReceivedSats = await zapManager.getTotalZaps(eventId);
    updateProgress();
  }

  function updateProgress() {
    progressPercentage = (totalReceivedSats / satGoal) * 100;
    if (progressPercentage > 100) progressPercentage = 100;
  }

  async function sendSats() {
    if (creatorProfile.lud16 && satsAmount > 0) {
      sendZap(
        creatorProfile.lud16,
        satsAmount,
        sendSatsMessage || "Support via Zap",
        $nostrManager.relays,
        eventId,
      )
        .then((response) => {
          fetchTotalReceivedSats(); // Aktualisieren der totalen Sats
        })
        .catch((error) => {
          console.error("Error sending Zap:", error);
        });
    } else {
      console.error("Invalid LN address or Sats amount");
    }
  }
</script>

<div class="zap-widget single-card container">
  <h1 class="widget-title">Zap some Sats</h1>
  <div class="input-group">
    <input
      class="sats-input"
      type="number"
      bind:value={satsAmount}
      placeholder="Sats Amount"
      min="1"
    />
    <input
      class="message-input"
      type="text"
      bind:value={sendSatsMessage}
      placeholder="Message (optional)"
    />
    <button class="send-sats-button" on:click={sendSats}>
      <i class="fas fa-bolt"></i> Zap Sats
    </button>
  </div>
  <div class="total-received-section">
    <div class="total-received-display">
      <span class="total-received-amount">{totalReceivedSats}</span>
      <img src="../../img/sat.svg" alt="Sat Symbol" class="sat-symbol" />
      <span class="total-received-text">Zapped</span>
    </div>
  </div>
  {#if satGoal}
    <div class="progress-bar">
      <div class="progress" style="width: {progressPercentage}%"></div>
    </div>
  {/if}
</div>

<style>
   .total-received-section {
    display: flex;
    justify-content: center; /* Zentriert den inneren Container */
    width: 100%; /* Nimmt die volle Breite des übergeordneten Containers ein */
    margin-top: 20px; /* Abstand nach oben */
  }

  .total-received-display {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    background: #fffde7;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    font-family: "Roboto", sans-serif;
    width: 50%; /* oder 60%, je nach Vorliebe */
  }

  .sat-symbol {
    height: 30px;
    margin-right: 10px;
  }

  .total-received-amount {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
    margin-right: 5px;
  }

  .total-received-text {
    font-size: 1rem;
    color: #777;
  }

  .widget-title {
    text-align: center;
    color: #333;
    font-weight: 600;
    margin-bottom: 20px;
    font-family: "Roboto", sans-serif;
  }

  .single-card {
    background-color: #fffbea; /* Cremefarbener Hintergrund für einen weicheren Look */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtiler Schatten für Tiefe */
    border-radius: 10px; /* Abgerundete Ecken */
    padding: 20px; /* Innenabstand */
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
    width: 50%; /* oder 60%, je nach Vorliebe */
    margin-left: auto; /* Zentriert die .input-group horizontal */
    margin-right: auto; /* Zentriert die .input-group horizontal */
  }

  .sats-input,
  .message-input {
    border: 2px solid #fcbf49; /* Dunklerer Gelbton für Kontrast */
    background-color: #fffde7; /* Leicht gelblicher Hintergrund für die Eingabefelder */
    border-radius: 5px;
    padding: 10px;
    font-size: 1rem;
    font-family: "Roboto", sans-serif;
  }

  .send-sats-button {
    background-color: #ffc107;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease; /* Fügt eine Übergangsanimation hinzu */
  }

  .send-sats-button:hover,
  .send-sats-button:focus {
    transform: scale(1.05); /* Vergrößert den Button beim Überfahren */
    background-color: #ffca2c; /* Leicht heller beim Überfahren oder Fokussieren */
    outline: none; /* Entfernt den Browser-Standardfokus */
    box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.5); /* Fügt einen Fokusring hinzu */
  }

  .progress-bar {
    background-color: #f6f6f6; /* Sehr helles Grau für den leeren Fortschrittsbalken */
    border-radius: 5px;
    margin-top: 10px;
    height: 20px;
    width: 100%;
  }

  .progress {
    transition:
      width 0.5s ease,
      background-color 0.5s ease;
    background-color: #ffc107;
    height: 100%;
    border-radius: 5px;
  }

  .sats-input:focus,
  .message-input:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(252, 191, 73, 0.8);
  }
</style>
