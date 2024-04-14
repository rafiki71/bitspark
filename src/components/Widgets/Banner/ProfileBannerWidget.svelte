<script>
    import { onMount, onDestroy } from "svelte";
    import Banner from "../../Banner.svelte";
    import { nostrManager } from "../../../backend/NostrManagerStore.js";
    import { nostrCache } from "../../../backend/NostrCacheStore.js";
    import { socialMediaManager } from "../../../backend/SocialMediaManager.js";

    export let profile_id;

    let profile = null;
    let name = "";
    let banner = "";

    onMount(() => {
        initialize();
    });

    function initialize() {
        if (!$nostrManager) {
            return;
        }
        socialMediaManager.subscribeProfile(profile_id);
        fetchProfile();
    }

    onDestroy(() => {
        if (!$nostrManager) {
            return;
        }
        $nostrManager.unsubscribeAll();
    });

    async function fetchProfile() {
        if (!$nostrManager) {
            return;
        }
        profile = await socialMediaManager.getProfile(profile_id);
        if (!profile) {
            return;
        }

        name = profile.name;
        banner = profile.banner;
    }
    $: $nostrManager, initialize();
    $: $nostrCache, fetchProfile();
</script>

<Banner
    bannerImage={banner}
    title={name}
    subtitle={""}
    show_right_text={false}
/>
