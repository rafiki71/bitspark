<!-- Overview.svelte -->
<script>
  import "websocket-polyfill";
  import IdeaCard from "components/Cards/IdeaCard.svelte";
  import { onMount } from "svelte";
  import Menu from "../components/Menu.svelte";
  import Banner from "../components/Banner.svelte";
  import Footer from "../components/Footers/FooterBS.svelte";
  import { sidebarOpen } from "../helperStore.js";
  import { nostrCache } from "../backend/NostrCacheStore.js";
  import { nostrManager } from "../backend/NostrManagerStore.js";
  import { onDestroy } from "svelte";

  export let category;

  let verifiedCards = [];
  let unverifiedCards = [];

  async function fetchAndDisplayIdeas() {
    let criteria = {
      kinds: [1339],
      "#s": ["bitspark"],
    };

    const fetchedEvents = await $nostrCache.getEventsByCriteria(criteria);

    verifiedCards = [];
    unverifiedCards = [];
    fetchedEvents.forEach((idea) => {
      const card = transformIdeaToCard(idea);
      if (idea.Symbol && idea.Symbol(verified)) {
        verifiedCards.push(card);
      } else {
        unverifiedCards.push(card);
      }
    });
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
    };
  }

  onMount(() => {
    $nostrManager.subscribeToEvents({
      kinds: [1339],
      "#s": ["bitspark"],
    });
    fetchAndDisplayIdeas();
  });

  onDestroy(() => {
    $nostrManager.unsubscribeAll(); // Diese Methode müsste in Ihrem nostrManager definiert sein
  });

  $: fetchAndDisplayIdeas(), category;
  $: fetchAndDisplayIdeas(), $nostrCache;

  let contentContainerClass = $sidebarOpen
    ? "content-container sidebar-open"
    : "content-container";

  let bannerImage = "../../img/Banner1u.png";
  let title = "BitSpark";
  let subtitle = "The idea engine";
</script>

<main class="overview-page">
  <Menu />
  <div class="flex-grow">
    <Banner {bannerImage} {title} {subtitle} show_right_text={true} />
    <div class={contentContainerClass}>
      <section class="content-container relative py-16">
        <div class="content-container">
          <div class="container mx-auto px-4">
            <!-- Anzeigen von verifizierten Ideen -->
            <div class="row">
              {#each verifiedCards as card (card.id)}
                <div class="col-12 col-sm-6 col-md-6 col-lg-6 mb-8">
                  <IdeaCard {card} />
                </div>
              {/each}
            </div>
            <!-- Divider -->
            <div
              class="w-full"
              style="margin-top: 2rem; margin-bottom: 2rem; height: 2px; background-color: gray;"
            />
            <!-- Anzeigen von nicht verifizierten Ideen -->
            <div class="row">
              {#each unverifiedCards as card (card.id)}
                <div class="col-12 col-sm-6 col-md-6 col-lg-6 mb-8">
                  <IdeaCard {card} />
                </div>
              {/each}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
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
    /* Other styles */
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
