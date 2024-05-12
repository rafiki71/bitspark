<script>
    import IdeaCard from "../Cards/IdeaCard.svelte";
    import { selectedFeed } from "./feedSelectionStore.js";
    import FeedSelector from "./FeedSelector.svelte";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { relaysStore } from "../../backend/RelayStore.js";
    import { NOSTR_KIND_IDEA } from "../../constants/nostrKinds";
    import { onMount, onDestroy } from "svelte";
    import { socialMediaManager } from "../../backend/SocialMediaManager.js";
    import { zapManager } from "../../backend/ZapManager.js";

    let ideas = [];
    export let category;

    const subscribeFollowList = async () => {
        if ($nostrManager?.publicKey) {
            socialMediaManager.subscribeFollowList($nostrManager.publicKey);
        }
    };
    function transformIdeaToCard(idea) {
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
            pubkey: idea.pubkey,
        };
    }

    function initialize() {
        if ($nostrManager) {
            $nostrManager.subscribeToEvents({
                kinds: [NOSTR_KIND_IDEA],
                "#s": ["bitspark"],
            });
            updateFeed();
        }
    }

    onMount(() => {
        initialize();
    });

    onDestroy(() => {
        $nostrManager.unsubscribeAll(); // Diese Methode müsste in Ihrem nostrManager definiert sein
    });

    $: updateFeed(), category;
    $: initialize(), $nostrManager;
    $: updateFeed(), $relaysStore;
    $: subscribeFollowList(), $nostrManager;


    $: if ($nostrManager && $nostrCache) {
        updateFeed();
    }

    // Abonniere den selectedFeed Store, um auf Änderungen zu reagieren.
    $: $selectedFeed, updateFeed();

    async function fetchVerified() {
        let criteria = {
            kinds: [NOSTR_KIND_IDEA],
            tags: { s: ["bitspark"] },
        };

        if (category) {
            criteria.tags.c = [category];
        }

        const fetchedEvents = await $nostrCache.getEventsByCriteria(criteria);

        const tempVerifiedCards = [];

        await Promise.all(
            fetchedEvents.map(async (idea) => {
                const card = transformIdeaToCard(idea);
                let profile = await socialMediaManager.getProfile(idea.pubkey);
                if (profile) {
                    if (profile.verified) {
                        tempVerifiedCards.push(card);
                    }
                }
            }),
        );

        // Zuweisen der temporären Arrays zu den reaktiven Arrays für das UI-Rendering
        return tempVerifiedCards;
    }

    async function fetchUnverified() {
        let criteria = {
            kinds: [NOSTR_KIND_IDEA],
            tags: { s: ["bitspark"] },
        };

        if (category) {
            criteria.tags.c = [category];
        }

        const fetchedEvents = await $nostrCache.getEventsByCriteria(criteria);

        const tempUnverifiedCards = [];

        await Promise.all(
            fetchedEvents.map(async (idea) => {
                const card = transformIdeaToCard(idea);
                let profile = await socialMediaManager.getProfile(idea.pubkey);
                if (profile) {
                    if (!profile.verified) {
                        tempUnverifiedCards.push(card);
                    }
                }
            }),
        );
        return tempUnverifiedCards;
    }

    async function fetchHot() {
        const allIdeas = await $nostrCache.getEventsByCriteria({
            kinds: [NOSTR_KIND_IDEA], // Fetch all idea type events
        });

        const ideaWithMetrics = await Promise.all(allIdeas.map(async (idea) => {
            
            await zapManager.subscribeZaps(idea.id);
            await socialMediaManager.subscribeLikes(idea.id);
            const likes = await socialMediaManager.getLikes(idea.id);
            const sats = await zapManager.getTotalZaps(idea.id);
            return { ...idea, likes, sats };
        }));

        // Sort ideas by a combination of likes and sats, adjust the weighting as necessary
        ideaWithMetrics.sort((a, b) => (b.likes + b.sats) - (a.likes + a.sats));

        // Convert the sorted ideas to the card format and return the top N results
        return ideaWithMetrics.slice(0, 10).map(transformIdeaToCard); // Top 10 hot ideas
    }


    async function fetchFollowed() {
        const followedEvents = await socialMediaManager.fetchFollowedEvents();
        return followedEvents.map(transformIdeaToCard);
    }

    async function updateFeed() {
        switch ($selectedFeed) {
            case "verified":
                ideas = await fetchVerified();
                break;
            case "unverified":
                ideas = await fetchUnverified();
                break;
            case "hot":
                ideas = await fetchHot();
                break;
            case "followed":
                ideas = await fetchFollowed();
                break;
        }
    }
</script>

<div class="feed-selector-container">
    <FeedSelector />
</div>
<div class="container mx-auto px-4">
    <div class="row">
        {#each ideas as idea (idea.id)}
            <div class="col-12 col-sm-6 col-md-6 col-lg-6 mb-8">
                <IdeaCard card={idea} />
            </div>
        {/each}
    </div>
</div>

<style>
    .feed-selector-container {
        display: flex;
        justify-content: center;
        padding: 20px;
    }
</style>
