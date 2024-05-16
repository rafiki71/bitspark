<script>
    import ProfileImg from "../ProfileImg.svelte";

    export let message;
    export let profiles;
</script>

<div class="message">
    {#if profiles.has(message.pubkey)}
        <ProfileImg
            profile={profiles.get(message.pubkey)}
            style={{ width: "50px", height: "50px", "margin-right": "15px" }}
        />
        <div class="message-content">
            <p class="name">{profiles.get(message.pubkey).name}</p>
            <p>{message.content}</p>
        </div>
    {:else}
        <div class="message-content">
            <p><strong>From:</strong> {message.pubkey}</p>
            <p>{message.content}</p>
        </div>
    {/if}
    <p class="timestamp">
        {new Date(message.created_at * 1000).toLocaleString()}
    </p>
</div>

<style>
    .message {
        padding: 0.75rem;
        border-bottom: 1px solid #eee;
        display: flex;
        align-items: flex-start;
    }

    .profile-img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
    }

    .message-content {
        flex-grow: 1;
    }

    .name {
        font-weight: bold;
        margin: 0;
        margin-bottom: 0.5rem;
    }

    .timestamp {
        font-size: 0.75rem;
        color: #888;
        margin-left: 10px;
        align-self: flex-end;
    }
</style>
