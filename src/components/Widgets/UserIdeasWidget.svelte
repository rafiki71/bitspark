<script>
    import { onMount, onDestroy } from "svelte";
    import IdeaCardSmall from "../Cards/IdeaCardSmall.svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import { NOSTR_KIND_IDEA } from "../../constants/nostrKinds.js";
    import { socialMediaManager } from "../../backend/SocialMediaManager.js";
    export let profile_id;

    let ideas = [];
    let profile = null;

    // Reaktive Anweisung, um bei Änderungen des Managers Daten zu aktualisieren
    $: $nostrManager && fetchData();
    $: $nostrManager && initialize();

    // Reaktive Anweisung, um bei Änderungen des Caches Daten zu aktualisieren
    $: $nostrCache && fetchData();

    onMount(() => {
        // Initialisierung, wenn der Manager bereits existiert
        if ($nostrManager) {
            initialize();
        }
    });

    function initialize() {
        // Abonnieren der Events für das Profil und die Ideen
        $nostrManager.subscribeToEvents({
            kinds: [0, NOSTR_KIND_IDEA], // Profil und Ideen
            authors: [profile_id],
            "#s": ["bitspark"],
        });
    }

    onDestroy(() => {
        // Beenden der Abonnements bei Zerstörung der Komponente
        $nostrManager.unsubscribeAll();
    });

    async function fetchData() {
        try {
            // Abrufen des Profils aus dem Cache
            profile = await socialMediaManager.getProfile(profile_id);

            // Abrufen der Ideen des Benutzers
            const ideaEvents = $nostrCache.getEventsByCriteria({
                kinds: [NOSTR_KIND_IDEA],
                authors: [profile_id],
                tags: {
                    s: ["bitspark"],
                },
            });

            ideas = ideaEvents.map((idea) => {
                const tags = idea.tags.reduce(
                    (tagObj, [key, value]) => ({ ...tagObj, [key]: value }),
                    {},
                );

                return {
                    id: idea.id,
                    name: tags.iName,
                    subtitle: tags.iSub,
                    bannerImage: tags.ibUrl,
                    message: idea.content,
                    abstract: tags.abstract,
                };
            });
        } catch (error) {
            console.error("Error fetching user ideas:", error);
        }
    }
</script>

<div class="single-card container">
    <div class="px-6 py-6">
        {#if profile}
            <h4 class="base-h4 text-color-df" style="margin-bottom: 1.5rem;">
                {profile.name}'s Ideas
            </h4>
        {/if}
        <div class="row">
            {#each ideas as idea (idea.id)}
                <IdeaCardSmall card={idea} />
            {/each}
        </div>
    </div>
</div>
