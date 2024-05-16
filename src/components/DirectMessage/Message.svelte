<script>
    export let message;
  </script>
  
  <style>
    /* Add your styles here */
  </style>
  
  <template>
    <div class="message">
      <p><strong>{message.pubkey}</strong>: {message.content}</p>
    </div>
  </template>
  