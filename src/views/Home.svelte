<!-- Overview.svelte -->
<script>
  import "websocket-polyfill";
  import { onMount } from "svelte";
  import Menu from "../components/Sidebar/Sidebar.svelte";
  import Banner from "../components/Banner.svelte";
  import Footer from "../components/Footers/Footer.svelte";
  import ToolBar from "../components/Toolbar/Toolbar.svelte";
  import Feed from "../components/Feed/Feed.svelte";
  import { contentContainerClass } from "../helperStore.js";
  import { nostrCache } from "../backend/NostrCacheStore.js";
  import { nostrManager } from "../backend/NostrManagerStore.js";
  import { socialMediaManager } from "../backend/SocialMediaManager.js";
  import { onDestroy } from "svelte";
  import { NOSTR_KIND_IDEA } from "../constants/nostrKinds";
  import { relaysStore } from "../backend/RelayStore.js";

  let bannerImage = "../../img/Banner1u.png";
  let title = "BitSpark";
  let subtitle = "The idea engine";
  export let category;

  let verifiedCards = [];
  let unverifiedCards = [];

  async function fetchAndDisplayIdeas() {
    let criteria = {
      kinds: [NOSTR_KIND_IDEA],
      tags: { s: ["bitspark"] },
    };

    if (category) {
      criteria.tags.c = [category];
    }

    const fetchedEvents = await $nostrCache.getEventsByCriteria(criteria);

    const tempVerifiedCards = [];
    const tempUnverifiedCards = [];

    await Promise.all(
      fetchedEvents.map(async (idea) => {
        const card = transformIdeaToCard(idea);

        let profile = await socialMediaManager.getProfile(idea.pubkey);
        if (profile) {
          if (profile.verified) {
            tempVerifiedCards.push(card);
          } else {
            tempUnverifiedCards.push(card);
          }
        }
      }),
    );

    // Zuweisen der temporären Arrays zu den reaktiven Arrays für das UI-Rendering
    verifiedCards = tempVerifiedCards;
    unverifiedCards = tempUnverifiedCards;
  }

  function transformIdeaToCard(idea) {
    const tags = idea.tags.reduce(
      (tagObj, [key, value]) => ({ ...tagObj, [key]: value }),
      {},
    );
    return {
      id: idea.id,
      name: tags.iName,
      subtitle: tags.iSub,
      bannerImage: tags.ibUrl,
      message: idea.content,
      abstract: tags.abstract,
      pubkey: idea.pubkey,
    };
  }

  function initialize() {
    if ($nostrManager) {
      $nostrManager.subscribeToEvents({
        kinds: [NOSTR_KIND_IDEA],
        "#s": ["bitspark"],
      });
      fetchAndDisplayIdeas();
    }
  }

  onMount(() => {
    initialize();
  });

  onDestroy(() => {
    $nostrManager.unsubscribeAll(); // Diese Methode müsste in Ihrem nostrManager definiert sein
  });

  $: fetchAndDisplayIdeas(), category;
  $: initialize(), $nostrManager;
  $: fetchAndDisplayIdeas(), $relaysStore;

  $: if ($nostrManager && $nostrCache) {
    fetchAndDisplayIdeas();
  }
</script>

<main class="overview-page">
  <Menu />
  <div class="flex-grow">
    <Banner {bannerImage} {title} {subtitle} show_right_text={true} />
    <ToolBar />
    <div class={$contentContainerClass}>
      <Feed />
    </div>
    <Footer />
  </div>
</main>

<style>
  .content-section {
    display: flex;
    background-color: #e2e8f0 !important;
  }

  .content-container {
    flex-grow: 1;
    z-index: 0;
  }

  .flex-grow {
    z-index: 0; /* This will keep the div behind the button */
  }
  .content-container {
    margin-left: 0; /* This is the starting state */
    transition: margin-left 0.3s ease-in-out;
    flex-grow: 1;
    z-index: 0; /* This will keep the div behind the button */
  }

  .content-container.sidebar-open {
    margin-left: 200px; /* This should be equal to the width of the sidebar */
  }
</style>
