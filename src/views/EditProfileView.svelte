<script>
    import { onMount } from "svelte";
    import { Link, navigate } from "svelte-routing";
    import { helperStore } from "../helperStore.js";
    import { get } from "svelte/store";
    import ProfileImg from "../components/ProfileImg.svelte";

    export let profile_id;

    let profile = null;
    let name = "";
    let dev_about = "";
    let picture = "";
    let banner = "";
    let git_username = "";
    let git_proof = "";

    onMount(async () => {
        try {
            const bitstarterHelper = get(helperStore);
            profile = await bitstarterHelper.getProfile(profile_id);

            if (profile) {
                name = profile.name;
                dev_about = profile.dev_about;
                picture = profile.picture;
                banner = profile.banner;

                // Get GitHub username and proof from profile
                git_username = profile.githubUsername || "";
                git_proof = profile.githubProof || "";
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    });

    const updateProfile = async () => {
        try {
            const bitstarterHelper = get(helperStore);
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
            console.log(updatedIdentities);
            await bitstarterHelper.updateProfile(
                name,
                picture,
                banner,
                dev_about,
                profile.lnurl,
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
</script>

<div>
    <main class="profile-page">
        <section class="relative block h-500-px">
            <div
                class="absolute top-0 w-full h-full bg-center bg-cover"
                style={`background-image: url(${banner});`}
            >
                <span
                    id="blackOverlay"
                    class="w-full h-full absolute opacity-50 bg-black"
                />
                <div
                    class="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full"
                >
                    <h1 class="text-4xl font-bold text-white">{name}</h1>
                </div>
            </div>
            <div
                class="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
                style="transform: translateZ(0);"
            >
                <svg
                    class="absolute bottom-0 overflow-hidden"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    version="1.1"
                    viewBox="0 0 2560 100"
                    x="0"
                    y="0"
                >
                    <polygon
                        class="text-blueGray-200 fill-current"
                        points="2560 0 2560 100 0 100"
                    />
                </svg>
            </div>
        </section>

        <section class="relative py-16 bg-blueGray-200">
            <div class="container mx-auto px-4">
                <div
                    class="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64"
                >
                    <div class="px-6">
                        <div class="flex flex-wrap justify-center">
                            <div
                                class="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center"
                            >
                                <div
                                    style="width: 200px; height: 200px; border-radius: 50%; overflow: hidden; position: relative; top: -100px;"
                                >
                                    {#if profile && profile.picture}
                                        <ProfileImg
                                            {profile}
                                            style="position: absolute; width: 100%; height: auto; top: 50%; left: 50%; transform: translate(-50%, -50%);"
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
                                    <label
                                        for="name"
                                        class="text-lg text-blueGray-400"
                                    >
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end mt-4 px-10">
                    <button
                        class="bg-red-500 text-white font-bold py-2 px-4 rounded mr-4"
                        on:click={() => navigate(`/overview`)}
                    >
                        Back
                    </button>
                    <button
                        class="bg-green-500 text-white font-bold py-2 px-4 rounded"
                        on:click={updateProfile}
                    >
                        Update Profile
                    </button>
                </div>
            </div>
        </section>
    </main>
</div>