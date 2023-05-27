<script>
    import { onMount } from "svelte";
    import { Link, navigate } from "svelte-routing";
    import { helperStore } from "../helperStore.js";
    import { get } from "svelte/store";
    import ProfileImg from "../components/ProfileImg.svelte";

    export let profile_id;

    let profile = null;
    let name = "";
    let about = "";
    let picture = "";
    let banner = "";

    let publicKey = "";

    onMount(async () => {
        try {
            const bitstarterHelper = get(helperStore);
            publicKey = bitstarterHelper.publicKey;
            console.log(profile_id);
            console.log(publicKey);
            profile = await bitstarterHelper.getProfile(profile_id);
            if (profile) {
                name = profile.name;
                about = profile.dev_about;
                picture = profile.picture;
                banner = profile.banner;
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    });
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
                    class="absolute left-0 top-1/2 transform -translate-y-1/2 text-white text-4xl font-bold p-5"
                >
                    {name}
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
                    {#if profile_id === publicKey}
                        <button
                            class="bg-blue-500 text-white font-bold py-2 px-4 rounded absolute"
                            style="top: 10px; right: 10px; z-index: 1;"
                            on:click={() =>
                                navigate(`/edit_profile/${publicKey}`)}
                        >
                            Edit
                        </button>
                    {/if}
                    <div class="px-6">
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
                                            style="position: absolute; width: 100%; height: auto; top: 50%; left: 50%; transform: translate(-50%, -50%);"
                                        />
                                    {/if}
                                </div>
                            </div>
                        </div>
                        <div
                            class="mt-10 py-10 border-t border-blueGray-200 text-center"
                        >
                            <div class="flex flex-wrap justify-center">
                                <div class="w-full lg:w-9/12 px-4">
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
                <div class="flex justify-end mt-0">
                    <button
                        class="bg-red-500 text-white font-bold py-2 px-4 rounded mr-4"
                        on:click={() => window.history.back()}
                    >
                        Back
                    </button>
                </div>
            </div>
        </section>
    </main>
</div>
