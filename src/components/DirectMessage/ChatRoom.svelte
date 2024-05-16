<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Message from './Message.svelte';
    import MessageInput from './MessageInput.svelte';
    import { nostrCache } from '../../backend/NostrCacheStore.js';
    import { dmManager } from '../../backend/DMManager.js';
    import { socialMediaManager } from '../../backend/SocialMediaManager.js';
    import ProfileImg from '../ProfileImg.svelte';
  
    export let selectedRoom;
  
    let messages = writable([]);
    let profiles = new Map();
  
    // Updates messages and fetches profiles whenever the selected room changes
    $: if ($selectedRoom) {
      fetchMessages();
    }
  
    // Fetches messages for the selected room from the cache
    async function fetchMessages() {
      if ($selectedRoom) {
        const fetchedMessages = await dmManager.getMessagesForRoom($selectedRoom.participants);
        messages.set(fetchedMessages);
        fetchProfiles(fetchedMessages.map(msg => msg.pubkey));
      }
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
  
    // Updates messages whenever the cache changes
    $: if ($nostrCache) {
      fetchMessages();
    }
  </script>
  
  <div class="chat-room">
    <div class="chat-header">
      <!-- {#if profiles.has($selectedRoom.participants)}
        <ProfileImg profile={profiles.get($selectedRoom.participants)} class="profile-img" />
        <h2>{profiles.get($selectedRoom.participants).name}</h2>
      {:else}
        <h2>Chat with {$selectedRoom.participants}</h2>
      {/if} -->
      {#if $selectedRoom.subject}
        <p class="subject">{$selectedRoom.subject}</p>
      {/if}
    </div>
    <div class="messages">
      {#each $messages as message}
        <Message {message} {profiles} />
      {/each}
    </div>
    <MessageInput {selectedRoom} />
  </div>
  
  <style>
    .chat-room {
      width: 70%;
      padding: 1rem;
      display: flex;
      flex-direction: column;
    }
  
    .chat-header {
      display: flex;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
      margin-bottom: 1rem;
    }
  
    .profile-img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      margin-right: 10px;
    }
  
    .chat-header h2 {
      font-size: 1.5rem;
      margin: 0;
    }
  
    .subject {
      color: #888;
      font-size: 1rem;
      margin: 0;
      margin-top: 5px;
    }
  
    .messages {
      flex-grow: 1;
      overflow-y: auto;
    }
  </style>
  