<script>
    import { onMount, onDestroy } from "svelte";
    import EditProfileWidget from "../components/EditProfileWidget.svelte";
    import Footer from "../components/Footers/FooterBS.svelte";
    import Menu from "../components/Menu.svelte";
    import { sidebarOpen } from "../helperStore.js";
    import { nostrManager } from "../backend/NostrManagerStore.js";
    import ToolBar from "../components/ToolBar.svelte";
    import { nostrCache } from "../backend/NostrCacheStore.js";
    import { socialMediaManager } from "../backend/SocialMediaManager.js";
    import ProfileBannerWidget from "../components/Widgets/Banner/ProfileBannerWidget.svelte";

    let profile = null;
    let name = "";
    let banner = "";
    let lightningAddress = "";
    let profile_id = null;

    let contentContainerClass = "combined-content-container";

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
        name = profile.name;
        banner = profile.banner;
        lightningAddress = profile.lud16;
        profile_id = $nostrManager.publicKey;
    }

    $: $nostrManager, initialize();
    $: $nostrCache, fetchProfile();

    $: {
        if ($sidebarOpen) {
            contentContainerClass = "combined-content-container sidebar-open";
        } else {
            contentContainerClass = "combined-content-container";
        }
    }
</script>

<main class="overview-page">
    <Menu />
    <div class="flex-grow">
        <ProfileBannerWidget {profile_id} />

        <ToolBar bind:lightningAddress githubRepo="" />

        <div class={contentContainerClass}>
            <EditProfileWidget {profile} />
        </div>
    </div>
    <Footer />
</main>
