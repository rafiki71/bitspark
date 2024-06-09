<script>
import Chat from "../components/DirectMessage/Chat.svelte";
import "websocket-polyfill";
  import Menu from "../components/Sidebar/Sidebar.svelte";
  import Banner from "../components/Banner.svelte";
  import Footer from "../components/Footers/Footer.svelte";
  import ToolBar from "../components/Toolbar/Toolbar.svelte";
  import { contentContainerClass } from "../helperStore.js";
  import { nostrCache } from "../backend/NostrCacheStore.js";
  import { nostrManager } from "../backend/NostrManagerStore.js";
  import { socialMediaManager } from "../backend/SocialMediaManager.js";
  import { onDestroy } from "svelte";

  let bannerImage = "../../img/Banner1u.png";
  let title = "BitSpark";
  let subtitle = "The idea engine";
</script>

<main class="overview-page">
    <Menu />
    <div class="flex-grow">
      <Banner {bannerImage} {title} {subtitle} show_right_text={true} />
      <ToolBar />
      <div class={$contentContainerClass}>
        <Chat />
      </div>
      <Footer />
    </div>
  </main>
  
  <style>
    .content-section {
      display: flex;
      background-color: #e2e8f0 !important;
    }
  
    .content-container {
      flex-grow: 1;
      z-index: 0;
    }
  
    .flex-grow {
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
  