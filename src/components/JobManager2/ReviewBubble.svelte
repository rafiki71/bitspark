<!-- ReviewBubble.svelte -->
<script>
    import BaseBubble from "./BaseBubble.svelte";

    export let event;

    let reviewContent = "Kein Kommentar";
    let rating = 0;
    let backgroundColor = "#FFF176"; // Ein helles Gelb
    let textColor = "#333333"; // Dunkelgrau für guten Kontrast

    // Reaktive Anweisungen, die auf Änderungen von `event` reagieren
    $: if (event && event.tags) {
        reviewContent = event.content;
        const ratingTag = event.tags.find((tag) => tag[0] === "rating");
        rating = ratingTag ? parseInt(ratingTag[1], 10) : 0;
    }
</script>

<BaseBubble event={event} {backgroundColor} {textColor}>
    <div class="review-content">
        <div class="rating-display">
            {#each Array(5) as _, i}
                <span class={`star ${i < rating ? 'filled' : ''}`}>★</span>
            {/each}
        </div>
        <p>{reviewContent}</p>
    </div>
</BaseBubble>

<style>
     :global() {
        --textColor: {textColor};
    }

    .review-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 10px;
    }
    
    .review-content p {
        margin-top: 0;
        line-height: 1.4;
        color: var(--textColor); /* Dynamische Textfarbe */
    }
    
    .rating-display {
        color: #ffd700; /* Goldfarbe für Sterne */
        margin-bottom: 5px;
    }

    .star {
        font-size: 1.2em;
    }

    .star.filled {
        color: #f39c12; /* Dunklere Goldfarbe für gefüllte Sterne */
    }

    .review-content p {
        margin-top: 0;
        line-height: 1.4;
        color: textColor;
    }
</style>
