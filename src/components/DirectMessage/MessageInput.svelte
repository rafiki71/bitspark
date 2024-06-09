<script>
    import { createEventDispatcher } from 'svelte';
    import { dmManager } from '../../backend/DMManager.js';

    export let selectedRoom;

    let messageContent = '';
    const dispatch = createEventDispatcher();

    async function sendMessage() {
        if (messageContent.trim() === '') return;

        if ($selectedRoom && $selectedRoom.participants) {
            const receiverPubKey = $selectedRoom.participants.split(',')[0];
            const subject = $selectedRoom.subject;

            try {
                await dmManager.sendMessage(receiverPubKey, messageContent, subject);
                messageContent = '';
                dispatch('messageSent');
            } catch (error) {
                console.error("Error sending message:", error);
            }
        } else {
            console.error("Selected room or participants are not defined.");
        }
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                // Shift+Enter pressed - insert a new line
                event.preventDefault();
                messageContent += '\n';
            } else {
                // Enter pressed - send the message
                event.preventDefault();
                sendMessage();
            }
        }
    }
</script>

<div class="message-input">
    <textarea 
        bind:value={messageContent} 
        placeholder="Type your message..." 
        on:keydown={handleKeyDown}></textarea>
    <button on:click={sendMessage}>Send</button>
</div>

<style>
    .message-input {
        display: flex;
        align-items: center;
        padding: 0.75rem;
        border-top: 1px solid #eee;
        background-color: #f9f9f9;
    }

    textarea {
        flex-grow: 1;
        padding: 0.75rem;
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-right: 0.5rem;
        resize: none;
        height: 50px; /* Initial height for better UX */
    }

    button {
        padding: 0.75rem 1rem;
        font-size: 1rem;
        color: #fff;
        background-color: #007bff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    button:hover {
        background-color: #0056b3;
    }
</style>
