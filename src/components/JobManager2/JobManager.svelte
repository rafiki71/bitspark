<!-- JobManagerWidget.svelte -->
<script>
  import JobList from "./JobList.svelte";
  import JobChat from "./JobChat.svelte";

  let selectedJob = null;

  function handleJobSelection(event) {
    selectedJob = event.detail.job;
  }
</script>

<div class="job-manager-widget">
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
    display: flex;
    flex-direction: row;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    overflow: hidden;
    height: 45vh;
    width: 90%;
    margin: 1rem auto;
    background: #fff; /* Setzt eine Hintergrundfarbe */
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
