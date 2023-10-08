<!-- CommentWidget.svelte -->

<script>
  import { helperStore } from "../helperStore.js";
  import ProfileImg from "../components/ProfileImg.svelte";

  export let id;

  let comments = [];
  let newComment = "";
  let profiles = {};

  async function fetchComments() {
    if (!$helperStore) {
      return;
    }

    try {
      const fetchedComments = await $helperStore.getComments(id);
      comments = await Promise.all(
        fetchedComments.map(async (comment) => {
          const profile = await $helperStore.getProfile(comment.pubkey);
          profiles[comment.pubkey] = profile;
          return {
            id: comment.id,
            comment: comment.content,
            name: comment.name,
            picture: profile.picture,
            pubkey: comment.pubkey,
            githubVerified: profile.githubVerified,
          };
        })
      );
    } catch (error) {
      console.error("Error fetching comments data:", error);
    }
  }

  async function submitComment() {
    if (newComment.trim() === "") return;

    try {
      const commentId = await $helperStore.postComment(id, newComment);
      await fetchComments();
      newComment = "";
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  }

  $: fetchComments(), $helperStore;
</script>

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
