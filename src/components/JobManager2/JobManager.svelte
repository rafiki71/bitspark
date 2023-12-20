<!-- JobManagerWidget.svelte -->
<script>
    import JobList from './JobList.svelte';
    import JobChat from './JobChat.svelte';
  
    let selectedJob = null;
  
    function handleJobSelection(event) {
      selectedJob = event.detail.job;
    }
  </script>
  
  <div class="job-manager">
    <JobList on:selectJob={handleJobSelection} />
    <div class="job-chat-container">
      {#if selectedJob}
        <JobChat {selectedJob} />
      {/if}
    </div>
  </div>
  
  <style>
    .job-manager {
      display: flex;
      flex-direction: row;
      margin: 20px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      overflow: hidden;
      height: 45vh; /* Anpassbare Höhe basierend auf dem Viewport */
    }
  
    .job-chat-container {
      flex-grow: 1;
      overflow-y: auto;
      border-left: 2px solid #e0e0e0;
      padding: 15px;
    }
  </style>
  