<script>
    import { onMount, onDestroy } from "svelte";
    import Banner from "../../Banner.svelte";
    import { nostrManager } from "../../../backend/NostrManagerStore.js";
    import { NOSTR_KIND_IDEA } from "../../../constants/nostrKinds";
    import { nostrCache } from "../../../backend/NostrCacheStore.js";

    export let id;

    let idea = {};
    let bannerImage = null;
    let title = null;
    let subtitle = null;

    onMount(() => {
        initialize();
    });

    async function initialize() {
        if (!$nostrManager) {
            return;
        }
        $nostrManager.subscribeToEvents({
            kinds: [NOSTR_KIND_IDEA],
            "#s": ["bitspark"],
            ids: [id],
        });
    }

    onDestroy(() => {
        if (!$nostrManager) {
            return;
        }
        $nostrManager.unsubscribeAll();
    });

    async function fetchIdea() {
        if (!$nostrManager) {
            return;
        }
        const fetchedIdea = await $nostrCache.getEventById(id);

        if (!fetchedIdea) {
            return;
        }
        idea = transformIdea(fetchedIdea);
        bannerImage = idea.bannerImage;
        title = idea.name;
        subtitle = idea.subtitle;
    }

    function transformIdea(event) {
        const tags = event.tags.reduce(
            (tagObj, [key, value]) => ({ ...tagObj, [key]: value }),
            {},
        );

        return {
            id: event.id,
            name: tags.iName,
            subtitle: tags.iSub,
            bannerImage: tags.ibUrl || "default_image_url",
            message: event.content,
            githubRepo: tags.gitrepo,
            lnAdress: tags.lnadress,
            pubkey: event.pubkey,
            abstract: tags.abstract,
        };
    }
    $: $nostrCache, fetchIdea();
    $: $nostrManager, initialize();
</script>

<Banner {bannerImage} {title} {subtitle} show_right_text={false} />
