<script>
    import { createEventDispatcher } from "svelte";
    import { dmManager } from "../../backend/DMManager.js";
  
    export let chatRoomId;
  
    let messageContent = "";
    const dispatch = createEventDispatcher();
  
    const sendMessage = async () => {
      const receiverPubKey = ""; // Retrieve the receiver's public key as per your application logic
      await dmManager.sendMessage(receiverPubKey, messageContent);
      messageContent = "";
      dispatch("messageSent");
    };
  </script>
  
  <style>
    /* Add your styles here */
  </style>
  
  <template>
    <div>
      <textarea bind:value={messageContent} placeholder="Type your message here..."></textarea>
      <button on:click={sendMessage}>Send</button>
    </div>
  </template>
  