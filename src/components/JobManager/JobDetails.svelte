<!-- JobDetails.svelte -->
<script>
    import { navigate } from "svelte-routing";
    export let job;

    function goToJobDetails() {
        navigate(`/job/${job.id}`);
    }

    $: console.log("job:", job);
</script>

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="job-detail" on:click={goToJobDetails}>
        <h2>{job.title}</h2>
        <p class="sats">
            {job.tags.find((tag) => tag[0] === "sats")[1]} sats
        </p>
        <p class="date">
            {job.createdAt}
        </p>
    </div>

<style>
    .job-detail {
        background-color: #eee; /* Angepasst an andere Bubbles */
        border-radius: 15px; /* Konsistent mit anderen Bubbles */
        padding: 10px; /* Konsistent mit anderen Bubbles */
        margin-top: 20px;
        max-width: 80%; /* Konsistent mit anderen Bubbles */
        align-self: flex-start; /* Konsistent mit anderen Bubbles */
        position: relative; /* Konsistent mit anderen Bubbles */
    }

    .sats {
        font-weight: bold;
    }

    .date {
        font-style: italic;
        color: #666;
    }
</style>
