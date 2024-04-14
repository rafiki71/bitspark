<script>
    import { onMount, onDestroy } from "svelte";
    import EditProfileWidget from "../components/Widgets/EditProfileWidget.svelte";
    import Footer from "../components/Footers/Footer.svelte";
    import Menu from "../components/Sidebar/Sidebar.svelte";
    import { contentContainerClass } from "../helperStore.js";

    import { nostrManager } from "../backend/NostrManagerStore.js";
    import ToolBar from "../components/Toolbar/Toolbar.svelte";
    import { nostrCache } from "../backend/NostrCacheStore.js";
    import { socialMediaManager } from "../backend/SocialMediaManager.js";
    import ProfileBannerWidget from "../components/Widgets/Banner/ProfileBannerWidget.svelte";

    let profile = null;
    let profile_id = null;

    onMount(() => {
        initialize();
    });

    function initialize() {
        if (!$nostrManager) {
            return;
        }
        socialMediaManager.subscribeProfile($nostrManager.publicKey);
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
        profile = await socialMediaManager.getProfile($nostrManager.publicKey);

        if (!profile) {
            return;
        }
        banner = profile.banner;
        profile_id = $nostrManager.publicKey;
    }

    $: $nostrManager, initialize();
    $: $nostrCache, fetchProfile();
</script>

<main class="overview-page">
    <Menu />
    <div class="flex-grow">
        <ProfileBannerWidget {profile_id} />

        <ToolBar />

        <div class={$contentContainerClass}>
            <EditProfileWidget {profile} />
        </div>
    </div>
    <Footer />
</main>
