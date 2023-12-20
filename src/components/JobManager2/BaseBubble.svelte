<!-- BaseBubble.svelte -->
<script>
    import ProfileImg from "../ProfileImg.svelte";
    import { onMount } from "svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";

    export let event;

let profile = {};
let formattedDate = '';

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
});

// Reaktive Anweisung, um auf Änderungen im Cache zu reagieren
$: $nostrCache, fetchProfile();
</script>

<div class="bubble">
{#if profile.picture}
    <ProfileImg {profile} style={{ width: '70px', height: '70px', borderRadius: '50%', margin: '0 15px 0 0' }} />
{/if}
<div class="content">
    <slot></slot> <!-- Platzhalter für spezifische Inhalte -->
    <div class="timestamp">{formattedDate}</div>
</div>
</div>

<style>
.bubble {
    background-color: #f0f0f0;
    padding: 10px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 15px; /* Erhöht den Abstand zwischen Bild und Inhalt */
    max-width: 100%;
}

.content {
    flex-grow: 1;
    overflow: hidden;
    padding-left: 10px; /* Fügt links vom Inhalt einen Abstand hinzu */
}

.timestamp {
    color: #888;
    font-size: 0.8em;
    text-align: right;
}
</style>