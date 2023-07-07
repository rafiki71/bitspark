<!-- IdeaDetail.svelte -->
<script>
  import { onMount } from "svelte";
  import { Link } from "svelte-routing";
  import Menu from "../components/Menu.svelte";
  import Footer from "../components/Footers/FooterBS.svelte";
  import { sidebarOpen } from "../helperStore.js";
  import Banner from "../components/Banner.svelte";
  import tutorials from "../Tutorials.js"

  export let id;
  let tutorial = null;

  onMount(async () => {
    tutorial = tutorials[Number(id)];
    console.log("done");
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
  $: {
    tutorial = tutorials[id];
  }
</script>

<div style="position: relative;">
  <main class="overview-page bg-blueGray-200">
    <div class="flex">
      <Menu />
      <div class="flex-grow">
        {#if tutorial}
        <Banner 
        bannerImage={tutorial.bannerImage} 
        title={tutorial.title} 
        subtitle={tutorial.subtitle} 
        show_right_text={false} />
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
                      {tutorial.title}
                    </h3>
                    <hr class="my-6" />
                    <!-- Strich -->
                    <p
                      class="message-text"
                      style="width: 70%; margin: 0 auto; text-align: justify;"
                    >
                      {@html tutorial.content}
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
        {:else}
        <div>Loading...</div>
        {/if}
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
