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
  });

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
  let bannerImage = "../../img/Banner1u.png";
  let title = "BitSpark";
  let subtitle = "The idea engine";
</script>

<div style="position: relative;">
  <main class="overview-page bg-blueGray-200">
    <div class="flex">
      <Menu />
      <div class="flex-grow">
        <Banner {bannerImage} {title} {subtitle} show_right_text={true} />
        <div class={contentContainerClass}>
          <section class="relative py-16 bg-blueGray-200">
            <div class="container mx-auto px-4">
              <div
                class="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg"
              >
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
                  </div>
                </div>
              </div>
              <!--Comments-->
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
