<script>
    import { onMount } from 'svelte';
    import { dmManager } from '../../backend/DMManager.js'; // Passe den Importpfad an
    import { nostrManager } from '../../backend/NostrManagerStore.js';
    import { nostrCache } from "../../backend/NostrCacheStore.js";

    import { writable } from 'svelte/store';
  
    let decryptedMessages = writable([]);
  
    onMount(async () => {
      initialize();
    });
  
    async function initialize() {
    console.log("Testing DMManager...");
    // Teste die Initialisierung
    await dmManager.init();
    console.log("DMManager initialized with publicKey:", $nostrManager.publicKey);

    // Beispiel: Testnachricht senden
    const receiverPubKey = $nostrManager.publicKey;
    const messageContent = "Hello, this is a test message";
    const subject = "Test Subject";

    try {
      await dmManager.sendMessage(receiverPubKey, messageContent, subject);
      console.log("Test message sent.");
    } catch (error) {
      console.error("Error sending test message:", error);
    }

    await subscribeAndFetchMessages();
  }

  async function subscribeAndFetchMessages() {
    dmManager.subscribeToMessages();

    const messages = await dmManager.fetchMessages();
    const decrypted = [];

    for (const message of messages) {
        console.log(message);
      const decryptedMessage = await dmManager.decryptMessage(message);
      if (decryptedMessage) {
        decrypted.push(decryptedMessage);
      }
    }

    decryptedMessages.set(decrypted);

  }

    $: initialize(), $nostrManager;
    $: initialize(), $nostrCache;

  </script>
  
  <main>
    <h1>DMManager Test</h1>
    <p>Check the console for test results.</p>
  
    <h2>Decrypted Messages:</h2>
    <ul>
      {#each $decryptedMessages as message}
        <li>
          <p><strong>From:</strong> {message.pubkey}</p>
          <p><strong>Content:</strong> {message.content}</p>
          <p><strong>Subject:</strong> {message.tags.find(tag => tag[0] === 'subject') ? message.tags.find(tag => tag[0] === 'subject')[1] : 'No Subject'}</p>
          <p><strong>Timestamp:</strong> {new Date(message.created_at * 1000).toLocaleString()}</p>
        </li>
      {/each}
    </ul>
  </main>
  