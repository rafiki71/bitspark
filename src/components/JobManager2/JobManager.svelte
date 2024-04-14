<!-- JobManagerWidget.svelte -->
<script>
  import JobList from "./JobList.svelte";
  import JobChat from "./JobChat.svelte";

  let selectedJob = null;

  function handleJobSelection(event) {
    selectedJob = event.detail.job;
  }
</script>

<div class="single-card container job-manager-widget">
  <div class="job-list">
    <JobList on:selectJob={handleJobSelection} />
  </div>
  <div class="job-chat-container">
    {#if selectedJob}
      <JobChat {selectedJob} />
    {/if}
  </div>
</div>

<style>
  .job-manager-widget {
    flex-direction: row;
    overflow: hidden;
    height: 45vh;
  }

  .job-list {
    flex: 0 0 30%;
    max-height: 45vh;
    overflow-y: auto;
    border-right: 2px solid #e0e0e0;
    /* Restliche Styles */
  }

  .job-chat-container {
    flex: 0 0 70%;
    max-height: 45vh;
    overflow-y: auto;
    /* Restliche Styles */
  }
</style>
