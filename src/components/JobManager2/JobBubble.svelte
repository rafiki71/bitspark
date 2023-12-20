<script>
    import BaseBubble from './BaseBubble.svelte';
    export let job;

    let jobTitle = 'Unbekannter Job';
    let jobDescription = 'Keine Beschreibung verfügbar.';

    // Reaktive Anweisungen, die auf Änderungen von `job` reagieren
    $: if (job && job.tags) {
        const titleTag = job.tags.find(tag => tag[0] === 'jTitle');
        jobTitle = titleTag ? titleTag[1] : 'Unbekannter Job';
    }

    $: if (job) {
        jobDescription = job.content || 'Keine Beschreibung verfügbar.';
    }

</script>

<BaseBubble event={job}>
    <div class="job-content">
        <h3>{jobTitle}</h3>
        <p>{jobDescription}</p>
    </div>
</BaseBubble>

<style>
    .job-content h3 {
        margin-bottom: 5px; /* Fügt Abstand unter der Überschrift hinzu */
        color: #333;
    }

    .job-content p {
        margin-top: 5px; /* Fügt Abstand über dem Absatz hinzu */
        color: #666;
    }
</style>

