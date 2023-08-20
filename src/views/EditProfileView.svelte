<script>
    import { onMount } from "svelte";
    import { Link, navigate } from "svelte-routing";
    import ProfileImg from "../components/ProfileImg.svelte";
    import { helperStore } from "../helperStore.js"; // Import the store
    import Footer from "../components/Footers/FooterBS.svelte";
    import Menu from "../components/Menu.svelte";
    import { sidebarOpen } from "../helperStore.js";
    import Banner from "../components/Banner.svelte";

    export let profile_id;

    let profile = null;
    let name = "";
    let dev_about = "";
    let lud16 = "";
    let picture = "";
    let banner = "";
    let git_username = "";
    let git_proof = "";
    let relays = [];
    let newRelay = "";

    onMount(async () => {
        try {
            profile = await $helperStore.getProfile(profile_id);

            if (profile) {
                name = profile.name;
                dev_about = profile.dev_about;
                picture = profile.picture;
                banner = profile.banner;
                lud16 = profile.lud16;

                // Get GitHub username and proof from profile
                git_username = profile.githubUsername || "";
                git_proof = profile.githubProof || "";
                relays = await $helperStore.clientRelays;
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    });

    const updateProfile = async () => {
        try {
            const updatedIdentities =
                profile && profile.identities
                    ? [
                          ...profile.identities.filter(
                              (identity) => identity.platform !== "github"
                          ),
                          {
                              platform: "github",
                              identity: git_username,
                              proof: git_proof,
                          },
                      ]
                    : [
                          {
                              platform: "github",
                              identity: git_username,
                              proof: git_proof,
                          },
                      ];
            await $helperStore.updateProfile(
                name,
                picture,
                banner,
                dev_about,
                lud16,
                updatedIdentities
            );
            await navigate("/overview"); // navigate back to home page after saving
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    function autoResizeTextarea(e) {
        e.target.style.height = "";
        e.target.style.height = e.target.scrollHeight + "px";
    }

    const deleteRelay = async (relay) => {
        try {
            await $helperStore.deleteRelay(relay);
            relays = relays.filter((r) => r !== relay);
            // Remove relay from relays array
        } catch (error) {
            console.error("Error deleting relay:", error);
        }
    };

    const addRelay = async () => {
        try {
            if (newRelay.trim()) {
                await $helperStore.addRelay(newRelay);
                // Add the new relay to the local list
                relays = [...$helperStore.clientRelays];
                newRelay = "";
            }
        } catch (error) {
            console.error("Error adding relay:", error);
        }
    };

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
                <div class="mt-10 px-10">
                    <div class="text-center mt-12">
                        <div
                            class="mb-2 text-blueGray-600 mt-10 w-full lg:w-9/12 px-4 mx-auto"
                        >
                            <label for="name" class="text-lg text-blueGray-400">
                                Name
                            </label>
                            <input
                                id="name"
                                bind:value={name}
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                            />

                            <label
                                for="about"
                                class="text-lg text-blueGray-400"
                            >
                                About
                            </label>
                            <textarea
                                id="about"
                                bind:value={dev_about}
                                on:input={autoResizeTextarea}
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                            />

                            <label
                                for="lnurl"
                                class="text-lg text-blueGray-400"
                            >
                                LNUrl
                            </label>
                            <input
                                id="lud16"
                                bind:value={lud16}
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                            />

                            <div class="flex space-x-4">
                                <div>
                                    <label
                                        for="git_username"
                                        class="text-lg text-blueGray-400"
                                        >Github Username</label
                                    >
                                    <input
                                        id="git_username"
                                        bind:value={git_username}
                                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                                    />
                                </div>

                                <div>
                                    <label
                                        for="git_proof"
                                        class="text-lg text-blueGray-400"
                                        >Github Proof</label
                                    >
                                    <input
                                        id="git_proof"
                                        bind:value={git_proof}
                                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        class="mt-10 py-10 border-t border-blueGray-200 text-center"
                    >
                        <div class="flex flex-wrap justify-center">
                            <div class="w-full lg:w-9/12 px-4">
                                <div class="mt-6">
                                    <div class="mb-4">
                                        <label
                                            for="picture"
                                            class="text-lg text-blueGray-400"
                                        >
                                            Profile Picture URL
                                        </label>
                                        <input
                                            id="picture"
                                            bind:value={picture}
                                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            for="banner"
                                            class="text-lg text-blueGray-400"
                                        >
                                            Banner URL
                                        </label>
                                        <input
                                            id="banner"
                                            bind:value={banner}
                                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div
                                class="mt-10 py-10 border-t border-blueGray-200 text-center w-full"
                            >
                                <div class="flex flex-wrap justify-center">
                                    <div class="w-full lg:w-9/12 px-4">
                                        <div class="mt-6">
                                            <h2
                                                class="text-lg text-blueGray-400 mb-4"
                                            >
                                                Relays
                                            </h2>
                                            <div class="flex flex-col gap-2">
                                                {#each relays as relay}
                                                    <div
                                                        class="flex justify-between px-3 py-1 rounded-full bg-white-800 text-sm text-black shadow-md"
                                                    >
                                                        <div>
                                                            {relay}
                                                        </div>
                                                        <button
                                                            class="bg-red-500 w-5 h-5 rounded-full flex justify-center items-center"
                                                            on:click={() =>
                                                                deleteRelay(
                                                                    relay
                                                                )}
                                                        >
                                                            X
                                                            <!-- Sie können hier ein Kreuzsymbol verwenden, wenn Sie eines haben -->
                                                        </button>
                                                    </div>
                                                {/each}

                                                <div
                                                    class="flex justify-between items-center mt-4"
                                                >
                                                    <input
                                                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        bind:value={newRelay}
                                                        placeholder="Enter relay URL..."
                                                    />
                                                    <button
                                                        class="bg-orange-500 text-white font-bold py-2 px-4 rounded ml-2"
                                                        on:click={addRelay}
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="container mx-auto px-4 py-4 flex justify-end">
                    <button
                        class="bg-orange-500 text-white font-bold py-2 px-4 rounded"
                        on:click={updateProfile}
                    >
                        Update Profile
                    </button>
                </div>
            </div>
        </div>
        <Footer />
    </div>
</main>
