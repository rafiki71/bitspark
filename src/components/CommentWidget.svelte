<!-- CommentWidget.svelte -->

<script>
  import { nostrCache } from "../backend/NostrCacheStore.js";
  import { nostrManager } from "../backend/NostrManagerStore.js";
  import ProfileImg from "../components/ProfileImg.svelte";
  import { onMount, onDestroy } from "svelte";
  import { socialMediaManager } from "../backend/SocialMediaManager.js";

  export let id;

  let comments = [];
  let newComment = "";
  let pubkeys = new Set();

  onMount(() => {
    if ($nostrManager) {
      initialize();
    }
  });

  $: $nostrManager && initialize();
  $: $nostrCache && fetchComments();

  function initialize() {
    $nostrManager.subscribeToEvents({
      kinds: [1], // Kommentare
      "#e": [id],
      "#s": ["bitspark"],
    });
    // Hier könnten wir auch die Profil-Events abonnieren
    subscribeProfileEvents();
  }

  async function subscribeProfileEvents() {
    if (pubkeys.size > 0) {
      socialMediaManager.subscribeProfiles(Array.from(pubkeys));
    }
  }

  async function fetchComments() {
    const commentEvents = await $nostrCache.getEventsByCriteria({
      kinds: [1],
      tags: {
        e: [id],
        s: ["bitspark"],
      },
    });

    pubkeys = new Set(commentEvents.map((event) => event.pubkey));
    subscribeProfileEvents(); // Neu abonnieren für die aktualisierten pubkeys

    const profilePromises = commentEvents.map(async (event) => {
      let profile = await socialMediaManager.getProfile(event.pubkey);
      if(!profile) return;
      return {
        id: event.id,
        comment: event.content,
        name: profile.name || "NoName",
        picture: profile.picture || "",
        pubkey: event.pubkey,
        verified: profile.verified,
      };
    });

    try {
      comments = await Promise.all(profilePromises);
      comments = comments.filter(comment => comment != null);
    } catch (error) {
      console.error("Error fetching comments data:", error);
    }
  }

  async function submitComment() {
    if (!newComment.trim() || !$nostrManager || !$nostrManager.write_mode)
      return;

    const tags = [
      ["e", id],
      ["s", "bitspark"],
    ];
    try {
      await $nostrManager.sendEvent(1, newComment, tags);
      //await fetchComments();
      newComment = "";
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  }

  onDestroy(() => {
    if ($nostrManager) {
      $nostrManager.unsubscribeAll();
    }
  });
</script>

<!-- HTML-Markup und Styles bleiben unverändert -->

<h4 class="base-h4">Comments</h4>
<ul>
  {#each comments as comment (comment.id)}
    <li class="flex items-center gap-4 my-2">
      {#if comment.picture}
        <div style="margin-right: 10px;">
          <ProfileImg
            profile={comment}
            style={{ width: "40px", height: "40px" }}
          />
        </div>
      {/if}
      <div>
        <h3 class="font-bold text-sm">{comment.name}</h3>
        <p class="text-m">{comment.comment}</p>
      </div>
    </li>
  {/each}
</ul>
<div class="mt-6">
  <label for="newComment" class="text-lg text-blueGray-600">Your Comment:</label
  >
  <textarea
    id="newComment"
    class="w-full h-24 p-2 mt-2 rounded-md border-2 border-blueGray-200"
    bind:value={newComment}
    placeholder="Schreibe hier deinen Kommentar..."
  />
  <div style="text-align: right;">
    <button
      class="bg-orange-500 active:bg-orange-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none mt-4 mb-1 ease-linear transition-all duration-150"
      type="button"
      on:click={submitComment}
    >
      Send
    </button>
  </div>
</div>

<style>
  /* Deine Styles hier (falls benötigt) */
</style>
