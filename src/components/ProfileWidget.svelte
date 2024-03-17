<!-- ProfileWidget.svelte -->
<script>
    import { onMount, onDestroy } from "svelte";
    import ProfileImg from "../components/ProfileImg.svelte";
    import { nostrCache } from "../backend/NostrCacheStore.js";
    import { nostrManager } from "../backend/NostrManagerStore.js";
    import { NOSTR_KIND_JOB } from "../constants/nostrKinds";
    import { socialMediaManager } from "../backend/SocialMediaManager.js";

    export let userPubKey;

    let profile = null;
    let name = "";
    let about = "";
    let picture = "";
    let banner = "";
    let ghUser = "";
    let lnAddress = "";
    let githubRepo = "";

    function initialize() {
        if ($nostrManager) {
            $nostrManager.subscribeToEvents({
                kinds: [NOSTR_KIND_JOB],
                "#p": [userPubKey],
                "#t": ["review"],
            });
        }
    }

    function fetchReviews() {
        if ($nostrCache) {
            reviewEvents = $nostrCache.getEventsByCriteria({
                kinds: [NOSTR_KIND_JOB],
                tags: {
                    p: [userPubKey],
                    t: ["review"],
                },
            });
        }

        fetchProfileName();
        calculateAverageRating();
    }

    function calculateAverageRating() {
        const totalRating = reviewEvents.reduce((sum, event) => {
            const ratingTag = event.tags.find((tag) => tag[0] === "rating");
            return sum + (ratingTag ? parseInt(ratingTag[1], 10) : 0);
        }, 0);
        averageRating =
            reviewEvents.length > 0
                ? (totalRating / reviewEvents.length).toFixed(2)
                : 0;
    }

    async function fetchProfile() {
        profile = await socialMediaManager.getProfile(userPubKey);
        if(!profile) {
            return;
        }

        name = profile.name;
        about = profile.dev_about;
        picture = profile.picture;
        banner = profile.banner;
        ghUser = profile.githubUsername;
        lnAddress = profile.lud16;
        if (ghUser) {
            githubRepo = "https://www.github.com/" + ghUser;
        } else {
            githubRepo = "";
        }
    }

    onMount(() => {
        initialize();
    });

    onDestroy(() => {
        if ($nostrManager) {
            $nostrManager.unsubscribeAll();
        }
    });

    $: $nostrCache && fetchProfile();
    $: $nostrManager && initialize();

</script>

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
    <div class="text-center mt-6 px-6" style="top: -90px; position: relative">
        <h2 class="base-h2 text-color-df">
            {name}
        </h2>
        <div class="single-card-content text-color-df">
            {@html about}
        </div>
    </div>
</div>
