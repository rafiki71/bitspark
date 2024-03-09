<script>
    import { onMount, onDestroy } from "svelte";
    import ProfileImg from "../components/ProfileImg.svelte";
    import Footer from "../components/Footers/FooterBS.svelte";
    import Menu from "../components/Menu.svelte";
    import { sidebarOpen } from "../helperStore.js";
    import Banner from "../components/Banner.svelte";
    import { nostrCache } from "../backend/NostrCacheStore.js";
    import { nostrManager } from "../backend/NostrManagerStore.js";
    import ToolBar from "../components/ToolBar.svelte";
    import RelaySelectionWidget from "../components/RelaySelectionWidget.svelte";

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

    function handleRelayUpdate(event) {
        relays = event.detail.relays;
    }

    onMount(() => {
        if ($nostrManager) {
            initialize();
        }
    });

    $: $nostrManager, initialize();

    function initialize() {
        if ($nostrManager) {
            $nostrManager.subscribeToEvents({
                kinds: [0, 10002],
                authors: [profile_id],
            });
            fetchProfile();
        }
    }

    onDestroy(() => {
        $nostrManager.unsubscribeAll();
    });

    async function fetchProfile() {
        const profileEvents = await $nostrCache.getEventsByCriteria({
            kinds: [0],
            authors: [profile_id],
        });

        if (profileEvents && profileEvents.length > 0) {
            profileEvents.sort((a, b) => b.created_at - a.created_at);
            profile = profileEvents[0].profileData;

            name = profile.name;
            dev_about = profile.dev_about;
            picture = profile.picture;
            banner = profile.banner;
            lud16 = profile.lud16;
            git_username = profile.githubUsername;
            git_proof = profile.githubProof;
        }
        relays = await fetchRelays();
        console.log("existingRelays:", relays);
    }

    async function updateProfile() {
        if (!$nostrManager || !$nostrManager.write_mode) return;
        $nostrManager.updateRelays(relays);

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
        updateRelays();
    }

    function areSetsEqual(set1, set2) {
        if (set1.size !== set2.size) return false;
        for (let item of set1) {
            if (!set2.has(item)) return false;
        }
        return true;
    }

    async function updateRelays() {
        if (!$nostrManager || !$nostrManager.write_mode) return;

        // Holen Sie die aktuellen Relays aus dem Cache
        const existingRelays = await fetchRelays();
        console.log("existingRelays:", existingRelays);

        const existingRelaysSet = new Set(existingRelays);
        const relaysSet = new Set(relays);
        // Relay zum Array hinzufügen
        const updatedRelays = relays;
        console.log("updatedRelays:", updatedRelays);
        // Überprüfen, ob das Relay bereits existiert
        if (areSetsEqual(existingRelaysSet, relaysSet)) return;

        // Event für die Aktualisierung der Relay-Liste erstellen
        const relayEvent = createRelayEvent(updatedRelays);
        console.log("relayEvent:", relayEvent);

        // Event senden
        try {
            await $nostrManager.sendEvent(
                relayEvent.kind,
                relayEvent.content,
                relayEvent.tags,
            );
            console.log("Relay added successfully");
        } catch (error) {
            console.error("Error adding relay:", error);
        }
    }

    // Hilfsfunktion zum Erstellen eines Relay-Events
    function createRelayEvent(relays) {
        const content = ""; // Leerer Inhalt für Relay-Liste
        const tags = relays.map((relay) => ["r", relay]);

        return {
            kind: 10002, // Kind für Relay-Liste
            content,
            tags,
        };
    }

    // Hilfsfunktion zum Abrufen der aktuellen Relay-Liste aus dem Cache
    async function fetchRelays() {
        const relayEvents = await $nostrCache.getEventsByCriteria({
            kinds: [10002],
            authors: [$nostrManager.publicKey],
        });

        return relayEvents.flatMap((event) =>
            event.tags.filter((tag) => tag[0] === "r").map((tag) => tag[1]),
        );
    }

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

        <ToolBar bind:lud16 githubRepo="" />

        <div class={contentContainerClass}>
            <div class="single-card container">
                <div class="flex justify-center">
                    <div class="single-card-profile-img">
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
                <div
                    class="text-center mt-6 px-6 text-color-df"
                    style="top: -90px; position: relative"
                >
                    <h2 class="base-h2 text-color-df">Edit Profile</h2>
                    <div class="single-card-content text-color-df">
                        <h5 class="base-h5 text-color-df">Name</h5>
                        <input
                            type="text"
                            class="input-style"
                            bind:value={name}
                        />
                        <h5 class="base-h5 text-color-df">About</h5>
                        <input
                            type="text"
                            class="input-style"
                            bind:value={dev_about}
                        />

                        <div class="flex space-x-4">
                            <div style="width: 50%;">
                                <h5 class="base-h5 text-color-df">
                                    Github Username
                                </h5>
                                <input
                                    type="text"
                                    class="input-style"
                                    bind:value={git_username}
                                />
                            </div>

                            <div style="width: 50%;">
                                <h5 class="base-h5 text-color-df">
                                    Github Proof
                                </h5>
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
                        <h5 class="base-h5 text-color-df">
                            Profile Picture URL
                        </h5>
                        <input
                            type="text"
                            class="input-style"
                            bind:value={picture}
                        />
                        <h5 class="base-h5 text-color-df">Banner URL</h5>
                        <input
                            type="text"
                            class="input-style"
                            bind:value={banner}
                        />
                        <hr
                            class="text-blueGray-600"
                            style="width: 90%; margin: auto; margin-top: 30pt"
                        />

                        <RelaySelectionWidget
                            {relays}
                            on:updateRelays={handleRelayUpdate}
                        />
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
    </div>
    <Footer />
</main>
