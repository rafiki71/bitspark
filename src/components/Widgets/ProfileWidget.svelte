<!-- ProfileWidget.svelte -->
<script>
    import { onMount, onDestroy } from "svelte";
    import ProfileViewImage from "../ProfileViewImage.svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import { NOSTR_KIND_JOB } from "../../constants/nostrKinds";
    import { socialMediaManager } from "../../backend/SocialMediaManager.js";
    import FollowButton from "../FollowButton.svelte";

    export let userPubKey;

    let profile = null;
    let name = "";
    let about = "";
    let picture = "";
    let banner = "";
    let ghUser = "";
    let lnAddress = "";
    let githubRepo = "";
    let profile_pub = "";

    function initialize() {
        if ($nostrManager) {
            $nostrManager.subscribeToEvents({
                kinds: [NOSTR_KIND_JOB],
                "#p": [userPubKey],
                "#t": ["review"],
            });
        }
    }

    async function fetchProfile() {
        profile = await socialMediaManager.getProfile(userPubKey);
        if (!profile) {
            return;
        }
        name = profile.name;
        profile_pub = profile.pubkey;
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

    $: userPubKey, fetchProfile();
    $: $nostrCache && fetchProfile();
    $: $nostrManager && initialize();
</script>

<div class="single-card container">
    <div class="follow-container">
        <FollowButton profilePubKey={profile_pub} />
    </div>
    <ProfileViewImage {profile} />
    <div class="text-center mt-6 px-6" style="top: -90px; position: relative">
        <h2 class="base-h2 text-color-df">
            {name}
        </h2>
        <div class="single-card-content text-color-df">
            {@html about}
        </div>
    </div>
</div>

<style>
     .follow-container {
        align-self: flex-end;
        position: relative;
        top: 10px; /* Adjust based on your layout */
        right: 10px; /* Adjust based on your layout */
        padding: 10px;
    }
</style>