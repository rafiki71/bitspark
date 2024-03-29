<!-- IdeaDetail.svelte -->
<script>
  import { onMount, onDestroy } from "svelte";
  import Menu from "../components/Menu.svelte";
  import CommentWidget from "../components/CommentWidget.svelte";
  import JobWidget from "../components/JobWidget.svelte";
  import Footer from "../components/Footers/FooterBS.svelte";
  import IdeaBannerWidget from "../components/Widgets/Banner/IdeaBannerWidget.svelte";

  import ToolBar from "../components/ToolBar.svelte";
  import { sidebarOpen } from "../helperStore.js";
  import { nostrCache } from "../backend/NostrCacheStore.js";
  import { nostrManager } from "../backend/NostrManagerStore.js";
  import { socialMediaManager } from "../backend/SocialMediaManager.js";
  import { NOSTR_KIND_IDEA } from "../constants/nostrKinds";
  import ZapWidget from "../components/ZapWidget.svelte";

  export let id;

  let idea = {};
  let creator_profile = null;

  async function initialize() {
    if ($nostrManager) {

      $nostrManager.subscribeToEvents({
        kinds: [NOSTR_KIND_IDEA],
        "#s": ["bitspark"],
        ids: [id],
      });
    }
  }

  function fetchIdea() {
    const fetchedIdea = $nostrCache.getEventById(id);
    console.error(fetchedIdea);
    if (fetchedIdea) {
      idea = transformIdea(fetchedIdea);
    }
  }

  function transformIdea(event) {
    const tags = event.tags.reduce(
      (tagObj, [key, value]) => ({ ...tagObj, [key]: value }),
      {},
    );

    return {
      id: event.id,
      name: tags.iName,
      subtitle: tags.iSub,
      bannerImage: tags.ibUrl || "default_image_url",
      message: event.content,
      githubRepo: tags.gitrepo,
      lnAdress: tags.lnadress,
      pubkey: event.pubkey,
      abstract: tags.abstract,
    };
  }

  async function fetchCreatorProfile() {
    creator_profile = await socialMediaManager.getProfile(idea.pubkey);
  }

  async function deleteIdea() {
    const confirmDelete = confirm("Do you really want to delete this idea?");
    if (confirmDelete) {
      await $nostrManager.sendEvent(5, "", [["e", id]]);
    }
  }

  onMount(() => {
    initialize();
  });

  onDestroy(() => {
    $nostrManager.unsubscribeAll();
  });

  let contentContainerClass = "combined-content-container";
  $: {
    if ($sidebarOpen) {
      contentContainerClass = "combined-content-container sidebar-open";
    } else {
      contentContainerClass = "combined-content-container";
    }
  }

  $: if ($nostrCache) {
    fetchIdea();
    if (idea && idea.pubkey) {
      fetchCreatorProfile();
    }
  }

  $: if ($nostrManager) {
    initialize();
  }
</script>

<main class="overview-page">
  <Menu />
  <div class="flex-grow">
    <IdeaBannerWidget {id} />
    <ToolBar
      lnAddress={idea.lnAdress}
      pubkey={idea.pubkey}
      githubRepo={idea.githubRepo}
    />

    <div class={contentContainerClass}>
      <div class="single-card container">
        {#if creator_profile && creator_profile.pubkey === $nostrManager.publicKey}
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
      <ZapWidget eventId={id} />
      <div class="single-card container">
        <JobWidget ideaID={id} creatorPubKey={idea.pubkey} />
      </div>
      <div class="single-card container">
        <CommentWidget {id} />
      </div>
    </div>
  </div>
  <Footer />
</main>
