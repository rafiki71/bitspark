<!-- IdeaDetail.svelte -->
<script>
  import { onMount } from "svelte";
  import { Link } from "svelte-routing";
  import { sendSatsLNurl } from "../LNHelper.js";
  import ProfileImg from "../components/ProfileImg.svelte";
  import { helperStore } from "../helperStore.js"; // Import the store
  import { previewStore } from "../previewStore.js";
  import Menu from "../components/Menu.svelte";
  import Footer from "../components/Footers/FooterBS.svelte";
  import { sidebarOpen } from "../helperStore.js";
  import Banner from "../components/Banner.svelte";


  let comments = [];
  let newComment = "";
  let creator_profile = null;

  onMount(async () => {
    await fetchData();
  });

  async function fetchData() {
    try {
      creator_profile = await $helperStore.getProfile($helperStore.publicKey);
    } catch (error) {
      console.error("Error fetching idea data:", error);
    }
  }

  async function supportIdea() {
    await sendSatsLNurl($previewStore.lnAdress);
  }

  async function submitComment() {}

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
        <Banner
          bannerImage={$previewStore.bannerUrl}
          title={$previewStore.name}
          subtitle={$previewStore.subtitle}
          show_right_text={false}
        />
        <div
          class="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full"
        >
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
            <a href={$previewStore.githubRepo} target="_blank">
              <i class="fab fa-github text-white" style="font-size: 2.5rem;" />
            </a>
          </div>
        </div>
        <div class={contentContainerClass}>
          <section class="content-container relative py-16 bg-blueGray-200">
            <div class="container mx-auto px-4">
              <div
                class="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg"
              >
                <div class="px-6">
                  <div class="text-center mt-6">
                    <h3
                      class="text-4xl font-semibold leading-normal mb-2 text-blueGray-700"
                    >
                      {$previewStore.name} Preview
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
                      {$previewStore.abstract}
                    </p>
                    <hr class="my-6" />
                    <!-- Strich -->
                    <h2
                      class="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mt-6"
                    >
                      {$previewStore.name}
                    </h2>
                    <p
                      class="message-text"
                      style="width: 70%; margin: 0 auto; text-align: justify;"
                    >
                      {@html $previewStore.message}
                    </p>

                    <hr class="my-4" />
                    <!-- Strich -->
                    <div class="flex items-center justify-center gap-4">
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
              <Link to="/postidea">
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
