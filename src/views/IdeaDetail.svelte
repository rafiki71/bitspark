<!-- IdeaDetail.svelte -->
<script>
  import { onMount, onDestroy } from "svelte";
  import Menu from "../components/Menu.svelte";
  import CommentWidget from "../components/CommentWidget.svelte";
  import JobWidget from "../components/JobWidget.svelte";
  import Footer from "../components/Footers/FooterBS.svelte";
  import Banner from "../components/Banner.svelte";
  import ToolBar from "../components/ToolBar.svelte";
  import { sidebarOpen } from "../helperStore.js";
  import { nostrCache } from "../backend/NostrCacheStore.js";
  import { nostrManager } from "../backend/NostrManagerStore.js";
  import { NOSTR_KIND_IDEA } from '../constants/nostrKinds';
  import ZapWidget from '../components/ZapWidget.svelte';

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

      $nostrManager.subscribeToEvents({
        kinds: [0],
        authors: [idea.pubkey],
      });
    }
  }

  function fetchIdea() {
    const fetchedIdea = $nostrCache.getEventById(id);
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

  function fetchCreatorProfile() {
    let criteria = {
      kinds: [0],
      authors: [idea.pubkey],
      tags: {
        s: ["bitspark"],
      },
    };

    const profileEvents = $nostrCache.getEventsByCriteria(criteria);

    if (profileEvents && profileEvents.length > 0) {
      creator_profile = profileEvents[0].profileData;
    }
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
