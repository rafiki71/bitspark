<!-- IdeaDetail.svelte -->
<script>
  import { onMount, onDestroy } from "svelte";
  import Menu from "../components/Sidebar/Sidebar.svelte";
  import CommentWidget from "../components/CommentWidget.svelte";
  import JobWidget from "../components/JobWidget.svelte";
  import Footer from "../components/Footers/Footer.svelte";
  import IdeaBannerWidget from "../components/Widgets/Banner/IdeaBannerWidget.svelte";

  import ToolBar from "../components/Toolbar/Toolbar.svelte";
  import { contentContainerClass } from "../helperStore.js";
  import { nostrCache } from "../backend/NostrCacheStore.js";
  import { nostrManager } from "../backend/NostrManagerStore.js";
  import { NOSTR_KIND_IDEA } from "../constants/nostrKinds";
  import ZapWidget from "../components/ZapWidget.svelte";
  import IdeaWidget from "../components/Widgets/IdeaWidget.svelte";
  import { socialMediaManager } from "../backend/SocialMediaManager.js";

  export let id;
  let creator_profile = null;
  let idea = {};

  async function initialize() {
    if ($nostrManager) {
      $nostrManager.subscribeToEvents({
        kinds: [NOSTR_KIND_IDEA],
        "#s": ["bitspark"],
        ids: [id],
      });
    }
  }

  function fetchIdea() {
    const fetchedIdea = $nostrCache.getEventById(id);
    if (fetchedIdea) {
      idea = transformIdea(fetchedIdea);
      fetchCreatorProfile();
    }
  }

  function transformIdea(event) {
    const tags = event.tags.reduce(
      (tagObj, [key, value]) => ({ ...tagObj, [key]: value }),
      {},
    );

    return {
      id: event.id,
      name: tags.iName,
      subtitle: tags.iSub,
      bannerImage: tags.ibUrl || "default_image_url",
      message: event.content,
      githubRepo: tags.gitrepo,
      lnAdress: tags.lnadress,
      pubkey: event.pubkey,
      abstract: tags.abstract,
    };
  }
  async function fetchCreatorProfile() {
    if (idea) {
      creator_profile = await socialMediaManager.getProfile(idea.pubkey);
    }
  }

  onMount(() => {
    initialize();
  });

  onDestroy(() => {
    $nostrManager.unsubscribeAll();
  });

  $: if ($nostrCache) {
    fetchIdea();
  }

  $: if ($nostrManager) {
    initialize();
  }
</script>

<main class="overview-page">
  <Menu />
  <div class="flex-grow">
    <IdeaBannerWidget {id} />
    <ToolBar
      lnAddress={idea.lnAdress}
      pubkey={idea.pubkey}
      githubRepo={idea.githubRepo}
    />

    <div class={$contentContainerClass}>
      <IdeaWidget {creator_profile} {idea} />
      <ZapWidget eventId={id} />
      <div class="single-card container">
        <JobWidget ideaID={id} creatorPubKey={idea.pubkey} />
      </div>
      <div class="single-card container">
        <CommentWidget {id} />
      </div>
    </div>
  </div>
  <Footer />
</main>
