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

    export let profile_id;

    let profile = null;
    let name = "";
    let about = "";
    let picture = "";
    let banner = "";
    let ghUser = "";
    let lnAdress = "";

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
                lnAdress = profile.lud16;
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    }

    async function supportProfile() {
        await sendSatsLNurl(lnAdress);
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
</script>

<div style="position: relative;">
    <main class="overview-page bg-blueGray-200">
        <div class="flex">
            <Menu />
            <div class="flex-grow">
                <Banner
                    bannerImage={banner}
                    title={name}
                    subtitle={""}
                    show_right_text={false}
                />

                <div class="content-overlay">
                    <div class="content-icons">
                        <button
                            on:click={supportProfile}
                            class="support-button"
                        >
                            <img
                                src="../../img/lightning.png"
                                alt="Support via Bitcoin Lightning"
                            />
                        </button>
                        <a
                            href={"https://www.github.com/" + ghUser}
                            target="_blank"
                            class="github-icon"
                        >
                            <i
                                class="fab fa-github text-white"
                                style="font-size: 2.5rem;"
                            />
                        </a>
                    </div>
                </div>

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
        </div>
    </main>
</div>

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
