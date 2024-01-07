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

    // Berechnen Sie die Sterndarstellung
    $: stars = Array(5).fill().map((_, i) => ({
        filled: i < rating,
        size: rating > 0 ? `calc(1em + ${rating * 0.4 }em)` : '1em',
    }));
</script>

<BaseBubble event={event} showRatingButton={false} {backgroundColor} {textColor}>
    <div class="review-content">
        <div class="rating-display">
            {#each stars as star, i}
                <span class="star" style="font-size: {star.size}; color: {star.filled ? '#ffcc00' : '#cccccc'}">★</span>
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
        color: var(--textColor);
    }
    
    .rating-display {
        margin-bottom: 5px;
    }

    .star {
        transition: transform 0.3s ease, font-size 0.3s ease;
    }
</style>
