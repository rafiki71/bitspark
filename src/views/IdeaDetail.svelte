<!-- IdeaDetail.svelte -->
<script>
  import { onMount } from "svelte";
  import { Link } from "svelte-routing";
  import { sendSatsLNurl } from "../LNHelper.js";
  import Menu from "../components/Menu.svelte";
  import ProfileImg from "../components/ProfileImg.svelte";
  import Footer from "../components/Footers/FooterBS.svelte";
  import { helperStore } from "../helperStore.js"; // Import the store
  import { sidebarOpen } from "../helperStore.js";

  function toggleSidebar() {
    sidebarOpen.update((value) => !value);
  }
  export let id;

  let idea = {
    bannerImage:
      "https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80",
    id: 0,
    message: "Eine innovative App, die das Leben der Menschen verbessert.",
    name: "Innovative App",
    subtitle: "Idea Engine",
  };

  let comments = [];
  let newComment = "";
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
    await fetchComments();
  });

  async function fetchData() {
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

  async function fetchComments() {
    try {
      const fetchedComments = await $helperStore.getComments(id);
      comments = await Promise.all(
        fetchedComments.map(async (comment) => {
          const profile = await $helperStore.getProfile(comment.pubkey);
          profiles[comment.pubkey] = profile;
          return {
            id: comment.id,
            comment: comment.content,
            name: comment.name,
            picture: profile.picture, // Benutze das geladene Profilbild
            pubkey: comment.pubkey,
            githubVerified: profile.githubVerified,
          };
        })
      );
    } catch (error) {
      console.error("Error fetching comments data:", error);
    }
  }

  async function submitComment() {
    if (newComment.trim() === "") return;

    try {
      const commentId = await $helperStore.postComment(id, newComment);
      await fetchComments();
      newComment = "";
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  }
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
            style="background-image: url({idea.bannerImage});"
          >
            <span
              id="blackOverlay"
              class="w-full h-full absolute opacity-50 bg-black"
            />
            <div
              class="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full"
            >
              <div class={titleClass}>
                <h1 class="text-4xl font-bold text-white">{idea.name}</h1>
                <h2 class="text-2xl font-light text-white">{idea.subtitle}</h2>
              </div>
              <!-- Hinzugefügt: GitHub-Icon in der oberen rechten Ecke -->
              <div
                class="absolute top-4 right-4 text-3xl text-white flex justify-end items-center gap-6"
              >
                <button on:click={supportIdea} style="padding: 0;">
                  <img
                    src="../../img/lightning.png"
                    style="height: 2.5rem; width: 2.5rem;"
                    alt="Support via Bitcoin Lightning"
                  />
                </button>
                {#if creator_profile && creator_profile.picture}
                  <div style="margin-right: 10px;">
                    <ProfileImg
                      profile={creator_profile}
                      style={{ width: "40px", height: "40px" }}
                    />
                  </div>
                {/if}
                <a href={idea.githubRepo} target="_blank">
                  <i
                    class="fab fa-github text-white"
                    style="font-size: 2.5rem;"
                  />
                </a>
              </div>
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
        </section>
        <div class={contentContainerClass}>
          <section class="relative py-16 bg-blueGray-200">
            <div class="container mx-auto px-4">
              <div
                class="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg"
              >
                {#if creator_profile && creator_profile.pubkey === $helperStore.publicKey}
                  <button
                    on:click={deleteIdea}
                    class="absolute top-4 right-4 text-gray-400"
                  >
                    <i class="fas fa-times-circle" />
                  </button>
                {/if}
                <div class="px-6">
                  <div class="text-center mt-6">
                    <h3
                      class="text-4xl font-semibold leading-normal mb-2 text-blueGray-700"
                    >
                      {idea.name}
                    </h3>
                    <h2
                      class="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mt-6"
                    >
                      {"Abstract"}
                    </h2>
                    <p
                      class="message-text"
                      style="width: 70%; margin: 2rem auto; text-align: justify; font-size: 1.2em; line-height: 1.6em;"
                    >
                      {idea.abstract}
                    </p>
                    <hr class="my-6" />
                    <!-- Strich -->
                    <h2
                      class="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mt-6"
                    >
                      {idea.name}
                    </h2>
                    <p
                      class="message-text"
                      style="width: 70%; margin: 0 auto; text-align: justify;"
                    >
                      {@html idea.message}
                    </p>

                    <hr class="my-4" />
                    <!-- Strich -->
                    <div class="flex items-center justify-center gap-4 mb-4">
                      <!-- Hinzufügen von justify-center zum Zentrieren entlang der Hauptachse -->
                      <p class="mb-0">Support via</p>
                      <!-- Entfernen Sie margin-bottom -->
                      <button
                        on:click={supportIdea}
                        style="padding: 0; display: flex; align-items: center;"
                      >
                        <img
                          src="/img/lightning.png"
                          style="height: 2.5rem; width: 2.5rem;"
                          alt="Support via Bitcoin Lightning"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!--Comments-->
              <div class="bg-white w-full mb-6 shadow-xl rounded-lg p-4">
                <h4 class="text-2xl font-semibold text-blueGray-700 mb-4">
                  Comments
                </h4>
                <ul>
                  {#each comments as comment (comment.id)}
                    <li class="flex items-center gap-4 my-2">
                      {#if comment.picture}
                        <div style="margin-right: 10px;">
                          <ProfileImg
                            profile={comment}
                            style={{ width: "40px", height: "40px" }}
                          />
                        </div>
                      {/if}
                      <div>
                        <h3 class="font-bold text-sm">{comment.name}</h3>
                        <p class="text-m">{comment.comment}</p>
                      </div>
                    </li>
                  {/each}
                </ul>
                <div class="mt-6">
                  <label for="newComment" class="text-lg text-blueGray-600"
                    >Your Comment:</label
                  >
                  <textarea
                    id="newComment"
                    class="w-full h-24 p-2 mt-2 rounded-md border-2 border-blueGray-200"
                    bind:value={newComment}
                    placeholder="Schreibe hier deinen Kommentar..."
                  />
                  <button
                    class="bg-red-400 active:bg-red-500 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none mt-4 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    on:click={submitComment}
                  >
                    Send
                  </button>
                </div>
              </div>
              <Link to="/overview">
                <button
                  class="bg-red-400 active:bg-red-500 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none mb-1 ease-linear transition-all duration-150"
                  type="button"
                >
                  Back
                </button>
              </Link>
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
    left: 215px;
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
