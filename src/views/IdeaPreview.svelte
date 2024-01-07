<!-- IdeaDetail.svelte -->
<script>
  import ProfileImg from "../components/ProfileImg.svelte";
  import { previewStore } from "../previewStore.js";
  import Menu from "../components/Menu.svelte";
  import Footer from "../components/Footers/FooterBS.svelte";
  import { sidebarOpen } from "../helperStore.js";
  import Banner from "../components/Banner.svelte";
  import ToolBar from "../components/ToolBar.svelte";
  import { nostrManager } from "../backend/NostrManagerStore.js";

  let comments = [];
  let newComment = "";

  async function submitComment() {}

  let contentContainerClass = "combined-content-container";
  let titleClass = "title-class";

  $: {
    if ($sidebarOpen) {
      contentContainerClass = "combined-content-container sidebar-open";
      titleClass = "title-class sidebar-open";
    } else {
      contentContainerClass = "combined-content-container";
      titleClass = "title-class";
    }
  }
</script>

<main class="overview-page">
  <Menu />
  <div class="flex-grow">
    <Banner
      bannerImage={$previewStore.bannerUrl}
      title={$previewStore.name}
      subtitle={$previewStore.subtitle}
      show_right_text={false}
    />
    <ToolBar
      lnAddress={$previewStore.lightningAddress}
      pubkey={$nostrManager.publicKey}
      githubRepo={$previewStore.githubRepo}
    />
    
    <div class={contentContainerClass}>
      <div class="container bg-card relative flex flex-col min-w-0 break-words">
        <div class="px-6">
          <div class="text-center mt-6">
            <h2 class="base-h2">
              {$previewStore.name} Preview
            </h2>
            <h4 class="base-h4">
              {"Abstract"}
            </h4>
            <p class="abstract-text">
              {$previewStore.abstract}
            </p>
            <hr class="my-6" />
            <p class="html-content">
              {@html $previewStore.message}
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
  </div>
  <Footer />
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
