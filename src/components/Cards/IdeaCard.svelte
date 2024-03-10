<!-- IdeaCard.svelte -->
<script>
  export let card;
  import { Link } from "svelte-routing";
  import { nostrManager } from "../..//backend/NostrManagerStore.js";
  import { nostrCache } from "../../backend/NostrCacheStore.js";
  import { onMount, onDestroy } from "svelte";
  import { socialMediaManager } from "../../backend/SocialMediaManager.js";

  function truncateMessage(message, maxLength) {
    const strippedMessage = message.replace(/<[^>]+>/g, "");
    return strippedMessage.length <= maxLength
      ? message
      : message.slice(0, maxLength) + "...";
  }

  onMount(() => {
    initialize();
  });

  function initialize() {
    socialMediaManager.getProfile(card.pubkey);
  }

  $: $nostrManager, initialize();
</script>

<div
  class="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-xl"
>
  <img
    src={card.bannerImage}
    alt="Idea banner"
    class="w-full h-48 object-cover rounded-t-lg"
  />
  <div class="px-6 py-4">
    <h3 class="text-2xl font-semibold text-blueGray-700 mb-2">{card.name}</h3>
    <h4 class="text-xl font-medium text-blueGray-500 mb-4">{card.subtitle}</h4>
    <p class="text-lg text-blueGray-600">
      {truncateMessage(card.abstract, 1000)}
    </p>
  </div>
  <div class="px-6 py-4 flex items-center justify-end">
    <Link
      class="bg-orange-500 active:bg-orange-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
      to={`/idea/${card.id}`}
    >
      Show Idea
    </Link>
  </div>
</div>
