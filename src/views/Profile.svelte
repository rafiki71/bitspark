<script>
    import { onMount, onDestroy } from "svelte";
    import Menu from "../components/Menu.svelte";
    import UserIdeas from "../components/UserIdeas.svelte";
    import Footer from "../components/Footers/FooterBS.svelte";
    import { sidebarOpen } from "../helperStore.js";
    import ToolBar from "../components/ToolBar.svelte";
    import { nostrCache } from "../backend/NostrCacheStore.js";
    import { nostrManager } from "../backend/NostrManagerStore.js";
    import { socialMediaManager } from "../backend/SocialMediaManager.js";
    import ReviewWidget from "../components/ReviewWidget.svelte";
    import ProfileWidget from "../components/ProfileWidget.svelte";
    import ProfileBannerWidget from "../components/Widgets/Banner/ProfileBannerWidget.svelte";

    export let profile_id;

    let profile = null;
    let name = "";
    let banner = "";
    let githubUsername = "";
    let lightningAddress = "";
    let githubRepo = "";

    let contentContainerClass = "combined-content-container";

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
        githubUsername = profile.githubUsername;
        lightningAddress = profile.lud16;

        if (githubUsername) {
            githubRepo = "https://www.github.com/" + githubUsername;
        } else {
            githubRepo = "";
        }
    }

    $: $nostrManager, initialize();
    $: $nostrCache, fetchProfile();
    $: profile_id, fetchProfile();

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

        <ToolBar lnAddress={lightningAddress} {githubRepo} />

        <div class={contentContainerClass}>
            <ProfileWidget userPubKey={profile_id} />
            <UserIdeas {profile_id} />
            <ReviewWidget userPubKey={profile_id} />
        </div>
    </div>
    <Footer />
</main>
