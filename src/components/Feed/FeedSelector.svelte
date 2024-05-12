<script>
    import { selectedFeed, setFeed } from "./feedSelectionStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";

    const selectFeed = (type) => {
        setFeed(type);
    };
</script>

<div class="feed-selector">
    <button
        class:active={$selectedFeed === "hot"}
        on:click={() => selectFeed("hot")}
    >
        <i class="fas fa-fire"></i> Hot
    </button>
    {#if $nostrManager && $nostrManager.publicKey}
    <button
    class:active={$selectedFeed === "followed"}
    on:click={() => selectFeed("followed")}
    >
    <i class="fas fa-user-friends"></i> Followed
</button>
{/if}
    <button
        class:active={$selectedFeed === "verified"}
        on:click={() => selectFeed("verified")}
    >
        <i class="fas fa-check-circle"></i> Verified
    </button>
    <button
        class:active={$selectedFeed === "unverified"}
        on:click={() => selectFeed("unverified")}
    >
        <i class="fas fa-globe"></i> Global
    </button>
</div>

<style>
    .feed-selector {
        display: flex;
        background-color: #f9f9f9;
        padding: 8px 16px;
        border-radius: 25px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
    }
    .feed-selector button {
        flex: 1;
        border: none;
        background: none;
        padding: 10px 20px;
        margin-right: 10px;
        border-radius: 20px;
        font-size: 16px;
        transition:
            background-color 0.3s,
            color 0.3s;
        cursor: pointer;
        outline: none;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .feed-selector button:last-child {
        margin-right: 0;
    }
    .feed-selector button:hover {
        background-color: #e2e8f0;
    }
    .feed-selector button.active {
        background-color: #f7931a;
        color: white;
    }
    .feed-selector i {
        margin-right: 5px;
    }
</style>
