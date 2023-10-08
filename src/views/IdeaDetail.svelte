<!-- IdeaDetail.svelte -->
<script>
  import { onMount } from "svelte";
  import { Link } from "svelte-routing";
  import { sendSatsLNurl } from "../LNHelper.js";
  import Menu from "../components/Menu.svelte";
  import ProfileImg from "../components/ProfileImg.svelte";
  import CommentWidget from "../components/CommentWidget.svelte";
  import JobWidget from "../components/JobWidget.svelte";
  import Footer from "../components/Footers/FooterBS.svelte";
  import { helperStore } from "../helperStore.js"; // Import the store
  import { sidebarOpen } from "../helperStore.js";
  import Banner from "../components/Banner.svelte";
  import ToolBar from "../components/ToolBar.svelte";

  export let id;

  let idea = {
    bannerImage:
      "https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80",
    id: 0,
    message: "Eine innovative App, die das Leben der Menschen verbessert.",
    name: "Innovative App",
    subtitle: "Idea Engine",
  };

  let profiles = {};
  let creator_profile = null;

  async function deleteIdea() {
    const confirmDelete = confirm("Do you really want to delete this idea?");
    if (confirmDelete) {
      try {
        await $helperStore.deleteEvent(id);
      } catch (error) {
        console.error("Error deleting idea:", error);
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
      const fetchedIdea = await $helperStore.getEvent(id);

      // Konvertiere die Tags in ein einfacher zu handhabendes Objekt
      const tags = fetchedIdea.tags.reduce(
        (tagObj, [key, value]) => ({ ...tagObj, [key]: value }),
        {}
      );

      idea = {
        id: fetchedIdea.id,
        name: tags.iName,
        subtitle: tags.iSub,
        bannerImage: tags.ibUrl,
        message: fetchedIdea.content,
        githubRepo: tags.gitrepo,
        lnAdress: tags.lnadress,
        pubkey: fetchedIdea.pubkey,
        abstract: tags.abstract,
      };
      // Laden Sie das Profil des Erstellers der Idee
      creator_profile = await $helperStore.getProfile(fetchedIdea.pubkey);
      profiles[creator_profile.pubkey] = creator_profile;
    } catch (error) {
      console.error("Error fetching idea data:", error);
    }
  }

  async function supportIdea() {
    await sendSatsLNurl(idea.lnAdress);
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
      bannerImage={idea.bannerImage}
      title={idea.name}
      subtitle={idea.subtitle}
      show_right_text={false}
    />
    <ToolBar
      lnAddress={idea.lnAdress}
      pubkey={idea.pubkey}
      githubRepo={idea.githubRepo}
    />

    <div class={contentContainerClass}>
      <div class="single-card container">
        {#if creator_profile && creator_profile.pubkey === $helperStore.publicKey}
          <button
            on:click={deleteIdea}
            class="absolute top-4 right-4 text-gray-400"
          >
            <i class="fas fa-times-circle" />
          </button>
        {/if}

        <div class="text-center mt-6 px-6">
          <h2 class="base-h2 text-color-df">
            {idea.name}
          </h2>
          <h4 class="base-h4 text-color-df">
            {"Abstract"}
          </h4>
          <p class="abstract-text text-color-df">
            {idea.abstract}
          </p>
          <hr style="width: 65%; margin: auto;" />
          <div class="single-card-content text-color-df">
            {@html idea.message}
          </div>
        </div>
      </div>
      <div class="single-card container">
        <JobWidget ideaID={id} creatorPubKey={idea.pubkey}/>
      </div>
      <div class="single-card container">
        <CommentWidget {id} />
      </div>
    </div>
    <Footer />
  </div>
</main>
