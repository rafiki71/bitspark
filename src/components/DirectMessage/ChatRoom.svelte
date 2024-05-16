<script>
    import { onMount } from "svelte";
    import { dmManager } from "./DMManager.js";
    import Message from "./Message.svelte";
    import MessageInput from "./MessageInput.svelte";
    import { writable } from "svelte/store";
  
    export let chatRoomId;
  
    let messages = writable([]);
  
    onMount(() => {
      dmManager.subscribeToMessages(chatRoomId);
      fetchMessages();
  
      return () => {
        dmManager.unsubscribeFromMessages(chatRoomId);
      };
    });
  
    const fetchMessages = async () => {
      const msgs = await dmManager.fetchMessages(chatRoomId);
      messages.set(msgs);
    };
  </script>
  
  <style>
    /* Add your styles here */
  </style>
  
  <template>
    <div>
      <h1>Chat Room</h1>
      <div>
        {#each $messages as message}
          <Message {message} />
        {/each}
      </div>
      <MessageInput {chatRoomId} on:messageSent={fetchMessages} />
    </div>
  </template>
  