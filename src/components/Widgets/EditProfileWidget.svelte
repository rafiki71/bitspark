<script>
    import { onMount } from "svelte";
    import ProfileViewImage from "../ProfileViewImage.svelte";
    import RelaySelectionWidget from "./RelaySelectionWidget.svelte";
    import { nostrManager } from "../../backend/NostrManagerStore.js";

    export let profile = null;
    let name = "";
    let dev_about = "";
    let lud16 = "";
    let picture = "";
    let banner = "";
    let git_username = "";
    let git_proof = "";

    onMount(() => {
        initialize();
    });

    function initialize() {
        if (!profile) {
            return;
        }
        name = profile.name;
        dev_about = profile.dev_about;
        picture = profile.picture;
        banner = profile.banner;
        lud16 = profile.lud16;
        git_username = profile.githubUsername;
        git_proof = profile.githubProof;
    }

    $: profile, initialize();

    async function updateProfile() {
        if (!$nostrManager || !$nostrManager.write_mode) return;

        const profileEvent = {
            kind: 0,
            content: JSON.stringify({
                name,
                picture,
                banner,
                dev_about,
                lud16,
            }),
            tags: [["i", `github:${git_username}`, git_proof]],
        };

        try {
            await $nostrManager.sendEvent(
                profileEvent.kind,
                profileEvent.content,
                profileEvent.tags,
            );
            console.log("Profile updated successfully");
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    }
</script>

<div class="single-card container">
    <ProfileViewImage {profile} />
    <div
        class="text-center mt-6 px-6 text-color-df"
        style="top: -90px; position: relative"
    >
        <h2 class="base-h2 text-color-df">Edit Profile</h2>
        <div
            class="single-card-content text-color-df"
            style="margin-bottom: 0;"
        >
            <h5 class="base-h5 text-color-df">Name</h5>
            <input type="text" class="input-style" bind:value={name} />
            <h5 class="base-h5 text-color-df">About</h5>
            <input type="text" class="input-style" bind:value={dev_about} />
            <h5 class="base-h5 text-color-df">Lightning Address</h5>
            <input type="text" class="input-style" bind:value={lud16} />

            <div class="flex space-x-4">
                <div style="width: 50%;">
                    <h5 class="base-h5 text-color-df">Github Username</h5>
                    <input
                        type="text"
                        class="input-style"
                        bind:value={git_username}
                    />
                </div>

                <div style="width: 50%;">
                    <h5 class="base-h5 text-color-df">Github Proof</h5>
                    <input
                        type="text"
                        class="input-style"
                        bind:value={git_proof}
                    />
                </div>
            </div>
            <hr
                class="text-blueGray-600"
                style="width: 90%; margin: auto; margin-top: 30pt"
            />
            <h5 class="base-h5 text-color-df">Profile Picture URL</h5>
            <input type="text" class="input-style" bind:value={picture} />
            <h5 class="base-h5 text-color-df">Banner URL</h5>
            <input type="text" class="input-style" bind:value={banner} />
            <hr
                class="text-blueGray-600"
                style="width: 90%; margin: auto; margin-top: 30pt"
            />

            <RelaySelectionWidget />
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
