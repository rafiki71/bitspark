<script>
    import { onMount, onDestroy } from "svelte";
    import { Link } from "svelte-routing";
    import { nostrCache } from "../backend/NostrCacheStore.js";
    import { nostrManager } from "../backend/NostrManagerStore.js";
    import { NOSTR_KIND_IDEA } from '../constants/nostrKinds';

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
            const profileEvents = $nostrCache.getEventsByCriteria({
                kinds: [0],
                authors: [profile_id],
                tags: {
                    s: ["bitspark"],
                },
            });

            if (profileEvents && profileEvents.length > 0) {
                profileEvents.sort((a, b) => b.created_at - a.created_at);
                profile = profileEvents[0].profileData; // Nutzung der neuen Profilstruktur
            }

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

<div class="w-full">
    <div style="width: 100%;">
        <div class="px-6 py-6">
            {#if profile}
                <h1
                    class="relative flex text-4xl font-bold text-black ml-6 mb-6"
                >
                    {profile.name}'s Ideas
                </h1>
            {/if}
            <div class="flex flex-wrap justify-between">
                {#each ideas as idea (idea.id)}
                    <Link
                        to={`/idea/${idea.id}`}
                        class="w-full md:w-6/12 lg:w-3/12 px-4 mb-6 no-underline"
                    >
                        <div
                            class="shadow-lg rounded-lg text-center relative min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg pointer-events-auto cursor-pointer lg:w-full"
                        >
                            <div
                                class="relative flex flex-col min-w-0 w-full mb-0 shadow-lg rounded-lg bg-blueGray-600"
                            >
                                <img
                                    class="align-middle border-none max-w-full h-auto rounded-lg"
                                    src={idea.bannerImage}
                                    alt={idea.name}
                                />
                            </div>
                            <blockquote class="relative p-8 mb-4">
                                <h4 class="text-xl font-bold text-blueGray-700">
                                    {idea.name}
                                </h4>
                                {#if idea.subtitle}
                                    <p
                                        class="text-md font-light mt-2 text-blueGray-600"
                                    >
                                        {idea.subtitle}
                                    </p>
                                {/if}
                            </blockquote>
                        </div>
                    </Link>
                {/each}
            </div>
        </div>
    </div>
</div>
