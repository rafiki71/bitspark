<script>
  import { nostrManager } from "../../backend/NostrManagerStore.js";
  import { onMount, onDestroy } from "svelte";
  import { socialMediaManager } from "../../backend/SocialMediaManager.js";
  import LikeIcon from "../LikeIcon.svelte";
  import ShareIcon from "../ShareIcon.svelte";
  import { navigate } from "svelte-routing";
  
  export let card;

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
    if(card) {
      socialMediaManager.getProfile(card.pubkey);
    }
  }

  $: $nostrManager, initialize();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="card">
  <div class="card-content" on:click={goToIdea}>
    <img
      src={card.bannerImage}
      alt="Banner of {card.name}"
      class="banner-image"
    />
    <div class="content">
      <h3>{card.name}</h3>
      <h4>{card.subtitle}</h4>
      <p>{truncateMessage(card.abstract, 100)}</p>
    </div>
  </div>
  <div class="actions">
    <LikeIcon event_id={card.id} />
    <ShareIcon event_id={card.id} />
  </div>
</div>

<style>
  .card {
    background: #ffffff;
    overflow: hidden;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 4px solid #ffffff;
    box-shadow: 0 5px 10px #0000008c;
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
    height: 200px;
    object-fit: cover;
  }

  .content,
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
