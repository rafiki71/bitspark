<!-- JobManager.svelte -->

<script>
  import { onMount } from "svelte";
  import { helperStore } from "../helperStore.js";
  import { navigate } from "svelte-routing";

  let jobs = [];
  let selectedJob = null;
  let offers = [];
  let userPublicKey;

  onMount(async () => {
    if ($helperStore) {
      userPublicKey = $helperStore?.publicKey;
      if (userPublicKey) {
        jobs = await $helperStore.fetchUserJobs(userPublicKey);
      }
    }
  });

  $: if ($helperStore?.publicKey) {
    userPublicKey = $helperStore.publicKey;
    loadJobsAndOffers();
  }

  async function loadJobsAndOffers() {
    if (userPublicKey) {
      jobs = await $helperStore.fetchUserJobs(userPublicKey);
      offers = await $helperStore.getOffersForUser(userPublicKey);
    }
    console.log("npub:", userPublicKey);
    console.log("jobs:", jobs);
    console.log("offers:", offers);
  }

  async function selectJob(job) {
  // Extract additional information from tags
  const tagsMap = new Map(job.tags);
  job.title = tagsMap.get('jTitle');
  job.content = job.content;
  job.createdAt = new Date(job.created_at * 1000).toLocaleString();

  selectedJob = job;
  offers = await $helperStore.getOffersForJob(job.id);
}

  async function acceptOffer(offerId) {
    await $helperStore.updateOfferStatus(offerId, 'accepted');
    offers = await $helperStore.getOffersForJob(selectedJob.id); // Refresh offers list
  }
</script>

<div class="job-manager">
  <div class="job-list">
    {#each jobs as job}
      <div class="job-item" on:click={() => selectJob(job)}>
        {job.tags.find(tag => tag[0] === 'jTitle')[1]} <!-- Anzeige des Jobtitels -->
      </div>
    {/each}
  </div>
  
  <div class="job-details">
    {#if selectedJob}
      <h2>{selectedJob.title}</h2>
      <p>Created at: {selectedJob.createdAt}</p>
      <p>Content: {selectedJob.content}</p>
      <div class="offers">
        {#each offers as offer}
          <div class="offer">
            <p>{offer.developerIntro}</p>
            {#if offer.status !== 'accepted'}
              <button on:click={() => acceptOffer(offer.id)}>Accept</button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>


<style>
  .job-manager {
    display: flex;
  }
  
  .job-list {
    width: 30%;
    border-right: 1px solid #ccc;
  }
  
  .job-item {
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
  }
  
  .job-details {
    width: 70%;
    padding: 10px;
  }
  
  .offers {
    margin-top: 20px;
  }
  
  .offer {
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }
</style>
