<!-- JobManager.svelte -->

<script>
  import { onMount } from "svelte";
  import { helperStore } from "../../helperStore.js";
  import { navigate } from "svelte-routing";
  import JobList from "./JobList.svelte";
  import JobDetails from "./JobDetails.svelte";
  import OfferItem from "./OfferItem.svelte";

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
      jobs = await $helperStore.fetchRelevantUserJobs(userPublicKey);
    }
  }

  async function selectJob(job) {
    // Extract additional information from tags
    const tagsMap = new Map(job.tags);
    job.title = tagsMap.get("jTitle");
    job.content = job.content;
    job.createdAt = new Date(job.created_at * 1000).toLocaleString();

    selectedJob = job;
    offers = (await $helperStore.getOffersForJob(job.id)).map((offer) => ({
      ...offer,
      createdAt: new Date(offer.created_at * 1000).toLocaleString(),
      sats: offer.tags.find((tag) => tag[0] === "sats")?.[1],
    }));
  }

  async function acceptOffer(offerId, event, msg) {
    event.stopPropagation();
    await $helperStore.updateOfferStatus(offerId, "accepted", msg);
    offers = await $helperStore.getOffersForJob(selectedJob.id);
  }

  async function declineOffer(offerId, event, msg) {
    event.stopPropagation();
    await $helperStore.updateOfferStatus(offerId, "declined", msg);
    offers = await $helperStore.getOffersForJob(selectedJob.id);
  }
</script>

<div class="job-manager">
  <JobList {jobs} {selectJob} />
  <div class="selected-job-container">
    {#if selectedJob}
      <JobDetails job={selectedJob} />
      <div class="offers">
        {#each offers as offer}
          <OfferItem
            {offer}
            {selectJob}
            {acceptOffer}
            {declineOffer}
            isOwnJob={selectedJob.pubkey === $helperStore.publicKey}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .selected-job-container {
    padding: 10px;
    max-width: 100%; /* Stelle sicher, dass es nicht breiter als die anderen Bubbles wird */
  }

  .offers {
    margin-top: 20px;
    display: flex;
    flex-direction: column-reverse;
  }

  .offer {
    margin-bottom: 20px;
    padding: 10px;
    border-radius: 15px;
    max-width: 70%;
    align-self: flex-start;
    background-color: #eee;
    position: relative;
  }

  .offer.accepted {
    background-color: #aed581;
  }

  .offer.declined {
    background-color: #ff8a65;
  }

  .offer.pending {
    background-color: #ffee58;
  }

  .offer-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }

  .offer-button {
    background: none;
    border: none;
    cursor: pointer;
  }

  .sats {
    font-weight: bold;
  }

  .job-manager {
    display: flex;
  }
</style>
