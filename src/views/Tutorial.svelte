<!-- IdeaDetail.svelte -->
<script>
  import { onMount } from "svelte";
  import Menu from "../components/Sidebar/Sidebar.svelte";
  import Footer from "../components/Footers/Footer.svelte";
  import { contentContainerClass } from "../helperStore.js";
  import Banner from "../components/Banner.svelte";
  import tutorials from "../Tutorials.js";
  import ToolBar from "../components/Toolbar/Toolbar.svelte";

  export let id;
  let tutorial = null;

  onMount(async () => {
    tutorial = tutorials[Number(id)];
    console.log("done");
  });

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
      <ToolBar />
      <div class={$contentContainerClass}>
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
  </div>
  <Footer />
</main>
