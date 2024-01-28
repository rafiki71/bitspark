<!-- JobWidget.svelte -->

<script>
  import { onMount, onDestroy } from "svelte";
  import { navigate } from "svelte-routing";
  import { nostrCache } from "../backend/NostrCacheStore.js";
  import { nostrManager } from "../backend/NostrManagerStore.js";
  import { Link } from 'svelte-routing';
  import { NOSTR_KIND_JOB } from '../constants/nostrKinds';


  export let ideaID;
  export let creatorPubKey;

  let jobs = [];
  let jobKind = NOSTR_KIND_JOB; // Ersetzen Sie dies durch den korrekten Kind-Wert für Jobs

  onMount(() => {
    if ($nostrManager) {
      initialize();
    }
  });

  $: $nostrManager && initialize();
  $: $nostrCache && fetchJobs();

  function initialize() {
    // Abonnieren von Job-Events
    $nostrManager.subscribeToEvents({
      kinds: [jobKind], // Kind-Wert für Jobs
      "#e": [ideaID], // ID der Idee
      "#t": ["job"],
    });
  }

  async function fetchJobs() {
    const jobEvents = await $nostrCache.getEventsByCriteria({
      kinds: [jobKind],
      tags: {
        e: [ideaID],
        s: ["bitspark"],
        t: ["job"],
      },
    });

    jobs = jobEvents.map((jobEvent) => ({
      id: jobEvent.id,
      title: jobEvent.tags.find((tag) => tag[0] === "jTitle")?.[1] || "N/A",
      sats: jobEvent.tags.find((tag) => tag[0] === "sats")?.[1] || "0 Sats",
      description: jobEvent.content,
      createdAt: jobEvent.created_at,
      url: jobEvent.tags.find((tag) => tag[0] === "jbUrl")?.[1] || "",
      kind: jobEvent.kind,
      pubkey: jobEvent.pubkey,
      sig: jobEvent.sig,
    })).sort((a, b) => b.createdAt - a.createdAt); // Sortieren nach dem Erstellungsdatum
  }

  function postJob() {
    navigate(`/postjob/${ideaID}`);
  }

  onDestroy(() => {
    if ($nostrManager) {
      $nostrManager.unsubscribeAll();
    }
  });
</script>

<div class="header">
  <h4 class="base-h4">Jobs</h4>
  {#if creatorPubKey === $nostrManager?.publicKey}
    <button on:click={postJob} class="add-job-icon">
      <i class="fa fa-plus-circle" aria-hidden="true" />
    </button>
  {/if}
</div>

<div class="job-grid">
  {#each jobs as job (job.id)}
    <Link to={`/job/${job.id}`} class="job-card">
      <div class="job-card-inner">
        <div class="job-image" style="background-image: url({job.url})" />
        <div class="job-info">
          <div class="job-title">{job.title}</div>
          <div class="job-sats">{job.sats} Sats</div>
        </div>
      </div>
    </Link>
  {/each}
</div>

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
    transition:
      color 0.5s,
      background-color 0.5s; /* Langsamere Übergänge */
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

  .job-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Responsive Gitter */
    gap: 20px;
    padding: 20px;
  }

  .job-card {
    text-decoration: none;
    color: inherit;
    transition: transform 0.3s ease;
  }

  .job-card:hover {
    transform: translateY(-5px); /* Leichte Anhebung beim Hover */
  }

  .job-card-inner {
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .job-image {
    width: 100%;
    height: 120px;
    background-size: cover;
    background-position: center;
  }

  .job-info {
    padding: 15px;
  }

  .job-title {
    font-weight: bold;
    font-size: 1.2em;
    margin-bottom: 5px;
    color: #333333; /* Tiefes Grau für den Jobtitel */
  }

  .job-sats {
    font-size: 0.9em;
    color: #FF9900; /* Bitcoin Orange für die Sats */
  }
</style>
