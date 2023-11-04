<!-- JobView.svelte -->
<script>
  import { onMount } from "svelte";
  import { helperStore, sidebarOpen } from "../helperStore.js";
  import Menu from "../components/Menu.svelte";
  import CommentWidget from "../components/CommentWidget.svelte";
  import Footer from "../components/Footers/FooterBS.svelte";
  import Banner from "../components/Banner.svelte";
  import ToolBar from "../components/ToolBar.svelte";

  export let id;
  let showOfferPopup = false;
  let developerBid = "";
  let developerIntro = "";
  let profiles = {};
  let creator_profile = null;

  let job = {
    bannerImage:
      "https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80",
    id: 0,
    description: "Eine detaillierte Beschreibung des Jobs.",
    title: "Job Title",
    company: "Unternehmen XYZ",
  };


  async function deleteJob() {
    const confirmDelete = confirm("Möchten Sie diesen Job wirklich löschen?");
    if (confirmDelete) {
      try {
        await $helperStore.deleteEvent(id);
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  }

  onMount(async () => {
    await fetchData();
  });

  async function fetchData() {
    if (!$helperStore) {
      return;
    }

    try {
      const fetchedJob = await $helperStore.getEvent(id);
      console.log("Fetched Job:", fetchedJob);
      const tags = fetchedJob.tags.reduce(
        (tagObj, [key, value]) => ({ ...tagObj, [key]: value }),
        {}
      );

      job = {
        id: fetchedJob.id,
        title: tags.jTitle,
        sats: tags.sats,
        company: tags.jCompany,
        bannerImage: tags.jbUrl,
        description: fetchedJob.content,
        pubkey: fetchedJob.pubkey,
      };
      creator_profile = await $helperStore.getProfile(fetchedJob.pubkey);
      profiles[creator_profile.pubkey] = creator_profile;
    } catch (error) {
      console.error("Error fetching job data:", error);
    }
  }

  $: contentContainerClass = $sidebarOpen 
    ? "combined-content-container sidebar-open" 
    : "combined-content-container";

  $: fetchData(), $helperStore;
</script>

<main class="overview-page">
  <Menu />
  <div class="flex-grow">
    <Banner
      bannerImage={job.bannerImage}
      title={job.title}
      subtitle={`${job.sats} Sats`}
      show_right_text={false}
    />

    <ToolBar />

    <div class={contentContainerClass}>
      <div class="container bg-card relative flex flex-col min-w-0 break-words">
        {#if creator_profile && creator_profile.pubkey === $helperStore.publicKey}
          <button
            on:click={deleteJob}
            class="absolute top-4 right-4 text-gray-400"
          >
            <i class="fas fa-times-circle" />
          </button>
        {/if}

        <div class="px-6">
          <div class="text-center mt-6">
            <h2 class="base-h2">
              {job.title}
            </h2>
            <hr class="my-6" />
            <p class="html-content">
              {@html job.description}
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
      <!-- Closing div that was missing -->
      <div class="single-card container">
        <CommentWidget {id} />
      </div>
    </div>
    <Footer />
  </div>
  {#if showOfferPopup}
    <div class="offer-popup-overlay">
      <div class="offer-popup">
        <h3>Send Offer</h3>
        <label>
          Sats:
          <input
            bind:value={developerBid}
            type="number"
            placeholder={job.sats}
          />
        </label>
        <label>
          Message:
          <textarea bind:value={developerIntro} placeholder="Your Message..." />
        </label>
        <div class="offer-popup-buttons">
          <button on:click={() => (showOfferPopup = false)}>Cancel</button>
          <button
            on:click={async () => {
              await $helperStore.postOffer(
                job.id,
                developerIntro,
                developerBid
              );
              showOfferPopup = false;
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
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

  .offer-popup h3, .offer-popup label {
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
