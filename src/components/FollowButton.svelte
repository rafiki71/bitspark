<script>
    import { onMount, onDestroy } from "svelte";
    import { socialMediaManager } from "../backend/SocialMediaManager.js";
    import { nostrManager } from "../backend/NostrManagerStore.js"; // Import NostrManager
    import { nostrCache } from "../backend/NostrCacheStore.js";
    export let profilePubKey; // Der Public Key des Profils, das potentiell gefolgt werden soll

    let following = false;
    let loaded = false;

    // Überprüfen, ob der Benutzer bereits folgt
    const checkFollowingStatus = async () => {
        if ($nostrManager?.publicKey) {
            following = await socialMediaManager.iFollow(profilePubKey);
            loaded = true;
        }
    };

    const subscribeFollowList = async () => {
        if ($nostrManager?.publicKey) {
            socialMediaManager.subscribeFollowList($nostrManager.publicKey);
        }
    };

    // Folgen oder Entfolgen je nach aktuellem Status
    const toggleFollow = async () => {
        if (!$nostrManager?.publicKey) {
            console.error("User must be logged in to follow or unfollow.");
            return;
        }

        if (following) {
            await socialMediaManager.unfollow(profilePubKey);
        } else {
            await socialMediaManager.follow(profilePubKey);
        }
        following = !following; // Den Follow-Status umschalten
    };

    onMount(() => {
        checkFollowingStatus();
    });

    onDestroy(() => {
        $nostrManager.unsubscribeAll();
    });

    // Reagiere auf Änderungen in nostrManager und nostrCache
    $: $nostrManager, subscribeFollowList();
    $: $nostrCache, checkFollowingStatus();
</script>

<button
    on:click={toggleFollow}
    class={`follow-button ${following ? "unfollow" : "follow"} ${!$nostrManager?.publicKey ? "disabled" : ""}`}
    disabled={!$nostrManager?.publicKey}
>
    <i class={`icon ${following ? "fas fa-user-minus" : "fas fa-user-plus"}`}
    ></i>
    {following ? " Unfollow" : " Follow"}
</button>

<style>
    .follow-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 20px;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        background-color: #f7931a; /* Grundfarbe für den Follow-Button */
        color: white;
        font-size: 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition:
            background-color 0.3s,
            box-shadow 0.3s;
    }

    .follow-button.unfollow {
        background-color: rgb(44, 82, 130); /* Dunkelblau für Unfollow */
    }

    .follow-button.disabled {
        background-color: grey;
        cursor: default;
    }

    .icon {
        margin-right: 8px;
    }
</style>

