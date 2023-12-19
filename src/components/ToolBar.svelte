<script>
    import { onMount } from "svelte";
    import ProfileImg from "../components/ProfileImg.svelte";
    import { sendSatsLNurl } from "../LNHelper.js";
    import { nostrCache } from "../backend/NostrCacheStore.js";
    import { nostrManager } from "../backend/NostrManagerStore.js";

    export let lnAddress;
    export let pubkey;
    export let githubRepo;

    let creator_profile = null;
    let profile = null;

    // Reaktive Anweisung, die auf Änderungen im nostrManager und nostrCache hört
    $: $nostrManager, $nostrCache, fetchProfiles();

    async function fetchProfiles() {
        if ($nostrManager) {
            // Profile des Erstellers abrufen, wenn pubkey vorhanden ist
            if (pubkey) {
                fetchCreatorProfile();
            }
            // Eigenes Profil abrufen
            fetchOwnProfile();
        }
    }

    async function fetchCreatorProfile() {
        try {
            const creatorEvents = $nostrCache.getEventsByCriteria({
                kinds: [0],
                authors: [pubkey],
            });
            if (creatorEvents.length > 0) {
                creatorEvents.sort((a, b) => b.created_at - a.created_at);
                creator_profile = creatorEvents[0].profileData;
            }
        } catch (error) {
            console.error("Error fetching creator profile:", error);
        }
    }

    async function fetchOwnProfile() {
        try {
            const ownEvents = $nostrCache.getEventsByCriteria({
                kinds: [0],
                authors: [$nostrManager.publicKey],
            });
            if (ownEvents.length > 0) {
                ownEvents.sort((a, b) => b.created_at - a.created_at);
                profile = ownEvents[0].profileData;
            }
        } catch (error) {
            console.error("Error fetching own profile:", error);
        }
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
                    <a
                        href={githubRepo}
                        target="_blank"
                        style="line-height: 30px"
                    >
                        <i class="fab fa-github text-white github-icon-size" />
                    </a>
                {/if}
                {#if (lnAddress || (creator_profile && creator_profile.picture) || githubRepo) && profile && profile.picture}
                    <span
                        class="vertical-separator"
                        style="margin: 0px 0px; border-left: 2px solid white; height: 40px;"
                    ></span>
                {/if}
                {#if profile && profile.picture}
                    <ProfileImg
                        {profile}
                        style={{ width: "40px", height: "40px" }}
                    />
                {/if}
            </div>
        </div>
    </div>
</div>
