<script>
    import { onMount } from "svelte";
    import { nostrCache } from "../backend/NostrCacheStore.js"; // Pfad anpassen
    import { nostrManager } from "../backend/NostrManagerStore.js"; // Pfad anpassen

    export let event_id;

    let ideaEvent = null;
    $: $nostrCache, fetchIdea();

    async function fetchIdea() {
        console.log("eventID:", event_id);
        ideaEvent = await $nostrCache.getEventById(event_id);
        if (!ideaEvent) {
            console.error("Idea event not found");
            return;
        }

        console.log("Idea found");
    }

    async function shareIdea() {
        if (!ideaEvent) {
            console.error("No idea event to share");
            return;
        }

        // Erstellen des Inhalts für das Content Event
        const content = `${ideaEvent.tags.find((tag) => tag[0] === "iName")[1]} - ${ideaEvent.tags.find((tag) => tag[0] === "iSub")[1]}\n\n${ideaEvent.tags.find((tag) => tag[0] === "abstract")[1]}\n\nhttps://bitspark.bitsperity.dev/idea/${event_id}`;
        const tags = [
            ["s", "bitspark"],
        ];

        // Senden des Content Events
        await $nostrManager.sendEvent(1, content, tags);
    }

    onMount(fetchIdea);
</script>

<i class="fas fa-retweet share-icon" on:click={shareIdea} title="Share Idea"
></i>

<style>
    .share-icon {
        color: #f7931a; /* Bitcoin Orange */
        cursor: pointer;
        font-size: 24px; /* Größe des Icons anpassen */
        transition: color 0.3s;
    }

    .share-icon:hover {
        color: #b4690e; /* Dunkleres Orange beim Hover */
    }
</style>
