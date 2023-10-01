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
        <div class="single-card container">
          <div class="text-center mt-6 px-6">
            <h2 class="base-h2 text-color-df">
              {tutorial.title}
            </h2>
            <div class="single-card-content text-color-df">
              {@html tutorial.content}
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
