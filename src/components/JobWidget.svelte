<!-- JobWidget.svelte -->

<script>
  import { onMount } from "svelte";
  import { helperStore } from "../helperStore.js"; // Import the store

  export let ideaID; // Die ID der Idee, um Jobs zu laden

  let jobs = [];

  async function fetchJobs() {
    try {
      const fetchedJobs = await $helperStore.getJobs(ideaID);
      jobs = fetchedJobs.map((job) => {
        const tagObject = {};
        job.tags.forEach((tag) => {
          tagObject[tag[0]] = tag[1];
        });
        return {
          id: job.id,
          title: tagObject.jTitle || "N/A",
          description: job.content,
          url: tagObject.jbUrl || "",
          kind: job.kind,
          pubkey: job.pubkey,
          sig: job.sig,
        };
      });

      console.log(jobs);
    } catch (error) {
      console.error("Error fetching jobs data:", error);
    }
  }

  $: if ($helperStore) {
    fetchJobs();
  }
</script>

<div class="container bg-card p-4">
  <h4 class="base-h4">Jobs</h4>
  <ul class="job-list">
    {#each jobs as job (job.id)}
      <li class="job-item">
        <div class="job-image" style="background-image: url({job.url})"></div>
        <div class="job-title">{job.title}</div>
      </li>
    {/each}
  </ul>
</div>

<style>
  .job-list {
    display: flex;
    flex-direction: column; /* Jobs untereinander stapeln */
    gap: 1rem;
  }

  .job-item {
    display: flex;
    align-items: center; /* Zentriert den Titel vertikal neben dem Bild */
    gap: 1rem;
  }

  .job-image {
    width: 60px;
    height: 60px;
    border-radius: 50%; /* Rundes Bild */
    background-size: cover;
    background-position: center;
  }

  .job-title {
    font-weight: bold;
    font-size: 1.1em; /* Ein bisschen größer als der Standardtext */
    color: #333; /* Dunkelgrau für einen modernen Look */
  }

  .job-item:hover .job-title {
    color: #0077cc; /* Ein leichtes Blau als Hover-Farbe für den Titel */
    cursor: pointer; /* Ein Zeiger-Cursor zeigt an, dass der Job-Titel anklickbar ist */
  }
</style>



