<!-- Overview.svelte -->

<script>
  // Core components
  import IdeaCard from "components/Cards/IdeaCard.svelte";
  import { onMount } from "svelte";
  import ProfileImg from "../components/ProfileImg.svelte";
  import Menu from "../components/Menu.svelte";
  import Banner from "../components/Banner.svelte";
  import Footer from "../components/Footers/FooterBS.svelte";
  import "websocket-polyfill";
  import { helperStore } from "../helperStore.js"; // Import the store
  import { ideas, verifiedCards, unverifiedCards } from "../ideaStore.js";
  import { sidebarOpen } from "../helperStore.js";

  let publicKey = "";
  let profilePicture = "";
  let profile = null;

  export let category;

  async function fetchIdeas() {
    if (!$helperStore) {
      return;
    }

    try {
      await $helperStore.fetchIdeas();

      if (category) {
        $ideas = await $helperStore.getIdeas([category]);
      } else {
        $ideas = await $helperStore.getIdeas();
      }
    } catch (error) {
      console.error("Error updating cards:", error);
    }
  }

  async function filterIdeas() {
    if (!$helperStore) {
      return;
    }

    if (category) {
      $ideas = await $helperStore.getIdeas([category]);
    } else {
      $ideas = await $helperStore.getIdeas();
    }
  }

  async function updateProfileImg() {
    if (!$helperStore) {
      return;
    }
    publicKey = $helperStore.publicKey;
    profile = await $helperStore.getProfile(publicKey);
    profilePicture = profile.picture;
  }

  async function updateIdeas() {
    try {
      let verified = [];
      let unverified = [];
      $ideas.forEach((idea) => {
        const tags = idea.tags.reduce(
          (tagObj, [key, value]) => ({ ...tagObj, [key]: value }),
          {}
        );
        const card = {
          id: idea.id,
          name: tags.iName,
          subtitle: tags.iSub,
          bannerImage: tags.ibUrl,
          message: idea.content,
          abstract: tags.abstract,
        };

        if (idea.githubVerified) {
          verified.push(card);
        } else {
          unverified.push(card);
        }
      });
      // Assign outside of forEach loop
      $verifiedCards = verified;
      $unverifiedCards = unverified;
    } catch (error) {
      console.error("Error updating cards:", error);
    }
  }

  onMount(async () => {});

  $: filterIdeas(), category;
  $: updateIdeas(), $ideas;
  $: updateProfileImg(), $helperStore;
  $: fetchIdeas(), $helperStore;
  $: filterIdeas(), $helperStore;

  let contentContainerClass = "content-container";
  let titleClass = "title-class";

  $: {
    if ($sidebarOpen) {
      contentContainerClass = "content-container sidebar-open";
    } else {
      contentContainerClass = "content-container";
    }
  }

  let bannerImage = "../../img/Banner1u.png";
  let title = "BitSpark";
  let subtitle = "The idea engine";
</script>

<main class="overview-page">
  <Menu />
  <div class="flex-grow">
    <Banner {bannerImage} {title} {subtitle} show_right_text={true} />
    <div class={contentContainerClass}>
      <section class="content-container relative py-16 bg-blueGray-200">
        <div class="content-container">
          <div class="container mx-auto px-4">
            <div class="row">
              {#each $verifiedCards as card (card.id)}
                <div
                  class="col-12 col-sm-6 col-md-6 col-lg-6 mb-8"
                  style="margin-bottom: 2rem;"
                >
                  <IdeaCard {card} />
                </div>
              {/each}
            </div>
            <!-- Divider -->
            <div
              style="margin-top: 2rem; margin-bottom: 2rem; height: 2px; background-color: gray;"
              class="w-full"
            />
            <div class="row">
              {#each $unverifiedCards as card (card.id)}
                <div
                  class="col-12 col-sm-6 col-md-6 col-lg-6 mb-8"
                  style="margin-top: 2rem;"
                >
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
