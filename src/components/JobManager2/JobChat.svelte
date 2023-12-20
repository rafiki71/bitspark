<script>
  export let selectedJob;

  function getJobTitle(job) {
    const titleTag = job?.tags?.find(tag => tag[0] === 'jTitle');
    return titleTag ? titleTag[1] : 'Unbekannter Titel';
  }
</script>

<div class="job-chat">
  {#if selectedJob}
      <h2>{getJobTitle(selectedJob)}</h2>
      <!-- Hier könnten weitere Job-Details und zugehörige Nostr-Events angezeigt werden -->
  {/if}
</div>

<style>
  /* CSS-Stile für den Job-Chat */
</style>
