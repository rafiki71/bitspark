<!-- JobMarket.svelte -->
<script>
  import { onMount, onDestroy } from "svelte";
  import Menu from "../components/Sidebar/Sidebar.svelte";
  import JobMarket from "../components/JobMarket/JobMarketWidget.svelte";
  import Footer from "../components/Footers/Footer.svelte";
  import { contentContainerClass } from "../helperStore.js";
  import Banner from "../components/Banner.svelte";
  import ToolBar from "../components/Toolbar/Toolbar.svelte";

  onMount(async () => {});

  let bannerImage = "../../img/Banner1u.png";
  let title = "BitSpark";
  let subtitle = "Job Market";
</script>

<main class="overview-page">
  <Menu />
  <div class="flex-grow">
    <Banner {bannerImage} {title} {subtitle} show_right_text={false} />
    <ToolBar />
    <div class={$contentContainerClass}>
      <JobMarket />
    </div>
  </div>
  <Footer />
</main>

<style>
  .overview-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 0;
    margin: 0 auto;
  }

  .flex-grow {
    flex-grow: 1;
  }
</style>
