<!-- ReviewWidget.svelte -->
<script>
    import { onMount, onDestroy } from "svelte";
    import ReviewBubble from "./JobManager2/ReviewBubble.svelte";
    import { nostrCache } from "../backend/NostrCacheStore.js";
    import { nostrManager } from "../backend/NostrManagerStore.js";
    import { NOSTR_KIND_JOB } from "../constants/nostrKinds";

    export let userPubKey;

    let reviewEvents = [];
    let profile = ""; // Variable für den Namen des Benutzers

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
    }

    async function fetchProfileName() {
        const profileEvents = $nostrCache.getEventsByCriteria({
            kinds: [0],
            authors: [userPubKey],
            tags: {
                s: ["bitspark"],
            },
        });

        if (profileEvents && profileEvents.length > 0) {
            profileEvents.sort((a, b) => b.created_at - a.created_at);
            profile = profileEvents[0].profileData; // Nutzung der neuen Profilstruktur
        }
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
</script>

<div class="single-card container review-widget-container">
    <h1 class="relative flex text-4xl font-bold text-black ml-6 mb-6">
        {profile.name}'s Reviews
    </h1>
    <div class="reviews-wrapper">
        {#each reviewEvents as event}
            <div class="review-bubble-wrapper">
                <ReviewBubble {event} />
            </div>
        {/each}
    </div>
</div>

<style>
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