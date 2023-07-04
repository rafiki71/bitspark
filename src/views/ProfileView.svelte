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

    async function supportIdea() {
        await sendSatsLNurl(lnAdress);
    }
    let contentContainerClass = "content-container";

    $: {
        if ($sidebarOpen) {
            contentContainerClass = "content-container sidebar-open";
        } else {
            contentContainerClass = "content-container";
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
                    showSubtitles={false}
                />
                <div
                    class="absolute top-4 right-4 text-3xl text-white flex justify-end items-center gap-6"
                >
                    <button on:click={supportIdea} style="padding: 0;">
                        <img
                            src="/img/lightning.png"
                            style="height: 2.5rem; width: 2.5rem;"
                            alt="Support via Bitcoin Lightning"
                        />
                    </button>
                    <a
                        href={"https://www.github.com/" + ghUser}
                        target="_blank"
                    >
                        <i
                            class="fab fa-github text-white"
                            style="font-size: 2.5rem;"
                        />
                    </a>
                </div>

                <div class={contentContainerClass}>
                    <section
                        class="content-container relative py-16 bg-blueGray-200"
                    >
                        <div class="content-container">
                            <div class="container mx-auto px-4">
                                <div class="profile-section">
                                    <div
                                        class="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg"
                                    >
                                        {#if profile_id === publicKey}
                                            <button
                                                class="bg-blue-500 text-white font-bold py-2 px-4 rounded absolute"
                                                style="top: 10px; right: 10px; z-index: 1;"
                                                on:click={() =>
                                                    navigate(
                                                        `/edit_profile/${publicKey}`
                                                    )}
                                            >
                                                Edit
                                            </button>
                                        {/if}
                                        <div class="px-6">
                                            <div
                                                class="flex flex-wrap justify-center"
                                            >
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
                                                                    position:
                                                                        "absolute",
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit:
                                                                        "cover",
                                                                    top: "0",
                                                                    left: "0",
                                                                }}
                                                            />
                                                        {/if}
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                class="mt-10 py-10 border-t border-blueGray-200 text-center"
                                            >
                                                <div
                                                    class="flex flex-wrap justify-center"
                                                >
                                                    <div
                                                        class="w-full lg:w-9/12 px-4"
                                                    >
                                                        <div
                                                            class="text-lg leading-relaxed mt-4 mb-20 text-blueGray-700 whitespace-pre-line"
                                                        >
                                                            {@html about}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="ideas-section mt-4">
                                        <div class="w-full">
                                            <UserIdeas {profile_id} />
                                        </div>
                                    </div>

                                    <div
                                        class="flex justify-end mt-0 items-center mr-0"
                                    >
                                        <button
                                            class="bg-red-500 text-white font-bold py-2 px-4 rounded"
                                            on:click={() =>
                                                window.history.back()}
                                        >
                                            Back
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <Footer />
                </div>
            </div>
        </div>
    </main>
</div>

<style>
    .content-section {
        display: flex;
        background-color: #e2e8f0 !important;
    }

    .content-container {
        flex-grow: 1;
        z-index: 0;
    }

    .flex-grow {
        /* Other styles */
        z-index: 0; /* This will keep the div behind the button */
    }
    .content-container {
        margin-left: 0; /* This is the starting state */
        transition: margin-left 0.3s ease-in-out;
        flex-grow: 1;
        z-index: 0; /* This will keep the div behind the button */
    }

    .content-container.sidebar-open {
        margin-left: 200px; /* This should be equal to the width of the sidebar */
    }
    .profile-section {
        margin-top: -2rem;
    }
</style>
