<!-- JobWidget.svelte -->

<script>
  import { onMount } from "svelte";
  import { helperStore } from "../helperStore.js"; // Import the store
  import { navigate } from "svelte-routing";

  export let ideaID; // Die ID der Idee, um Jobs zu laden
  export let creatorPubKey; // Fügen Sie diesen neuen exportierten Wert hinzu

  let jobs = [];

  function postJob() {
    navigate(`/postjob/${ideaID}`);
  }

  async function fetchJobs() {
    if (!$helperStore) {
      return;
    }

    try {
      const fetchedJobs = await $helperStore.getJobs(ideaID);
      jobs = fetchedJobs.map((job) => {
        console.log(job);
        const tagObject = {};
        job.tags.forEach((tag) => {
          tagObject[tag[0]] = tag[1];
        });
        return {
          id: job.id,
          title: tagObject.jTitle || "N/A",
          sats: tagObject.sats || "0 Sats",
          description: job.content,
          url: tagObject.jbUrl || "",
          kind: job.kind,
          pubkey: job.pubkey,
          sig: job.sig,
        };
      });

      console.log("Jobs:", jobs);
    } catch (error) {
      console.error("Error fetching jobs data:", error);
    }
  }

  $: if ($helperStore) {
    fetchJobs();
  }
</script>

<div class="header">
  <h4 class="base-h4">Jobs</h4>
  {#if $helperStore?.publicKey && $helperStore?.publicKey === creatorPubKey}
    <button on:click={postJob} class="add-job-icon">
      <i class="fa fa-plus-circle" aria-hidden="true" />
    </button>
  {/if}
</div>
<ul class="job-list">
  {#each jobs as job (job.id)}
    <li class="job-item">
      <a href={`/job/${job.id}`} class="invisible-link">
        <div class="job-image" style="background-image: url({job.url})" />
        <div class="job-title">{job.title}</div>
      </a>
    </li>
  {/each}
</ul>

<style>
  .add-job-icon {
    background-color: transparent;
    color: #a0a0a0; /* Graue Standardfarbe des Icons */
    font-size: 1.5em;
    border: none; /* Rahmen entfernen */
    width: 30px; /* Breite des Buttons festlegen */
    height: 30px; /* Höhe des Buttons festlegen */
    display: flex;
    align-items: center; /* Vertikale Zentrierung des Icons */
    justify-content: center; /* Horizontale Zentrierung des Icons */
    border-radius: 50%; /* Runder Button */
    padding: 0; /* Entfernen Sie jeglichen Abstand */
    transition: color 0.5s, background-color 0.5s; /* Langsamere Übergänge */
    outline: none;
    cursor: pointer;
  }

  .add-job-icon:hover {
    background-color: rgba(
      249,
      115,
      22,
      0.2
    ); /* Dezentes Orange mit 20% Deckkraft für den Hintergrund */
    color: rgba(
      249,
      115,
      22,
      0.7
    ); /* Dezentes Orange mit 70% Deckkraft für das Symbol */
    text-decoration: none;
  }

  .add-job-icon:focus {
    outline: none; /* Entfernen Sie den Fokus */
    box-shadow: none; /* Entfernen Sie jeglichen Schatten, der durch den Fokus entsteht */
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .container {
    position: relative;
  }

  .refresh-btn {
    background-color: transparent;
    border: none;
    font-size: 1.2em;
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    transition: color 0.2s;
  }

  .refresh-btn:hover {
    color: #0077cc;
  }

  .invisible-link {
    text-decoration: none; /* Keine Unterstreichung */
    color: inherit; /* Erbt die Farbe des Elternelements */
    display: flex;
    align-items: center; /* Zentriert den Titel vertikal neben dem Bild */
    gap: 1rem;
  }

  .invisible-link:hover {
    text-decoration: none; /* Stellt sicher, dass die Unterstreichung beim Überfahren nicht angezeigt wird */
  }

  .job-item:hover .job-title {
    color: #0077cc; /* Ein leichtes Blau als Hover-Farbe für den Titel */
    cursor: pointer; /* Ein Zeiger-Cursor zeigt an, dass der Job-Titel anklickbar ist */
  }

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
