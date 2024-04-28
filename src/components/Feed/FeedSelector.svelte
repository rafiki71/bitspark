<!-- FeedSelector.svelte -->
<script>
    import { setFeed } from './feedSelectionStore.js';

    const selectFeed = (type) => {
        setFeed(type);
    };
</script>

<div class="feed-selector">
    <button on:click={() => selectFeed('verified')}>Verified</button>
    <button on:click={() => selectFeed('unverified')}>Unverified</button>
    <button on:click={() => selectFeed('hot')}>Hot</button>
</div>

<style>
    .feed-selector button {
        margin-right: 10px;
    }
</style>
