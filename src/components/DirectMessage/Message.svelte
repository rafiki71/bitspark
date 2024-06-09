<script>
    import ProfileImg from '../ProfileImg.svelte';
    export let message;
    export let profiles;

    $: profile = $profiles.has(message.pubkey) ? $profiles.get(message.pubkey) : null;
</script>
  
<div class="message">
    {#if profile}
        <ProfileImg profile={profile} style={{ width: '50px', height: '50px', 'margin-right': '15px' }} />
        <div class="message-content">
            <p class="name">{profile.name}</p>
            <p class="content">{message.content}</p>
        </div>
    {:else}
        <div class="message-content">
            <p>{message.content}</p>
        </div>
    {/if}
    <p class="timestamp">{new Date(message.created_at * 1000).toLocaleString()}</p>
</div>
  
<style>
    .message {
      padding: 0.75rem;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: flex-start;
    }

    .content {
      white-space: pre-wrap; /* Hier wird dafür gesorgt, dass Zeilenumbrüche angezeigt werden */
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
