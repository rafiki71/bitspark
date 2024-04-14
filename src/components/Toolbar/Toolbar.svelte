<!-- ToolBar.svelte -->

<script>
    import { onMount } from "svelte";
    import ProfileImg from "../ProfileImg.svelte";
    import { sendSatsLNurl } from "../../LNHelper.js";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import { balance } from "../../BalanceStore.js";
    import { socialMediaManager } from "../../backend/SocialMediaManager.js";

    export let lnAddress;
    export let pubkey;
    export let githubRepo;

    let creator_profile = null;
    let profile = null;

    onMount(async () => {
        await getBalance();
    });

    function ensureHttpScheme(url) {
        if (!url) return url;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return "https://" + url;
        }
        return url;
    }

    $: formattedGithubRepo = ensureHttpScheme(githubRepo);

    // Reaktive Anweisung, die auf Änderungen im nostrManager und nostrCache hört
    $: $nostrManager, $nostrCache, fetchProfiles();
    $: $nostrManager, getBalance();

    async function getBalance() {
        if (
            $balance == -1 &&
            $nostrManager &&
            $nostrManager.publicKey &&
            $nostrManager.extensionAvailable()
        ) {
            await webln.enable();
            const result = await webln.getBalance();
            balance.set(result["balance"]);
        }
    }

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
            creator_profile = await socialMediaManager.getProfile(pubkey);
        } catch (error) {
            console.error("Error fetching creator profile:", error);
        }
    }

    async function fetchOwnProfile() {
        if (!$nostrManager.publicKey) {
            return;
        }

        try {
            profile = await socialMediaManager.getProfile(
                $nostrManager.publicKey,
            );
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
                        href={formattedGithubRepo}
                        target="_blank"
                        style="line-height: 30px"
                    >
                        <i class="fab fa-github text-white github-icon-size"
                        ></i>
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
                <div class="balance-display flex items-center">
                    {#if $balance == -1}
                        0
                    {:else}
                        {$balance}
                    {/if}
                    <img
                        src="../../img/sat.svg"
                        alt="Sat Symbol"
                        class="sat-symbol"
                    />
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .balance-display {
        font-size: 2rem; /* Kleinere Schriftgröße */
        margin-right: 20px; /* Abstand zur nächsten Komponente */
        color: white; /* Schriftfarbe */
    }

    .sat-symbol {
        height: 40px; /* Größenanpassung des Symbols */
        margin-left: 5px; /* Abstand zwischen Text und Symbol */
    }

    /* Weitere Stile... */
</style>
