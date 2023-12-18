<script>
    import { onMount, onDestroy } from "svelte";
    import { Link, navigate } from "svelte-routing";
    import ProfileImg from "../components/ProfileImg.svelte";
    import Footer from "../components/Footers/FooterBS.svelte";
    import Menu from "../components/Menu.svelte";
    import { sidebarOpen } from "../helperStore.js";
    import Banner from "../components/Banner.svelte";
    import { nostrCache } from "../backend/NostrCacheStore.js";
    import { nostrManager } from "../backend/NostrManagerStore.js";

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

    onMount(() => {
        if ($nostrManager) {
            initialize();
        }
    });

    $: $nostrManager, initialize();

    function initialize() {
        if ($nostrManager) {
            // Subscriben für das Profil und Relays
            $nostrManager.subscribeToEvents({
                kinds: [0],
                authors: [profile_id],
                "#s": ["bitspark"],
            });
            $nostrManager.subscribeToEvents({
                kinds: [10002],
                authors: [$nostrManager.publicKey],
            });

            // Profil und Relays abrufen
            fetchProfile();
            fetchRelays();
        }
    }

    onDestroy(() => {
        $nostrManager.unsubscribeAll();
    });

    async function fetchProfile() {
        const profileEvents = await $nostrCache.getEventsByCriteria({
            kinds: [0],
            authors: [profile_id],
            tags: {
                s: ["bitspark"],
            },
        });

        if (profileEvents && profileEvents.length > 0) {
            profileEvents.sort((a, b) => b.created_at - a.created_at);
            const profileContent = JSON.parse(profileEvents[0].content);
            profile = {
                ...profileEvents[0],
                ...profileContent,
            };

            // Setzen der Profilwerte
            name = profile.name;
            dev_about = profile.dev_about;
            picture = profile.picture;
            banner = profile.banner;
            lud16 = profileContent.lud16; // Achten Sie darauf, lud16 direkt aus profileContent zu beziehen

            // Extrahieren der GitHub-Informationen aus den Tags
            const githubTag = profileEvents[0].tags.find(
                (tag) => tag[0] === "i" && tag[1].startsWith("github:"),
            );
            if (githubTag) {
                const githubParts = githubTag[1].split(":");
                git_username = githubParts[1];
                git_proof = githubTag[2];
            }
        }
    }

    // Funktion zum Erstellen eines Profil-Events
    function createProfileEvent(
        name,
        picture,
        banner,
        dev_about,
        lud16,
        identities,
    ) {
        const content = JSON.stringify({
            name,
            picture,
            banner,
            dev_about,
            lud16,
        });

        const tags = identities.map((identity) => [
            "i",
            `${identity.platform}:${identity.identity}`,
            identity.proof,
        ]);

        return {
            kind: 0, // Profil-Kind
            content,
            tags,
        };
    }

    // Funktion zum Aktualisieren des Profils
    async function updateProfile() {
        if (!$nostrManager || !$nostrManager.write_mode) return;

        // Verwenden Sie die Variablen direkt in der Funktion
        const profileEvent = createProfileEvent(
            name,
            picture,
            banner,
            dev_about,
            lud16,
            [{ platform: "github", identity: git_username, proof: git_proof }],
        );
        try {
            console.log(profileEvent);
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

    function autoResizeTextarea(e) {
        e.target.style.height = "";
        e.target.style.height = e.target.scrollHeight + "px";
    }

    // Funktion zum Löschen eines Relays
    async function deleteRelay(relayUrl) {
        if (!$nostrManager || !$nostrManager.write_mode) return;

        // Holen Sie die aktuellen Relays aus dem Cache
        const existingRelays = await fetchRelays();

        // Relay aus dem Array entfernen
        const updatedRelays = existingRelays.filter(
            (relay) => relay !== relayUrl,
        );

        // Event für die Aktualisierung der Relay-Liste erstellen
        const relayEvent = createRelayEvent(updatedRelays);

        // Event senden
        try {
            await $nostrManager.sendEvent(
                relayEvent.kind,
                relayEvent.content,
                relayEvent.tags,
            );
            console.log("Relay deleted successfully");
        } catch (error) {
            console.error("Error deleting relay:", error);
        }
    }

    // Funktion zum Hinzufügen eines Relays
    async function addRelay() {
        if (!$nostrManager || !$nostrManager.write_mode) return;

        // Holen Sie die aktuellen Relays aus dem Cache
        const existingRelays = await fetchRelays();
        console.log("existingRelays:", existingRelays);
        
        // Überprüfen, ob das Relay bereits existiert
        if (existingRelays.includes(newRelay)) return;
        
        // Relay zum Array hinzufügen
        const updatedRelays = [...existingRelays, newRelay];
        console.log("updatedRelays:", updatedRelays);
        
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
                                                                    relay,
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
