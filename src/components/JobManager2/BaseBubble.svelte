<!-- BaseBubble.svelte -->
<script>
    import ProfileImg from "../ProfileImg.svelte";
    import { onMount } from "svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import { NOSTR_KIND_JOB } from "../../constants/nostrKinds";
    import { socialMediaManager } from "../../backend/SocialMediaManager.js";
    import { nostrJobManager } from "../../backend/NostrJobManager.js";

    export let event;
    export let backgroundColor = "#f0f0f0"; // Standardwert
    export let textColor = "#333"; // Standardwert
    export let borderColor = "#ddd"; // Optional
    export let borderRadius = "8px"; // Optional
    export let status = "normal";
    export let showRatingButton = true;

    let profile = {};
    let formattedDate = "";
    let isOwnMessage = false;

    let showRatingPopup = false;
    let rating = 0;
    let comment = "";

    // Funktionen für die Sternebewertung und das Kommentarfeld
    let stars = [1, 2, 3, 4, 5]; // Für ein 5-Sterne-Bewertungssystem

    function setRating(star) {
        rating = star;
    }

    function toggleRatingPopup() {
        showRatingPopup = !showRatingPopup;
    }

    async function submitRating() {
        nostrJobManager.submitRating(event, rating.toString(), comment);
    }

    // Methode, um das Profil des Authors zu laden
    async function fetchProfile() {
        profile = await socialMediaManager.getProfile(event.pubkey);
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
        if (!event) {
            return;
        }
        isOwnMessage = event.pubkey === $nostrManager.publicKey;
    }

    // Reaktive Anweisung, um auf Änderungen im Cache zu reagieren
    $: $nostrCache, fetchProfile();
    $: showRatingButton = showRatingButton && isOwnMessage;
</script>

<div
    class={`bubble ${isOwnMessage ? "own-message" : "other-message"} ${status}`}
    style="background-color: {backgroundColor}; color: {textColor}; border-radius: {borderRadius}; border-color: {borderColor};"
>
    {#if profile && profile.picture}
        <div class="profile-container">
            <ProfileImg
                {profile}
                style={{
                    "object-fit": "cover",
                    "border-radius": "50%",
                }}
            />
        </div>
    {/if}
    <div class="content">
        <slot />
        <div class="timestamp {isOwnMessage ? 'left' : 'right'}">
            {formattedDate}
        </div>
    </div>

    {#if showRatingButton}
        <button class="rating-btn" on:click={toggleRatingPopup}>
            <i class="fas fa-star"></i>
        </button>
    {/if}
</div>

{#if showRatingPopup}
    <div class="rating-popup-overlay">
        <div class="rating-popup">
            <h3>Leave a Rating</h3>
            <div class="star-rating">
                {#each stars as star}
                    <span
                        class={`star ${star <= rating ? "selected" : ""}`}
                        on:click={() => setRating(star)}
                    >
                        &#9733;
                    </span>
                {/each}
            </div>
            <textarea bind:value={comment} placeholder="Your comment..."
            ></textarea>
            <div class="button-group">
                <button on:click={submitRating}>Submit</button>
                <button on:click={toggleRatingPopup}>Cancel</button>
            </div>
        </div>
    </div>
{/if}

<style>
    .profile-container {
        width: 70px;
        height: 70px;
        flex-shrink: 0;
        border-radius: 50%;
        overflow: hidden;
        margin: 0 15px; /* oder passen Sie den Abstand an Ihre Bedürfnisse an */
    }

    .content {
        flex-grow: 1;
        overflow: hidden; /* Verhindert das Überlaufen des Textes */
        max-width: calc(
            100% - 90px
        ); /* Breite abzüglich des Profilbildes und Abstand */
    }

    .rating-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;
    }

    .rating-popup {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
        width: 300px; /* Anpassung der Breite */
    }

    .star-rating {
        display: flex;
        justify-content: center;
        margin-bottom: 15px;
    }

    .star {
        cursor: pointer;
        font-size: 2em;
        color: #ffd700; /* Goldfarbe für Sterne */
    }

    .star.selected {
        color: #f39c12; /* Dunklere Goldfarbe für ausgewählte Sterne */
    }

    textarea {
        width: 100%;
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 10px;
        margin-bottom: 10px;
    }

    .button-group {
        display: flex;
        justify-content: space-between;
    }

    .button-group button {
        padding: 8px 15px;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        background-color: #4caf50; /* Grüner Button */
        color: white;
    }

    .button-group button:last-child {
        background-color: #f44336; /* Roter Button */
    }

    .blur {
        filter: blur(4px);
    }

    .rating-btn {
        border: none;
        background: none;
        cursor: pointer;
        color: #fcd535; /* Goldfarbe für den Stern */
        position: absolute;
        top: 10px;
        right: 10px;
    }

    textarea {
        width: 100%;
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 10px;
        margin-bottom: 10px;
        resize: vertical; /* Ermöglicht vertikales Vergrößern/Verkleinern */
    }

    .bubble {
        width: 80%; /* Ermöglicht es der Bubble, die Größe basierend auf ihrem Inhalt zu ändern */
        min-width: 0; /* Verhindert, dass die Bubble zu klein wird */
        max-width: calc(100% - 20px);
        position: relative;
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 10px;
        border-radius: 8px;
        margin: 10px auto; /* Zentriert die Bubble und fügt vertikalen Abstand hinzu */
        margin-bottom: 10px;
    }

    .own-message {
        flex-direction: row-reverse;
        justify-content: flex-end; /* Richtet eigene Nachrichten am rechten Rand aus */
        margin-right: 2%; /* Setzt den rechten Rand auf 0, sodass es am Rand anliegt */
        margin-left: auto; /* Setzt den linken Rand auf auto, sodass es sich nach rechts verschiebt */
    }

    .other-message {
        flex-direction: row;
        justify-content: flex-start; /* Richtet fremde Nachrichten am linken Rand aus */
        margin-left: 2%; /* Setzt den linken Rand auf 0, sodass es am Rand anliegt */
        margin-right: auto; /* Setzt den rechten Rand auf auto, sodass es sich nach links verschiebt */
    }

    .content {
        margin-left: 15px;
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
