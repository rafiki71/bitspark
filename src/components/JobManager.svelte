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

  async function acceptOffer(offerId, event) {
    event.stopPropagation();
    await $helperStore.updateOfferStatus(offerId, "accepted");
    offers = await $helperStore.getOffersForJob(selectedJob.id);
  }

  async function declineOffer(offerId, event) {
    event.stopPropagation();
    await $helperStore.updateOfferStatus(offerId, "declined");
    offers = await $helperStore.getOffersForJob(selectedJob.id);
  }
</script>

<div class="job-manager">
  <div class="job-list">
    {#each jobs as job}
      <div class="job-item" on:click={() => selectJob(job)}>
        {job.tags.find((tag) => tag[0] === "jTitle")[1]}
      </div>
    {/each}
  </div>

  <div class="job-details">
    {#if selectedJob}
      <h2>{selectedJob.title}</h2>
      <div class="offers">
        {#each offers as offer}
          <div
            class={`offer ${offer.status}`}
            on:click={() => selectJob(offer)}
          >
            <div class="offer-content">
              <p>{offer.content}</p>
              <p class="sats">
                {offer.tags.find((tag) => tag[0] === "sats")[1]} sats
              </p>
            </div>
            <div class="offer-footer">
              <span class="offer-date"
                >{new Date(offer.created_at * 1000).toLocaleString()}</span
              >
              <div class="offer-actions">
                {#if offer.status === "pending" && selectedJob.pubkey === $helperStore.publicKey}
                  <div class="offer-actions">
                    <button
                      class="offer-button accept"
                      on:click={(event) => {
                        acceptOffer(offer.id, event);
                        event.stopPropagation();
                      }}
                    >
                      <i class="fas fa-check" />
                    </button>
                    <button
                      class="offer-button decline"
                      on:click={(event) => {
                        declineOffer(offer.id, event);
                        event.stopPropagation();
                      }}
                    >
                      <i class="fas fa-times" />
                    </button>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
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
</style>
