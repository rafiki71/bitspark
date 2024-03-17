<script>
    import { onMount, onDestroy } from "svelte";
    import Menu from "../components/Menu.svelte";
    import UserIdeas from "../components/UserIdeas.svelte";
    import Footer from "../components/Footers/FooterBS.svelte";
    import { sidebarOpen } from "../helperStore.js";
    import Banner from "../components/Banner.svelte";
    import ToolBar from "../components/ToolBar.svelte";
    import { nostrCache } from "../backend/NostrCacheStore.js";
    import { nostrManager } from "../backend/NostrManagerStore.js";
    import { socialMediaManager } from "../backend/SocialMediaManager.js";
    import ReviewWidget from "../components/ReviewWidget.svelte";
    import ProfileWidget from "../components/ProfileWidget.svelte";

    export let profile_id;

    let profile = null;
    let name = "";
    let banner = "";
    let ghUser = "";
    let lnAddress = "";
    let githubRepo = "";

    onMount(() => {
        initialize();
    });

    function initialize() {
        if ($nostrManager) {
            socialMediaManager.subscribeProfile(profile_id);
            updateProfile();
        }
    }

    onDestroy(() => {
        if ($nostrManager) {
            $nostrManager.unsubscribeAll();
        }
    });

    $: $nostrManager, initialize();
    $: $nostrCache, updateProfile();
    $: profile_id, initialize();
    $: profile_id, updateProfile();

    async function updateProfile() {
        profile = await socialMediaManager.getProfile(profile_id);
        if (!profile) {
            return;
        }

        name = profile.name;
        banner = profile.banner;
        ghUser = profile.githubUsername;
        lnAddress = profile.lud16;
        if (ghUser) {
            githubRepo = "https://www.github.com/" + ghUser;
        } else {
            githubRepo = "";
        }
    }

    let contentContainerClass = "combined-content-container";

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
        <Banner
            bannerImage={banner}
            title={name}
            subtitle={""}
            show_right_text={false}
        />

        <ToolBar bind:lnAddress {githubRepo} />

        <div class={contentContainerClass}>
            <ProfileWidget userPubKey={profile_id} />
            <UserIdeas {profile_id} />
            <ReviewWidget userPubKey={profile_id} />
        </div>
    </div>
    <Footer />
</main>
