<script>
    import JobList from './JobList.svelte';
    import JobChat from './JobChat.svelte';
  
    let selectedJob = null;
  
    function handleJobSelection(event) {
    selectedJob = event.detail.job; // Extrahieren des Job-Objekts aus dem Event-Detail
  }
  </script>
  
  <div class="job-manager">
    <JobList on:selectJob={handleJobSelection} />
    {#if selectedJob}
      <JobChat {selectedJob} />
    {/if}
  </div>
  
  <style>
    /* Hier können Sie CSS-Stile für den Job-Manager definieren */
  </style>
  