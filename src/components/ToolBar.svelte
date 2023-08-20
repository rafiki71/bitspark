<script>
    import { onMount } from "svelte";
    import ProfileImg from "../components/ProfileImg.svelte";
    import { helperStore } from "../helperStore.js";
    import { sendSatsLNurl } from "../LNHelper.js";

    export let lnAddress;
    export let pubkey;
    export let githubRepo;

    let creator_profile = null;

    onMount(async () => {
        console.log("On mount:", lnAddress);
    });

    // Reactive statement to watch for changes in lnAddress
    $: {
        console.log("lnAddress changed:", lnAddress);
    }

    // Reactive statement to fetch the profile when the pubkey changes
    $: if (pubkey) {
        async function fetchProfile() {
            try {
                creator_profile = await $helperStore.getProfile(pubkey);
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        }
        fetchProfile();
    }
</script>

<div
    style="position: fixed; top: 0; left: 0; width: 100%; background: transparent; z-index: 1000; padding: 10px 0;"
    class="flex justify-between items-center"
>
    <div class="text-3xl text-white flex items-center gap-6 px-4">
        <div class="content-overlay">
            <div class="content-icons">
                {#if lnAddress}
                    <button
                        on:click={() => sendSatsLNurl(lnAddress)}
                        class="support-button"
                    >
                        <img
                            src="../../img/lightning.png"
                            alt="Support via Bitcoin Lightning"
                        />
                    </button>
                {/if}
                {#if creator_profile && creator_profile.picture}
                    <ProfileImg
                        profile={creator_profile}
                        style={{ width: "40px", height: "40px" }}
                    />
                {/if}
                {#if githubRepo}
                    <a href={githubRepo} target="_blank">
                        <i class="fab fa-github text-white github-icon-size" />
                    </a>
                {/if}
            </div>
        </div>
    </div>
</div>
