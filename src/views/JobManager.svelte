<!-- IdeaDetail.svelte -->
<script>
  import { onMount } from "svelte";
  import Menu from "../components/Menu.svelte";
  import JobManager from "../components/JobManager2/JobManager.svelte";
  import Footer from "../components/Footers/FooterBS.svelte";
  import { helperStore } from "../helperStore.js"; // Import the store
  import { sidebarOpen } from "../helperStore.js";
  import Banner from "../components/Banner.svelte";
  import ToolBar from "../components/ToolBar.svelte";

  onMount(async () => {
  });

  let contentContainerClass = "combined-content-container";

  $: {
    if ($sidebarOpen) {
      contentContainerClass = "combined-content-container sidebar-open";
    } else {
      contentContainerClass = "combined-content-container";
    }
  }

  let bannerImage = "../../img/Banner1u.png";
  let title = "BitSpark";
  let subtitle = "The idea engine";
</script>

<main class="overview-page">
  <Menu />
  <div class="flex-grow">
    <Banner
      bannerImage={bannerImage}
      title={title}
      subtitle={subtitle}
      show_right_text={false}
    />
    <ToolBar
    />

    <div class={contentContainerClass}>
      <div class="single-card container">
        <JobManager/>
      </div>
    </div>
    <Footer />
  </div>
</main>
