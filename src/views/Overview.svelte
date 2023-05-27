<!-- Profile.svelte -->

<script>
  // Core components
  import IdeaCard from "components/Cards/IdeaCard.svelte";
  import { onMount } from "svelte";
  import { Link, navigate } from "svelte-routing";
  import { helperStore } from "../helperStore.js";
  import { get } from "svelte/store";
  import ProfileImg from "../components/ProfileImg.svelte";

  let verifiedCards = [];
  let unverifiedCards = [];
  let publicKey = "";
  let profilePicture = "";
  let profile = null;

  onMount(async () => {
    try {
      const bitstarterHelper = get(helperStore);
      publicKey = bitstarterHelper.publicKey;
      profile = await bitstarterHelper.getProfile(publicKey);
      profilePicture = profile.picture;
      const ideas = await bitstarterHelper.getIdeas();
      let verified = [];
      let unverified = [];
      ideas.forEach((idea) => {
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
        };

        if (idea.githubVerified) {
          verified.push(card);
        } else {
          unverified.push(card);
        }
      });
      // Assign outside of forEach loop
      verifiedCards = verified;
      unverifiedCards = unverified;
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  });
</script>

<div>
  <main class="profile-page">
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
          <h1 class="text-4xl font-bold text-white">Bitspark</h1>
          <h2 class="text-2xl font-light text-white">Idea Engine</h2>
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
              <ProfileImg {profile} style={{ width: "40px", height: "40px" }} />
            </div>
          {/if}
          <Link to="/postidea">
            <button class="bg-green-500 text-white font-bold py-2 px-4 rounded">
              Create Idea
            </button>
          </Link>
        </div>
      </div>
      <!-- ... -->
    </section>
    <!-- Hauptkomponente -->

    <section class="relative py-16 bg-blueGray-200">
      <div class="container mx-auto px-4">
        <div class="row">
          {#each verifiedCards as card}
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
          {#each unverifiedCards as card}
            <div
              class="col-12 col-sm-6 col-md-6 col-lg-6 mb-8"
              style="margin-top: 2rem;"
            >
              <IdeaCard {card} />
            </div>
          {/each}
        </div>
      </div>
    </section>
  </main>
</div>
