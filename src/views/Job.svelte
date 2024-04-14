<!-- JobView.svelte -->
<script>
  import { onMount, onDestroy } from "svelte";
  import Menu from "../components/Sidebar/Sidebar.svelte";
  import CommentWidget from "../components/CommentWidget.svelte";
  import Footer from "../components/Footers/Footer.svelte";
  import Banner from "../components/Banner.svelte";
  import ToolBar from "../components/Toolbar/Toolbar.svelte";
  import { nostrCache } from "../backend/NostrCacheStore.js";
  import { nostrManager } from "../backend/NostrManagerStore.js";
  import { contentContainerClass } from "../helperStore.js";
  import { NOSTR_KIND_JOB } from "../constants/nostrKinds";
  import ZapWidget from "../components/ZapWidget.svelte";
  import { socialMediaManager } from "../backend/SocialMediaManager.js";

  export let id;
  let showOfferPopup = false;
  let developerBid = "";
  let requiredTime = "";
  let developerIntro = "";
  let job = null;
  let creator_profile = null;

  function initialize() {
    if ($nostrManager) {
      $nostrManager.subscribeToEvents({
        kinds: [NOSTR_KIND_JOB],
        ids: [id],
        "#t": ["job"],
        "#s": ["bitspark"],
      });
      fetchJob();
    }
  }

  async function fetchJob() {
    const jobEvent = $nostrCache.getEventById(id);
    if (jobEvent) {
      job = {
        title:
          jobEvent.tags.find((tag) => tag[0] === "jTitle")?.[1] ||
          "No Title",
        abstract:
          jobEvent.tags.find((tag) => tag[0] === "jAbstract")?.[1] ||
          "No Abstract",
        requirements:
          jobEvent.tags.find((tag) => tag[0] === "jReq")?.[1] ||
          "No Requierements",
        sats:
          jobEvent.tags.find((tag) => tag[0] === "sats")?.[1] || "0 Sats",
        bannerImage:
          jobEvent.tags.find((tag) => tag[0] === "jbUrl")?.[1] ||
          "default_image_url",
        description: jobEvent.content,
      };
      fetchProfile(jobEvent.pubkey);
    }

  }

  async function fetchProfile(pubkey) {
    creator_profile = await socialMediaManager.getProfile(pubkey);
  }

  async function postOffer() {
    if (!developerIntro || !developerBid) {
      console.log("Please fill all fields.");
      return;
    }

    // Stellen Sie sicher, dass $nostrManager vorhanden und im Schreibmodus ist
    if (!$nostrManager || !$nostrManager.write_mode) {
      console.log("Nostr manager not available or not in write mode");
      return;
    }

    const tags = [
      ["s", "bitspark"],
      ["t", "offer"],
      ["e", id], // Die ID des Jobs
      ["sats", developerBid], // Gebot in Sats
      ["reqTime", requiredTime], // Gebot in Sats
    ];

    try {
      await $nostrManager.sendEvent(
        NOSTR_KIND_JOB, // Der Kind-Wert für Jobs
        developerIntro,
        tags,
      );

      console.log("Offer submitted successfully");

      // Zurücksetzen der Werte und Schließen des Popups
      developerBid = "";
      developerIntro = "";
      showOfferPopup = false;
    } catch (error) {
      console.error("Error submitting offer:", error);
    }
  }

  async function deleteJob() {
    const confirmDelete = confirm("Do you really want to delete this idea?");
    if (confirmDelete) {
      await $nostrManager.deleteEvent(id);
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

  $: $nostrCache && fetchJob();
  $: $nostrManager && initialize();
  $: $nostrCache && $nostrManager && fetchJob();
  $: id, initialize();
</script>

<main class="overview-page">
  <Menu />
  <div class="flex-grow">
    <Banner
      bannerImage={job?.bannerImage}
      title={job?.title}
      subtitle={`${job?.sats} Sats`}
      show_right_text={false}
    />

    <ToolBar />

    <div class={$contentContainerClass}>
      <div class="container bg-card relative flex flex-col min-w-0 break-words">
        {#if creator_profile && creator_profile.pubkey === $nostrManager?.publicKey}
          <button
            on:click={deleteJob}
            class="absolute top-4 right-4 text-gray-400"
          >
            <i class="fas fa-times-circle" />
          </button>
        {/if}

        <div class="px-6">
          <div class="text-center mt-6">
            <h2 class="section-title">Abstract</h2>
            <p class="html-content job-requirements">
              {@html job?.abstract}
            </p>
            <h2 class="section-title">User Story</h2>
            <p class="html-content">
              {@html job?.description}
            </p>
            <hr class="my-6" />
            <h2 class="section-title">Requirements</h2>
            <p class="html-content job-requirements">
              {@html job?.requirements}
            </p>
            <button
              class="post-offer-btn"
              on:click={() => (showOfferPopup = true)}
            >
              <i class="fas fa-paper-plane mr-2" /> Send Offer
            </button>
          </div>
        </div>
      </div>
      <ZapWidget eventId={id} />
      <div class="single-card container">
        <CommentWidget {id} />
      </div>
    </div>
  </div>
  {#if showOfferPopup}
    <div class="offer-popup-overlay">
      <div class="offer-popup">
        <h3>Send Offer</h3>
        <label>
          Sats:
          <input bind:value={developerBid} type="text" placeholder={job.sats} />
        </label>
        <label>
          Required Time:
          <input bind:value={requiredTime} type="text" placeholder="2 Weeks" />
        </label>
        <label>
          Message:
          <textarea bind:value={developerIntro} placeholder="Your Message..." />
        </label>
        <div class="offer-popup-buttons">
          <button on:click={() => (showOfferPopup = false)}>Cancel</button>
          <button on:click={postOffer}> Submit </button>
        </div>
      </div>
    </div>
  {/if}
  <Footer />
</main>

<style>
  .job-requirements {
    white-space: pre-line;
  }

  /* Variables */
  :root {
    --primary-bg-color: #e2e8f0;
    --primary-text-color: #4a5568; /* blueGray-700 */
    --primary-font-size: 1.2em;
    --primary-line-height: 1.6em;
  }

  /* Typography */
  .idea-title {
    font-size: 4rem;
    font-weight: 700;
    color: var(--primary-text-color);
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 3rem; /* Anpassung der Schriftgröße */
    font-weight: 600; /* Semi-fett */
    color: #2c5282; /* Dunkelblau, passend zur übrigen Farbgebung */
    margin: 1rem 0; /* Abstand oben und unten */
    padding: 0.5rem 0; /* Leichter Abstand innen */
    text-align: center; /* Zentrierung des Titels */
  }

  .idea-description {
    width: 70%;
    margin: 2rem auto;
    text-align: justify;
    font-size: var(--primary-font-size);
    line-height: var(--primary-line-height);
  }

  .abstract-text {
    width: 50%;
    margin: 2rem auto;
    text-align: justify;
    font-size: 1.1em;
    line-height: 1.6em;
  }

  .offer-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(5px);
  }

  .offer-popup {
    width: 1000px; /* Erhöht die Breite des Popups */
    padding: 20px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3);
    font-family: "Ihre Hauptwebsite-Schriftart", sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .offer-popup textarea {
    width: 100%;
    padding: 10px;
    margin-top: 5px;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    font-size: 1em;
    height: 200px; /* Definiert eine feste Höhe für das Textfeld */
  }

  .offer-popup h3,
  .offer-popup label {
    margin-bottom: 1rem;
    color: var(--primary-text-color);
  }

  .offer-popup input,
  .offer-popup textarea {
    width: 100%;
    padding: 10px;
    margin-top: 5px;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    font-size: 1em;
  }

  .offer-popup button {
    padding: 10px 15px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    color: #ffffff;
    font-weight: bold;
  }

  .offer-popup button:first-child {
    background-color: #2c5282; /* Dunkelblauer Farbton */
  }

  .offer-popup button:last-child {
    background-color: rgb(249 115 22); /* Hellgrauer Farbton */
  }

  .post-offer-btn {
    background-color: rgb(44, 82, 130); /* Dunkelblauer Farbton */
    border: none;
    border-radius: 5px;
    padding: 10px 15px;
    color: #ffffff;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1em;
    margin: 1em auto;
    display: block;
    width: fit-content;
  }

  .post-offer-btn i {
    font-size: 1em;
  }

  .post-offer-btn:hover {
    background-color: #1a3b5c; /* Ein etwas dunklerer Blauton */
  }

  .offer-popup-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .offer-popup button:last-child {
    margin-right: 0;
  }

  .offer-popup button:first-child {
    margin-right: 10px;
  }
</style>
