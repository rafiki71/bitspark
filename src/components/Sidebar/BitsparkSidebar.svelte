<script>
    import { Link, navigate } from "svelte-routing";
    import { onMount } from "svelte";
    import { helperStore } from "../../helperStore.js";
    import { get } from "svelte/store";
    import { checkSession } from "../../NostrHandler.js";
    import NostrHelper from "../../NostrHelper.js";

    let nostrHelper;
    let extensionAvailable = false;
    let write_mode;
    let publicKey;

    onMount(async () => {
        try {
            await checkSession();
            nostrHelper = get(helperStore);
            extensionAvailable = await nostrHelper.extensionAvailable();
            write_mode = nostrHelper.write_mode;
            publicKey = nostrHelper.publicKey;
        } catch (error) {
            console.error("Error fetching nostrHelper:", error);
        }
    });
    $: nostrHelper, extensionAvailable, publicKey, write_mode;
    const logOut = async () => {
        nostrHelper = await NostrHelper.create(false);
        helperStore.set(nostrHelper);
        navigate("/");
    };
</script>

<aside class="sidebar-container">
    <div class="px-4">
        <div class="mb-4">
            <Link to="/" class="block py-4 text-lg custom-link">
                Bitstarter
            </Link>
            <hr class="border-t border-blueGray-400 my-4" />
        </div>

        <div class="mb-4">
            <Link to="/postidea" class="block py-2 text-lg custom-link">
                Create Idea
            </Link>
        </div>

        {#if nostrHelper && write_mode}
            <div class="mb-4">
                <Link
                    to={`/profile/${publicKey}`}
                    class="block py-2 text-lg custom-link"
                >
                    Profile
                </Link>
                <Link
                    to={`/edit_profile/${publicKey}`}
                    class="block py-2 text-lg custom-link"
                >
                    Edit Profile
                </Link>
                <button
                    class="block py-2 text-lg custom-link"
                    on:click={logOut}
                >
                    Log Out
                </button>
            </div>
        {:else if nostrHelper && extensionAvailable}
            <Link to="/login" class="block py-2 text-lg custom-link">
                Log In
            </Link>
        {:else}
            <Link
                to="https://getalby.com/"
                class="block py-2 text-lg custom-link"
            >
                Get Alby!
            </Link>
        {/if}
    </div>
    <div class="px-4">
        <div class="mb-4">
            <button
                class="block py-2 text-lg custom-link"
                on:click={() => window.scrollTo(0, 0)}>Scroll to top</button
            >
        </div>
    </div>
    <style>
        .sidebar-container {
            width: 250px;
            background-color: #1a202c;
            overflow-y: auto;
            position: sticky;
            top: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .sidebar-content {
            padding: 2rem 1rem; /* You can adjust this value to increase the space above the Bitstarter text */
        }
        .custom-link {
            text-decoration: none;
            color: #cbd5e0; /* blueGray-800 */
            padding: 1rem; /* You can adjust this value to control the padding around the link text */
            display: block;
        }
        .custom-link:hover {
            color: #667eea; /* indigo-500 */
            text-decoration: none;
        }
        /* .scroll-top-button {
            align-self: flex-end;
        } */
        .custom-link:focus,
        button:focus {
            outline: none;
        }
    </style>
</aside>
