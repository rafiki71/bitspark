<script>
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import { dmManager } from '../../backend/DMManager.js';
    import { nostrManager } from '../../backend/NostrManagerStore.js';
    import { nostrCache } from '../../backend/NostrCacheStore.js';
    import { socialMediaManager } from '../../backend/SocialMediaManager.js';
    import { writable } from 'svelte/store';
    import ProfileImg from '../ProfileImg.svelte';
  
    let chatRooms = writable([]);
    let profiles = new Map();
    const dispatch = createEventDispatcher();
  
    // Updates chat rooms whenever the cache or manager changes
    $: if ($nostrManager && $nostrCache) {
      updateChatRooms();
    }
  
    onMount(async () => {
      await dmManager.init();
      dmManager.subscribeToMessages();
      await updateChatRooms();
    });
  
    async function updateChatRooms() {
      const rooms = await dmManager.getChatRooms();
      chatRooms.set(rooms);
      fetchProfiles(rooms.map(room => room.participants));
    }
  
    async function fetchProfiles(pubkeys) {
      const profilePromises = pubkeys.map(async (pubkey) => {
        let profile = await socialMediaManager.getProfile(pubkey);
        if (profile) {
          profiles.set(pubkey, profile);
        }
      });
      await Promise.all(profilePromises);
    }
  
    function handleRoomClick(room) {
      dispatch('selectRoom', room);
    }
</script>
  
<div class="chat-list">
    <h2>Chat Rooms</h2>
    {#each $chatRooms as room}
      <div class="chat-room" on:click={() => handleRoomClick(room)}>
        <div class="room-header">
          {#if profiles.has(room.participants)}
            <ProfileImg profile={profiles.get(room.participants)} style={{ width: '50px', height: '50px', 'margin-right': '15px' }} />
            <h3 class="room-name">{profiles.get(room.participants).name}</h3>
          {:else}
            <h3 class="room-name">Chat with {room.participants}</h3>
          {/if}
        </div>
        {#if room.subject}
          <p class="subject">{room.subject}</p>
        {/if}
      </div>
    {/each}
</div>
  
<style>
    .chat-list {
      width: 30%;
      border-right: 1px solid #ccc;
      padding: 1rem;
    }
  
    .chat-room {
      cursor: pointer;
      padding: 0.5rem;
      border-bottom: 1px solid #ddd;
    }
  
    .chat-room:hover {
      background-color: #f5f5f5;
    }

    .room-header {
      display: flex;
      align-items: center;
      margin-bottom: 5px; /* Abstand zwischen header und subject */
    }

    .room-name {
      margin: 0;
      flex-grow: 1; /* Falls der Name sehr lang ist, bleibt der Abstand zum Profilbild gleich */
    }

    .subject {
      color: #888;
      font-size: 0.9rem;
      margin: 0;
      margin-top: 5px;
    }
</style>
