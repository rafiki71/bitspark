<script>
    import { onMount, onDestroy } from "svelte";
    import { Link, navigate } from "svelte-routing";
    import ProfileImg from "../components/ProfileImg.svelte";
    import { sendSatsLNurl } from "../LNHelper.js";
    import Menu from "../components/Menu.svelte";
    import UserIdeas from "../components/UserIdeas.svelte";
    import Footer from "../components/Footers/FooterBS.svelte";
    import { sidebarOpen } from "../helperStore.js";
    import Banner from "../components/Banner.svelte";
    import ToolBar from "../components/ToolBar.svelte";
    import { nostrCache } from "../backend/NostrCacheStore.js";
    import { nostrManager } from "../backend/NostrManagerStore.js";
    import ReviewWidget from "../components/ReviewWidget.svelte";

    export let profile_id;

    let profile = null;
    let name = "";
    let about = "";
    let picture = "";
    let banner = "";
    let ghUser = "";
    let lnAddress = "";

    onMount(() => {
        if ($nostrManager) {
            $nostrManager.subscribeToEvents({
                kinds: [0],
                authors: [profile_id],
                "#s": ["bitspark"],
            });
            updateProfile();
        }
    });

    function initialize() {
        if ($nostrManager) {
            $nostrManager.subscribeToEvents({
                kinds: [0],
                authors: [profile_id],
                "#s": ["bitspark"],
            });
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

    async function updateProfile() {
        const profileEvents = $nostrCache.getEventsByCriteria({
            kinds: [0],
            authors: [profile_id],
            tags: {
                s: ["bitspark"],
            },
        });

        if (profileEvents && profileEvents.length > 0) {
            profileEvents.sort((a, b) => b.created_at - a.created_at);
            profile = profileEvents[0].profileData; // Nutzen der neuen Struktur
            name = profile.name;
            about = profile.dev_about;
            picture = profile.picture;
            banner = profile.banner;
            ghUser = profile.githubUsername;
            lnAddress = profile.lud16;
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

        <ToolBar
            bind:lnAddress
            githubRepo={"https://www.github.com/" + ghUser}
        />

        <div class={contentContainerClass}>
            <div class="single-card container">
                <div class="flex justify-center">
                    <div class="single-card-profile-img">
                        {#if profile && profile.picture}
                            <ProfileImg
                                {profile}
                                style={{
                                    position: "absolute",
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    top: "0",
                                    left: "0",
                                }}
                            />
                        {/if}
                    </div>
                </div>
                <div class="text-center mt-6 px-6">
                    <div style="top: -50px; position: relative">
                        <h2 class="base-h2 text-color-df">
                            {name}
                        </h2>
                    </div>
                    <div class="single-card-content text-color-df">
                        {@html about}
                    </div>
                </div>
            </div>
            <UserIdeas {profile_id} />
            <ReviewWidget userPubKey={profile_id} />
        </div>
    </div>
    <Footer />
</main>
