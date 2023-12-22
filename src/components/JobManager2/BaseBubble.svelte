<!-- BaseBubble.svelte -->
<script>
    import ProfileImg from "../ProfileImg.svelte";
    import { onMount } from "svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";

    export let event;
    export let backgroundColor = '#f0f0f0'; // Standardwert
    export let textColor = '#333'; // Standardwert
    export let borderColor = '#ddd'; // Optional
    export let borderRadius = '8px'; // Optional

    let profile = {};
    let formattedDate = "";
    let isOwnMessage = false;

    // Methode, um das Profil des Authors zu laden
    async function fetchProfile() {
        if (!event || !event.pubkey) return;

        const profileEvents = $nostrCache.getEventsByCriteria({
            kinds: [0],
            authors: [event.pubkey],
        });

        if (profileEvents.length > 0) {
            profileEvents.sort((a, b) => b.created_at - a.created_at);
            profile = profileEvents[0].profileData;
        }
    }

    // Reaktive Anweisung für das Datum
    $: if (event && event.created_at) {
        formattedDate = getFormattedDate(event.created_at);
    }

    function getFormattedDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleString();
    }

    onMount(() => {
        fetchProfile();
        checkIfOwnMessage();
    });

    $: $nostrManager, checkIfOwnMessage();

    function checkIfOwnMessage() {
        if(!event) {
            return;
        }
        isOwnMessage = event.pubkey === $nostrManager.publicKey;
    }

    // Reaktive Anweisung, um auf Änderungen im Cache zu reagieren
    $: $nostrCache, fetchProfile();
</script>

<div class={`bubble ${isOwnMessage ? 'own-message' : 'other-message'}`} 
     style="background-color: {backgroundColor}; color: {textColor}; border-radius: {borderRadius}; border-color: {borderColor}; margin-left: {isOwnMessage ? 'auto' : '10px'}; margin-right: {isOwnMessage ? '10px' : 'auto'};">
    {#if profile.picture}
        <ProfileImg
            {profile}
            style={{
                width: "70px",
                height: "70px",
                order: isOwnMessage ? 2 : 0,
                "margin-left": isOwnMessage ? "15px" : "0",
                "margin-right": isOwnMessage ? "0" : "15px",
            }}
        />
    {/if}
    <div class="content">
        <slot />
        <div style="color: {textColor};"  class="timestamp {isOwnMessage ? 'left' : 'right'}">
            {formattedDate}
        </div>
    </div>
</div>

<style>
    .bubble {
        display: flex;
        align-items: center;
        gap: 15px;
        max-width: 75%; /* Beispielwert, anpassbar */
        padding: 10px;
        border-radius: 8px;
        margin: 10px auto; /* Zentriert die Bubble und fügt vertikalen Abstand hinzu */
        margin-bottom: 10px;
    }

    .own-message {
        flex-direction: row-reverse;
        justify-content: flex-end; /* Richtet eigene Nachrichten am rechten Rand aus */
    }

    .other-message {
        flex-direction: row;
        justify-content: flex-start; /* Richtet fremde Nachrichten am linken Rand aus */
    }

    .content {
        flex-grow: 1;
        overflow: hidden;
        padding: 10px;
        order: 1;
    }

    .timestamp {
        color: #888;
        font-size: 0.8em;
        text-align: right;
    }

    .timestamp.left {
        text-align: left;
    }

    .timestamp.right {
        text-align: right;
    }
</style>
