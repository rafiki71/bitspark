<script>
    import { onMount } from "svelte";
    import { socialMediaManager } from "../backend/SocialMediaManager.js";
    import { nostrManager } from "../backend/NostrManagerStore.js"; // Import NostrManager
    import { nostrCache } from "../backend/NostrCacheStore.js";

    export let event_id;

    let likesCount = 0;
    let liked = false;
    let loaded = false;

    // Verwende einen reaktiven Ausdruck, um auf Änderungen im NostrManager zu reagieren
    $: userPublicKey = $nostrManager ? $nostrManager.publicKey : null;
    $: $nostrCache, checkLikes();

    const checkLikes = async () => {
        likesCount = await socialMediaManager.getLikes(event_id);
        liked = await socialMediaManager.checkIfLiked(event_id);
        loaded = true;
    };

    const toggleLike = async () => {
        if (!userPublicKey) {
            console.error("User must be logged in to toggle likes.");
            return;
        }

        if (liked) {
            await socialMediaManager.unlikeEvent(event_id);
            likesCount--;
        } else {
            await socialMediaManager.likeEvent(event_id);
            likesCount++;
        }
        liked = !liked;
    };

    onMount(() => {
        checkLikes();
        socialMediaManager.subscribeLikes(event_id);
        return () => {
            socialMediaManager.unsubscribeLikes(event_id);
        };
    });
</script>

<span class="like-container">
    <i
        class={`like-icon fa${liked ? "s" : "r"} fa-heart ${liked ? "filled" : ""}`}
        on:click={userPublicKey ? toggleLike : undefined}
    ></i>
    <span>{likesCount}</span>
</span>

<style>
    .like-icon {
        cursor: pointer;
        color: var(--heart-color, #f7931a); /* Defaultfarbe ist grau */
    }
    .like-icon.filled {
        color: #f7931a; /* Bitcoin Orange, wenn geliked */
    }

    .like-icon:hover {
        color: #b4690e; /* Dunkleres Orange beim Hover */
    }
</style>
