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
  import Banner from "../components/Banner.svelte";

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
  let contentContainerClass = "combined-content-container";

  $: {
    if ($sidebarOpen) {
      contentContainerClass = "combined-content-container sidebar-open";
    } else {
      contentContainerClass = "combined-content-container";
    }
  }
  $: fetchData(), $helperStore;
  $: fetchComments(), $helperStore;
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

    <div class="content-overlay">
      <div class="content-icons">
        <button on:click={supportIdea} class="support-button">
          <img
            src="../../img/lightning.png"
            alt="Support via Bitcoin Lightning"
          />
        </button>
        {#if creator_profile && creator_profile.picture}
          <ProfileImg
            profile={creator_profile}
            style={{ width: "40px", height: "40px" }}
          />
        {/if}
        <a href={idea.githubRepo} target="_blank" class="github-icon">
          <i class="fab fa-github text-white" style="font-size: 2.5rem;" />
        </a>
      </div>
    </div>

    <div class={contentContainerClass}>
      <div class="container bg-card relative flex flex-col min-w-0 break-words">
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
            <h2 class="base-h2">
              {idea.name}
            </h2>
            <h4 class="base-h4">
              {"Abstract"}
            </h4>
            <p class="abstract-text">
              {idea.abstract}
            </p>
            <hr class="my-6" />
            <p class="html-content">
              {@html idea.message}
            </p>
          </div>
        </div>
      </div>

      <div class="container bg-card p-4">
        <h4 class="base-h4">Comments</h4>
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
          <div style="text-align: right;">
            <button
              class="bg-orange-500 active:bg-orange-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none mt-4 mb-1 ease-linear transition-all duration-150"
              type="button"
              on:click={submitComment}
            >
              Send
            </button>
          </div>
        </div>
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
