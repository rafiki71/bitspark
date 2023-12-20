<!-- JobChat.svelte -->
<script>
  export let selectedJob;

  function getJobTitle(job) {
    const titleTag = job?.tags?.find(tag => tag[0] === 'jTitle');
    return titleTag ? titleTag[1] : 'Error';
  }
</script>

<div class="job-chat">
  {#if selectedJob}
      <h2>{getJobTitle(selectedJob)}</h2>
      <!-- Hier könnten weitere Job-Details und zugehörige Nostr-Events angezeigt werden -->
  {/if}
</div>

<style>
  .job-chat {
    /* Design für den Chat-Bereich */
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin: 10px;
  }

  h2 {
    /* Stil für die Job-Titel im Chat */
    color: #333;
    margin-bottom: 20px;
  }

  /* Weitere Stile für Nachrichten, Buttons usw. */
</style>
