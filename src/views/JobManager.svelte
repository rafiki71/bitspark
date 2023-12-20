<!-- JobManagerView.svelte -->
<script>
  import { onMount } from "svelte";
  import Menu from "../components/Menu.svelte";
  import JobManager from "../components/JobManager2/JobManager.svelte";
  import Footer from "../components/Footers/FooterBS.svelte";
  import { sidebarOpen } from "../helperStore.js";
  import Banner from "../components/Banner.svelte";
  import ToolBar from "../components/ToolBar.svelte";

  onMount(async () => {});

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
    <Banner {bannerImage} {title} {subtitle} show_right_text={false} />
    <ToolBar />

    <div class={contentContainerClass}>
      <div class="single-card container">
        <JobManager />
      </div>
    </div>
  </div>
  <Footer />
</main>

<style>
  .overview-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh; /* Verwenden Sie min-height anstelle von height */
  }

  .flex-grow {
    flex-grow: 1; /* Lässt diesen Container den verfügbaren Platz einnehmen */
  }

  .combined-content-container, .single-card.container {
    overflow: auto; /* Erlaubt Scrollen, wenn der Inhalt die Höhe übersteigt */
  }

  /* Stellen Sie sicher, dass keine anderen Stile das Layout negativ beeinflussen */
</style>
