<!-- IdeaDetail.svelte -->
<script>
  import { onMount } from "svelte";
  import { Link } from "svelte-routing";
  import Menu from "../components/Menu.svelte";
  import Footer from "../components/Footers/FooterBS.svelte";
  import { sidebarOpen } from "../helperStore.js";
  import Banner from "../components/Banner.svelte";
  import tutorials from "../Tutorials.js";

  export let id;
  let tutorial = null;

  onMount(async () => {
    tutorial = tutorials[Number(id)];
    console.log("done");
  });

  let contentContainerClass = "combined-content-container";

  $: {
    if ($sidebarOpen) {
      contentContainerClass = "combined-content-container sidebar-open";
    } else {
      contentContainerClass = "combined-content-container";
    }
  }
  $: {
    tutorial = tutorials[id];
  }
</script>

<main class="overview-page">
  <Menu />
  <div class="flex-grow">
    {#if tutorial}
      <Banner
        bannerImage={tutorial.bannerImage}
        title={tutorial.title}
        subtitle={tutorial.subtitle}
        show_right_text={false}
      />
      <div class={contentContainerClass}>
        <div
          class="container bg-card relative flex flex-col min-w-0 break-words"
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
            </div>
          </div>
        </div>
      </div>
    {:else}
      <div>Loading...</div>
    {/if}
    <Footer />
  </div>
</main>
