<script>
  export let card;
  import { nostrManager } from "../../backend/NostrManagerStore.js";
  import { onMount, onDestroy } from "svelte";
  import { socialMediaManager } from "../../backend/SocialMediaManager.js";
  import LikeIcon from "../LikeIcon.svelte";
  import ShareIcon from "../ShareIcon.svelte";
  import { navigate } from "svelte-routing";

  function goToIdea() {
    navigate(`/idea/${card.id}`);
  }

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

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="md:w-6/12 lg:w-3/12">
  <div class="card">
    <div class="card-content" on:click={goToIdea}>
      <img
        src={card.bannerImage}
        alt="Banner of {card.name}"
        class="banner-image"
      />
      <div class="content">
        <h4 class="text-xl font-bold">{card.name}</h4>
        <div class="text-md font-light mt-2">
          {card.subtitle}
        </div>
      </div>
    </div>
    <!-- <div class="actions">
    <LikeIcon event_id={card.id} />
    <ShareIcon event_id={card.id} />
  </div> -->
  </div>
</div>

<!-- <Link
  to={`/idea/${idea.id}`}
  class="w-full md:w-6/12 lg:w-3/12 px-4 mb-6 no-underline"
>
  <div
    class="shadow-lg rounded-lg text-center relative min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg pointer-events-auto cursor-pointer lg:w-full"
  >
    <div
      class="relative flex flex-col min-w-0 w-full mb-0 shadow-lg rounded-lg bg-blueGray-600"
    >
      <img
        class="align-middle border-none max-w-full h-auto rounded-lg"
        src={idea.bannerImage}
        alt={idea.name}
      />
    </div>
    <blockquote class="relative p-8 mb-4">
      <h4 class="text-xl font-bold text-blueGray-700">
        {idea.name}
      </h4>
      {#if idea.subtitle}
        <p class="text-md font-light mt-2 text-blueGray-600">
          {idea.subtitle}
        </p>
      {/if}
    </blockquote>
  </div>
</Link> -->

<style>
  .card {
    background: transparent;
    overflow: hidden;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 4px solid #ffffff;
    box-shadow: 0 5px 10px #0000008c;
    margin-right: 15px;
    margin-left: 15px;
    margin-bottom: 15px;
  }

  .card:hover {
    transform: scale(1.03);
    background: #ffffff;
    box-shadow: 0 10px 20px #0000008c;
  }

  .card-content {
    cursor: pointer;
    background: #ffffff;
  }

  .banner-image {
    width: 100%;
    height: 250px;
    object-fit: cover;
  }

  .content {
    text-align: center;
    padding: 1rem;
  }

  .actions {
    padding: 15px;
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f4f4f4;
  }
</style>
