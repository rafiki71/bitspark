<!-- JobBubble.svelte -->
<script>
    import BaseBubble from "./BaseBubble.svelte";

    export let event;

    let jobTitle = "Unbekannter Job";
    let jobDescription = "Keine Beschreibung verfügbar.";
    let backgroundColor = "#F5A623"; // Ein helleres, energetisches Orange
    let textColor = "#ffffff"; // Weiß für Kontrast

    // Reaktive Anweisungen, die auf Änderungen von `job` reagieren
    $: if (event && event.tags) {
        const titleTag = event.tags.find((tag) => tag[0] === "jTitle");
        jobTitle = titleTag ? titleTag[1] : "Unbekannter Job";
    }

    $: if (event) {
        jobDescription = event.content || "Keine Beschreibung verfügbar.";
    }
</script>

<BaseBubble {event} showRatingButton={false} {backgroundColor} {textColor}>
    <div class="job-content">
        <h3>{jobTitle}</h3>
        {@html jobDescription}
    </div>
</BaseBubble>

<style>
    .job-content {
        max-width: 100%; /* Begrenzt die Breite des Textinhalts auf 80% */
    }
    
    .job-content h3 {
        margin-bottom: 5px; /* Fügt Abstand unter der Überschrift hinzu */
        color: textcolor;
    }

    .job-content p {
        margin-top: 5px; /* Fügt Abstand über dem Absatz hinzu */
        color: textcolor;
    }
</style>
