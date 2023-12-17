<!-- JobManager.svelte -->

<script>
  import { onMount } from "svelte";
  import { helperStore } from "../../helperStore.js";
  import { navigate } from "svelte-routing";
  import JobList from "./JobList.svelte";
  import JobDetails from "./JobDetails.svelte";
  import OfferItem from "./OfferItem.svelte";
  import SubmitPullRequestDialog from "./SubmitPullRequestDialog.svelte";
  import ManagePullRequestDialog from "./ManagePullRequestDialog.svelte";

  let jobs = [];
  let selectedJob = null;
  let offers = [];
  let accepts = [];
  let pullRequests = [];
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
    console.log("Selected Job:", selectedJob);

    offers = (await $helperStore.getOffersForJob(job.id)).map((offer) => ({
      ...offer,
      createdAt: new Date(offer.created_at * 1000).toLocaleString(),
      sats: offer.tags.find((tag) => tag[0] === "sats")?.[1],
    }));

    offers = [...offers];

    accepts = await $helperStore.getJobAccepts(job.id);
    accepts = [...accepts];

    pullRequests = await $helperStore.getPullRequests(job.id);

    pullRequests = [...pullRequests];
    console.log("pullRequests:", pullRequests);

    combinedList = combineAndSortLists(offers, accepts, pullRequests);
  }

  async function acceptOffer(offerId, event, msg) {
    event.stopPropagation();
    await $helperStore.updateOfferStatus(
      selectedJob.id,
      offerId,
      "accepted",
      msg
    );
    offers = await $helperStore.getOffersForJob(selectedJob.id);
  }

  async function declineOffer(offerId, event, msg) {
    event.stopPropagation();
    await $helperStore.updateOfferStatus(
      selectedJob.id,
      offerId,
      "declined",
      msg
    );
    offers = await $helperStore.getOffersForJob(selectedJob.id);
  }

  let combinedList = [];

  $: if (selectedJob) {
    combinedList = combineAndSortLists(offers, accepts, pullRequests);
    console.log("combined", combinedList);
  }

  function combineAndSortLists(offers, accepts, pullRequests) {
    const markedOffers = offers.map((offer) => ({ ...offer, type: "offer" }));
    const markedAccepts = accepts.map((accept) => ({
      ...accept,
      type: "accept",
    }));
    const markedPr = pullRequests.map((pr) => ({ ...pr, type: "pullreq" })); // Korrigiert

    return [...markedOffers, ...markedAccepts, ...markedPr].sort(
      (a, b) => a.created_at - b.created_at
    );
  }

  $: (combinedList = combineAndSortLists(offers, accepts, pullRequests)), offers, accepts, pullRequests;
</script>

<div class="job-manager">
  <JobList {jobs} {selectJob} />
  <div class="selected-job-container">
    {#if selectedJob}
      <JobDetails job={selectedJob} />
      <div class="combined-list">
        {#each combinedList as item}
          {#if item.type === "offer"}
            <OfferItem
              offer={item}
              {selectJob}
              {acceptOffer}
              {declineOffer}
              isOwnJob={selectedJob.pubkey === $helperStore.publicKey}
            />
          {:else if item.type === "accept"}
            <SubmitPullRequestDialog accept={item} jobId={selectedJob.id} />
          {:else if item.type === "pullreq"}
            <ManagePullRequestDialog pullRequest={item} />
          {/if}
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

  .job-manager {
    display: flex;
  }
</style>
