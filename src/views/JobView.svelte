<!-- JobView.svelte -->
<script>
  import { onMount } from "svelte";
  import Menu from "../components/Menu.svelte";
  import CommentWidget from "../components/CommentWidget.svelte";
  import Footer from "../components/Footers/FooterBS.svelte";
  import Banner from "../components/Banner.svelte";
  import ToolBar from "../components/ToolBar.svelte";
  import { helperStore } from "../helperStore.js";
  import { sidebarOpen } from "../helperStore.js";

  export let id;

  let job = {
    bannerImage:
      "https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80",
    id: 0,
    description: "Eine detaillierte Beschreibung des Jobs.",
    title: "Job Title",
    company: "Unternehmen XYZ",
  };

  let profiles = {};
  let creator_profile = null;

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
    console.log("piep");
    console.log(id);
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

  let contentContainerClass = "combined-content-container";

  $: {
    if ($sidebarOpen) {
      contentContainerClass = "combined-content-container sidebar-open";
    } else {
      contentContainerClass = "combined-content-container";
    }
  }
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
          </div>
        </div>
      </div>
      <div class="single-card container">
        <CommentWidget {id} />
      </div>
    </div>
    <Footer />
  </div>
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
</style>
