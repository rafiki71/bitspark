<!-- JobList.svelte -->

<script>
    export let jobs;
    export let selectJob;
</script>

<div class="job-list">
    {#each jobs as job}
        <div class="job-item" on:click={() => selectJob(job)}>
            {job.tags.find((tag) => tag[0] === "jTitle")[1]}
        </div>
    {/each}
</div>

<style>
    .job-list {
        width: 30%;
        border-right: 1px solid #ccc;
    }

    .job-item {
        padding: 10px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
    }
</style>
