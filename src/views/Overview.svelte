<!-- Overview.svelte -->

<script>
  // Core components
  import IdeaCard from "components/Cards/IdeaCard.svelte";
  import { onMount } from "svelte";
  import ProfileImg from "../components/ProfileImg.svelte";
  import Menu from "../components/Menu.svelte";
  import Footer from "../components/Footers/FooterBS.svelte";
  import "websocket-polyfill";
  import { helperStore } from "../helperStore.js"; // Import the store
  import { ideas, verifiedCards, unverifiedCards } from "../ideaStore.js";
  import { sidebarOpen } from "../helperStore.js";

  function toggleSidebar() {
    sidebarOpen.update((value) => !value);
  }
  let publicKey = "";
  let profilePicture = "";
  let profile = null;
  let menuState = { logged_in: false, use_extension: true };

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
      titleClass = "title-class sidebar-open";
    } else {
      contentContainerClass = "content-container";
      titleClass = "title-class";
    }
  }
</script>

<div style="position: relative;">
  <main class="overview-page bg-blueGray-200">
    <div class="flex">
      <Menu />
      <div class="flex-grow">
        <section class="relative block h-500-px">
          <div
            class="absolute top-0 w-full h-full bg-center bg-cover"
            style="
          background-image: url(https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80);
        "
          >
            <span
              id="blackOverlay"
              class="w-full h-full absolute opacity-50 bg-black"
            />

            <!-- Titel und Untertitel hinzufügen -->
            <div
              class="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full"
            >
              <div class={titleClass}>
                <h1 class="text-4xl font-bold text-white">BitSpark</h1>
                <h2 class="text-2xl font-light text-white">Idea Engine</h2>
              </div>
            </div>

            <!-- Hinzugefügt: Schräg abgeschnittener Banner -->
            <div
              class="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
              style="transform: translateZ(0);"
            >
              <svg
                class="absolute bottom-0 overflow-hidden"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                version="1.1"
                viewBox="0 0 2560 100"
                x="0"
                y="0"
              >
                <polygon
                  class="text-blueGray-200 fill-current"
                  points="2560 0 2560 100 0 100"
                />
              </svg>
            </div>
            <!-- Ende: Schräg abgeschnittener Banner -->
            <!-- Create Idea Button hinzufügen -->
            <div class="absolute top-4 right-4 flex justify-end w-full">
              {#if profile}
                <div style="margin-right: 10px;">
                  <!-- Hinzugefügt: div mit margin-right -->
                  <ProfileImg
                    {profile}
                    style={{ width: "40px", height: "40px" }}
                  />
                </div>
              {/if}
            </div>
          </div>
          <!-- ... -->
        </section>
        <div class={contentContainerClass}>
          <!-- <div class="menu-container">
        <Menu />
      </div> -->
          <!-- Hauptkomponente -->
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
    </div>
  </main>
</div>

<style>
  .content-section {
    display: flex;
    background-color: #e2e8f0 !important;
  }

  .content-container {
    flex-grow: 1;
    z-index: 0;
  }

  .title-class {
    position: absolute;
    left: 0;
    right: 0;
    top: 1/2;
    transition: left 0.3s ease-in-out;
    left: 30px;
  }

  .title-class.sidebar-open {
    left: 315px;
  }

  /* .content-section.sidebar-open {
    flex-direction: row;
  } */

  /* .menu-container.sidebar-open {
    width: 300px;
    transition: width 0.3s ease-in-out;
  } */

  /* .content-container.sidebar-open {
    flex-grow: 1;
    transition: flex-grow 0.3s ease-in-out;
  } */

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
    margin-left: 300px; /* This should be equal to the width of the sidebar */
  }
</style>
