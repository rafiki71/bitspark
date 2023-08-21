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

        <ToolBar bind:lnAddress githubRepo={"https://www.github.com/" + ghUser} />

        <div class={contentContainerClass}>
            <div
                class="container bg-card relative flex flex-col min-w-0 break-words"
            >
                <div class="flex flex-wrap justify-center">
                    <div
                        class="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center"
                    >
                        <div
                            style="width: 150px; height: 150px; border-radius: 50%; overflow: hidden; position: relative; top: -75px;"
                        >
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
                </div>
                <div class="profile-content">
                    {@html about}
                </div>
            </div>

            <div class="container bg-card">
                <UserIdeas {profile_id} />
            </div>
        </div>
        <Footer />
    </div>
</main>

<style>
    .profile-content {
        margin-top: 10px;
        padding: 10px 0;
        border-top: 1px solid #a0aec0; /* blueGray-200 */
        text-align: center;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        width: 100%;
        max-width: 75%; /* equivalent to lg:w-9/12 */
        margin-left: auto;
        margin-right: auto;
        font-size: 1.2em;
        line-height: 1.6;
        color: #4a5568; /* blueGray-700 */
        white-space: pre-line;
        margin-bottom: 2.5em;
    }
</style>
