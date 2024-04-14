<script>
  export let card;
  import { nostrManager } from "../../backend/NostrManagerStore.js";
  import { onMount, onDestroy } from "svelte";
  import { socialMediaManager } from "../../backend/SocialMediaManager.js";
  import LikeIcon from "../LikeIcon.svelte"; // Pfad anpassen, je nach Struktur
  import ShareIcon from "../ShareIcon.svelte"; // Pfad anpassen, je nach Struktur
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
<div class="card" on:click={goToIdea}>
  <img src={card.bannerImage} alt="Banner of {card.name}" class="banner-image"/>
  <div class="content">
    <h3>{card.name}</h3>
    <h4>{card.subtitle}</h4>
    <p>{truncateMessage(card.abstract, 100)}</p>
  </div>
  <div class="actions">
    <LikeIcon event_id={card.id} />
    <ShareIcon event_id={card.id} />
  </div>
</div>

<style>
  .card {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .card:hover {
    box-shadow: 0 6px 10px rgba(0,0,0,0.25);
    transform: scale(1.03); 
  }

  .banner-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    transition: transform 0.3s ease; 
  }

  .content, .actions {
    padding: 15px;
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f4f4f4;
  }
</style>