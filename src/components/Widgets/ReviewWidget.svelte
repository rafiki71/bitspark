<!-- ReviewWidget.svelte -->
<script>
    import { onMount, onDestroy } from "svelte";
    import ReviewBubble from "../JobManager2/ReviewBubble.svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import { NOSTR_KIND_JOB } from "../../constants/nostrKinds";
    import { socialMediaManager } from "../../backend/SocialMediaManager.js";

    export let userPubKey;

    let reviewEvents = [];
    let profile = null;
    let averageRating = 0;

    function initialize() {
        if ($nostrManager) {
            $nostrManager.subscribeToEvents({
                kinds: [NOSTR_KIND_JOB],
                "#p": [userPubKey],
                "#t": ["review"],
            });
        }
    }

    function fetchReviews() {
        if ($nostrCache) {
            reviewEvents = $nostrCache.getEventsByCriteria({
                kinds: [NOSTR_KIND_JOB],
                tags: {
                    p: [userPubKey],
                    t: ["review"],
                },
            });
        }

        fetchProfileName();
        calculateAverageRating();
    }

    function calculateAverageRating() {
        const totalRating = reviewEvents.reduce((sum, event) => {
            const ratingTag = event.tags.find((tag) => tag[0] === "rating");
            return sum + (ratingTag ? parseInt(ratingTag[1], 10) : 0);
        }, 0);
        averageRating =
            reviewEvents.length > 0
                ? (totalRating / reviewEvents.length).toFixed(2)
                : 0;
    }

    async function fetchProfileName() {
        profile = await socialMediaManager.getProfile(userPubKey);
    }

    onMount(() => {
        initialize();
    });

    onDestroy(() => {
        if ($nostrManager) {
            $nostrManager.unsubscribeAll();
        }
    });

    $: $nostrCache && fetchReviews();
    $: $nostrManager && initialize();

    $: averageStars = Array(5)
        .fill()
        .map((_, i) => ({
            active: i < Math.round(averageRating),
        }));
</script>

<div class="single-card container review-widget-container">
    <h1 class="relative flex text-4xl font-bold text-black ml-6 mb-6">
        {#if profile}
            {profile.name}'s Reviews
        {/if}
    </h1>
    <div class="review-stats-header">
        {#each averageStars as star}
            <span class={`average-star ${star.active ? "active" : ""}`}>★</span>
        {/each}
        <span class="average-rating-text">({averageRating}/5)</span>
    </div>
    <div class="reviews-wrapper">
        {#each reviewEvents as event}
            <div class="review-bubble-wrapper">
                <ReviewBubble {event} />
            </div>
        {/each}
    </div>
</div>

<style>
    .review-stats-header {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
    }

    .average-star {
        font-size: 1.4em;
        color: #cccccc;
        margin-right: 5px;
    }

    .average-star.active {
        color: #ffcc00;
    }

    .average-rating-text {
        font-size: 1em;
        color: #333;
    }

    .reviews-header {
        margin-bottom: 15px;
        font-size: 1.2em;
        color: #333;
        text-align: center;
    }

    .review-widget-container {
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 20px;
    }

    .reviews-wrapper {
        height: 300px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start; /* Für den Fall, dass mehr Inhalt vorhanden ist und gescrollt werden muss */
    }

    .review-bubble-wrapper {
        width: 100%; /* Gibt der inneren Bubble die Möglichkeit, sich an die Breite des Containers anzupassen */
        display: flex;
        justify-content: center; /* Zentriert die Bubble horizontal */
        margin: 10px 0; /* Fügt einen vertikalen Abstand hinzu */
    }
</style>
