<script>
    import { onMount } from "svelte";
    import { Link, navigate } from "svelte-routing";
    import ProfileImg from "../components/ProfileImg.svelte";
    import { sendSatsLNurl } from "../LNHelper.js";
    import Menu from "../components/Menu.svelte";
    import { helperStore } from "../helperStore.js"; // Import the store
    import UserIdeas from "../components/UserIdeas.svelte"; // Import UserIdeas
    import Footer from "../components/Footers/FooterBS.svelte";
    import { sidebarOpen } from "../helperStore.js";
    import Banner from "../components/Banner.svelte";
    import "../styles/global.css";
    import ToolBar from "../components/ToolBar.svelte";

    export let profile_id;

    let profile = null;
    let name = "";
    let about = "";
    let picture = "";
    let banner = "";
    let ghUser = "";
    let lnAddress = "";

    let publicKey = "";

    onMount(async () => {
        fetchData();
    });

    async function fetchData() {
        try {
            publicKey = $helperStore.publicKey;
            profile = await $helperStore.getProfile(profile_id);
            if (profile) {
                name = profile.name;
                about = profile.dev_about;
                picture = profile.picture;
                banner = profile.banner;
                ghUser = profile.githubUsername;
                lnAddress = profile.lud16;
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
        console.log("lnAddress changed:", lnAddress);
    }

    async function supportProfile() {
        await sendSatsLNurl(lnAddress);
    }
    let contentContainerClass = "combined-content-container";

    $: {
        if ($sidebarOpen) {
            contentContainerClass = "combined-content-container sidebar-open";
        } else {
            contentContainerClass = "combined-content-container";
        }
    }
    $: fetchData(), $helperStore;
    $: fetchData(), profile_id;
    $: lnAddress;
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

            <div class="single-card container">
                <UserIdeas {profile_id} />
            </div>
        </div>
        <Footer />
    </div>
</main>
