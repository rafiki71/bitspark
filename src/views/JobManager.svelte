<!-- JobManagerView.svelte -->
<script>
  import { onMount } from "svelte";
  import Menu from "../components/Sidebar/Sidebar.svelte";
  import JobManager from "../components/JobManager2/JobManager.svelte";
  import Footer from "../components/Footers/Footer.svelte";
  import { contentContainerClass } from "../helperStore.js";
  import Banner from "../components/Banner.svelte";
  import ToolBar from "../components/Toolbar/Toolbar.svelte";

  onMount(async () => {});

  let bannerImage = "../../img/Banner1u.png";
  let title = "BitSpark";
  let subtitle = "The idea engine";
</script>

<main class="overview-page">
  <Menu />
  <div class="flex-grow">
    <Banner {bannerImage} {title} {subtitle} show_right_text={false} />
    <ToolBar />
    <div class={$contentContainerClass}>
      <JobManager />
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
