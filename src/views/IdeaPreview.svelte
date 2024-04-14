<!-- IdeaDetail.svelte -->
<script>
  import { previewStore } from "../previewStore.js";
  import Menu from "../components/Sidebar/Sidebar.svelte";
  import Footer from "../components/Footers/Footer.svelte";
  import { contentContainerClass } from "../helperStore.js";
  import Banner from "../components/Banner.svelte";
  import ToolBar from "../components/Toolbar/Toolbar.svelte";
  import { nostrManager } from "../backend/NostrManagerStore.js";
  import IdeaWidget from "../components/Widgets/IdeaWidget.svelte";
  import CommentWidget from "../components/CommentWidget.svelte";
  import JobWidget from "../components/JobWidget.svelte";
  import ZapWidget from "../components/ZapWidget.svelte";

  let pubkey = null;

  $: if ($nostrManager) {
    pubkey = $nostrManager.publicKey;
  }
</script>

<main class="overview-page">
  <Menu />
  <div class="flex-grow">
    <Banner
      bannerImage={$previewStore.bannerUrl}
      title={$previewStore.name}
      subtitle={$previewStore.subtitle}
      show_right_text={false}
    />
    <ToolBar
      lnAddress={$previewStore.lightningAddress}
      {pubkey}
      githubRepo={$previewStore.githubRepo}
    />

    <div class={$contentContainerClass}>
      <IdeaWidget idea={$previewStore} preview={true} />
      <ZapWidget />
      <div class="single-card container">
        <JobWidget />
      </div>
      <div class="single-card container">
        <CommentWidget />
      </div>
    </div>
  </div>
  <Footer />
</main>
