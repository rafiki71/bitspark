<!-- Menu.svelte -->
<script>
    import { onMount, onDestroy } from "svelte";
    import { navigate } from "svelte-routing";
    import { writable } from "svelte/store";
    import { sidebarOpen, contentContainerClass } from "../../helperStore.js";
    import tutorials from "../../Tutorials.js";
    import "../../styles/global.css";
    import {
        nostrManager,
        initializeNostrManager,
    } from "../../backend/NostrManagerStore.js";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { idea_categories } from "../../constants/categories.js";

    function toggleSidebar() {
        sidebarOpen.update((value) => !value);
        console.log("Sidebar state:", $sidebarOpen);
        console.log("contentContainerClass state:", $contentContainerClass);
    }

    const menuState = writable({ logged_in: false, use_extension: false });

    let optionText = "getAlby";
    let link = "https://www.getalby.com";

    let tutorial_titles = tutorials.map((tutorial) => tutorial.title);

    let showCategories = false;
    let showTutorials = false;

    let timeoutId;

    function handleCatMouseOver() {
        clearTimeout(timeoutId);
        showCategories = true;
    }

    function handleTutMouseOver() {
        clearTimeout(timeoutId);
        showTutorials = true;
    }

    function handleCatMouseOut() {
        timeoutId = setTimeout(() => {
            showCategories = false;
        }, 200); // 200ms delay before hiding categories
    }

    function handleTutMouseOut() {
        timeoutId = setTimeout(() => {
            showTutorials = false;
        }, 200); // 200ms delay before hiding categories
    }

    function handleCatFocus() {
        showCategories = true;
    }

    function handleTutFocus() {
        showTutorials = true;
    }

    function handleCatBlur() {
        showCategories = false;
    }

    function handleTutBlur() {
        showTutorials = false;
    }

    async function login() {
        console.log("Logging in...");
        await initializeNostrManager(true, false);
        let login_success = $nostrManager.publicKey !== null;
        if (login_success) {
            $nostrManager.subscribeToEvents({
                kinds: [10002],
                authors: [$nostrManager.publicKey],
            });
            updateRelays();
        }
        menuState.update((state) => ({
            ...state,
            logged_in: login_success,
        }));
    }

    function updateRelays() {
        if ($nostrManager && $nostrManager.publicKey !== null) {
            let relayEvents = $nostrCache.getEventsByCriteria({
                kinds: [10002],
                authors: [$nostrManager.publicKey],
            });

            if (relayEvents.length > 0) {
                relayEvents.sort((a, b) => b.created_at - a.created_at);
                let relay = relayEvents[0];

                relay = relay.tags
                    .filter((tag) => tag[0] === "r")
                    .map((tag) => tag[1]);
                $nostrManager.updateRelays(relay);
            }
        }
    }

    async function logout() {
        console.log("Logging out...");
        await initializeNostrManager(false, false);
        menuState.update((state) => ({ ...state, logged_in: false }));
    }

    onMount(async () => {
        await initializeNostrManager(false, true);
        const loggedIn = $nostrManager.publicKey != null;
        console.log("Logged in:", loggedIn);
        const usingExtension = await $nostrManager.extensionAvailable();
        menuState.set({ logged_in: loggedIn, use_extension: usingExtension });
    });
    onDestroy(() => {
        $nostrManager.unsubscribeAll();
    });

    let linkStyle = "block menu-item";
    let categoryStyle = "category-style";

    function print_menu_state() {
        console.log($menuState);
    }

    $: $menuState;
    $: print_menu_state(), $menuState;
    $: $nostrCache, updateRelays();
</script>

<!-- <button on:click={toggleSidebar}>Toggle Sidebar</button> -->
<div class="button-container">
    <button on:click={toggleSidebar} class="toggle-button">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="currentColor"
            viewBox="0 2 16 14"
        >
            <path
                d="M1 3h14a1 1 0 0 1 0 2H1a1 1 0 1 1 0-2zm0 5h14a1 1 0 0 1 0 2H1a1 1 0 0 1 0-2zm0 5h14a1 1 0 0 1 0 2H1a1 1 0 0 1 0-2z"
            />
        </svg>
    </button>
</div>
<div class="menu-container" class:show={$sidebarOpen}>
    <div class="menu-card">
        <ul class="flex flex-col items-start">
            <li>
                <button class={linkStyle} on:click={() => navigate("/")}>
                    <i
                        class="fas fa-home"
                        style="color: #223d6d; margin-right: 10px;"
                    />
                    Home
                </button>
                <div
                    on:mouseover={handleCatMouseOver}
                    on:mouseout={handleCatMouseOut}
                    on:focus={handleCatFocus}
                    on:blur={handleCatBlur}
                >
                    <button class={linkStyle}>
                        <i
                            class="fas fa-list"
                            style="color: #223d6d; margin-right: 11px;"
                        /> Categories
                    </button>
                </div>
            </li>
            <hr class="divider-line" />
            <li>
                <button
                    class={linkStyle}
                    on:click={() => navigate("/postidea")}
                >
                    <i
                        class="fas fa-fire"
                        style="color: #223d6d; margin-right: 12px;"
                    /> Spark Idea
                </button>
            </li>
            <li>
                <button
                    class={linkStyle}
                    on:click={() => navigate("/jobmarket")}
                >
                    <i
                        class="fas fa-search"
                        style="color: #223d6d; margin-right: 10px;"
                    ></i>
                    Job Market
                </button>
            </li>
            {#if $menuState.logged_in}
                <hr class="divider-line" />
                <li>
                    <button
                        class={linkStyle}
                        on:click={() =>
                            navigate(`/profile/${$nostrManager.publicKey}`)}
                    >
                        <i
                            class="fas fa-user"
                            style="color: #223d6d; margin-right: 10px;"
                        /> Profile
                    </button>
                </li>

                <li>
                    <button
                        class={linkStyle}
                        on:click={() =>
                            navigate(
                                `/edit_profile/${$nostrManager.publicKey}`,
                            )}
                    >
                        <i
                            class="fas fa-cog"
                            style="color: #223d6d; margin-right: 10px;"
                        /> Edit Profile
                    </button>
                </li>
                <li>
                    <button
                        class={linkStyle}
                        on:click={() => navigate("/jobmanager")}
                    >
                        <i
                            class="fas fa-briefcase"
                            style="color: #223d6d; margin-right: 10px;"
                        ></i>
                        Job Manager
                    </button>
                </li>
            {/if}
            <li>
                <hr class="divider-line" />
                {#if !$menuState.use_extension}
                    <button
                        class={linkStyle}
                        on:click={() => navigate("https://getalby.com/")}
                    >
                        <i
                            class="fas fa-puzzle-piece"
                            style="color: #223d6d; margin-right: 10px;"
                        />
                        {optionText}
                    </button>
                {:else if $menuState.logged_in}
                    <button
                        class={linkStyle}
                        on:click={logout}
                        on:keydown={logout}
                    >
                        <i
                            class="fas fa-arrow-left"
                            style="color: #223d6d; margin-right: 10px;"
                        /> Logout
                    </button>
                {:else}
                    <button
                        class={linkStyle}
                        on:click={login}
                        on:keydown={login}
                    >
                        <i
                            class="fas fa-arrow-right"
                            style="color: #223d6d; margin-right: 10px;"
                        /> Login
                    </button>
                    <style>
                        /* Füge den rechten Rand zum Pfeilsymbol hinzu */
                        .arrow-right-border::after {
                            content: "";
                            display: block;
                            width: 10px; /* Passe die Breite des Randes an */
                            height: 24px; /* Passe die Höhe des Randes an */
                            background-color: #223d6d; /* Passe die Farbe des Randes an */
                            position: absolute;
                            right: -10px; /* Ändere den Abstand zum Pfeilsymbol */
                            top: 0;
                        }
                    </style>
                {/if}
            </li>
            <li>
                <hr class="divider-line" />
                <div
                    on:mouseover={handleTutMouseOver}
                    on:mouseout={handleTutMouseOut}
                    on:focus={handleTutFocus}
                    on:blur={handleTutBlur}
                >
                    <span class={linkStyle}>
                        <i
                            class="fas fa-graduation-cap"
                            style="color: #223d6d; margin-right: 8px;"
                        /> Tutorials
                    </span>
                </div>
            </li>
        </ul>
    </div>
</div>
<div
    class={showCategories ? "categories-wrapper" : "categories-wrapper hidden"}
    on:mouseover={handleCatMouseOver}
    on:mouseout={handleCatMouseOut}
    on:focus={handleCatFocus}
    on:blur={handleCatBlur}
>
    <div class="categories-outer">
        <div class="categories">
            {#each idea_categories as category}
                <button
                    class={categoryStyle}
                    on:click={() => navigate(`/overview/${category}`)}
                    >{category}</button
                >
            {/each}
        </div>
    </div>
</div>

<div
    class={showTutorials ? "categories-wrapper" : "categories-wrapper hidden"}
    on:mouseover={handleTutMouseOver}
    on:mouseout={handleTutMouseOut}
    on:focus={handleTutFocus}
    on:blur={handleTutBlur}
>
    <div class="categories-outer">
        <div class="categories">
            {#each tutorial_titles as tutorial, index}
                <button
                    class={categoryStyle}
                    on:click={() => navigate(`/tutorial/${index}`)}
                    >{tutorial}</button
                >
            {/each}
        </div>
    </div>
</div>

<style>
    /* a.menu-card {
        width: 200px;
        margin: 0 auto;
        border-radius: 20px;
        padding: 20px;
        color: #000;
        background: #fff;
        box-shadow: 0px 10px 30px -5px rgba(0, 0, 0, 0.3);
        transition: box-shadow 0.5s;
        position: relative;
    } */
    .toggle-button {
        display: flex;
        justify-content: center;
        align-items: center;
        /* other styles */
    }

    .menu-card {
        width: 200px;
        margin-top: 80px;
        /* border-radius: 20px; */
        /* padding: 20px; */
        color: #000;
        /* background: #fff; */
        /* box-shadow: 0px 10px 30px -5px rgba(0, 0, 0, 0.3); */
        /* transition: box-shadow 0.5s; */
        position: relative;
        /* border-right: 1px solid #000; */
        /* padding-right: 40px; */
        /* height: 100vh; */
    }

    .menu-item {
        color: #103f70;
        font-size: 1rem; /* adjust this value as needed */
        padding: 15px;
        padding-left: 30px;
        cursor: pointer;
        transition: color 0.3s;
        display: block;
        text-decoration: none;
        outline: none; /* Add this line */
        width: 200px;
        text-align: left;
    }

    .menu-item:hover {
        color: #eb6f1a;
        text-decoration: none;
        outline: none; /* Add this line */
    }

    .category-style {
        font-size: 1rem; /* adjust this value as needed */
        padding: 15px;
        padding-left: 15px;
        cursor: pointer;
        transition: color 0.3s;
        display: block;
        text-decoration: none;
        color: #494949;
        outline: none; /* Add this line */
        width: 200px;
        text-align: left;
    }

    .category-style:hover {
        color: #60adff;
        text-decoration: none;
        outline: none; /* Add this line */
    }

    .categories-wrapper {
        position: fixed;
        left: 180px;
        background: #d1d1d1;
        width: 310px; /* Adjust width to accommodate scrollbar */
        max-height: 100vh;
        height: 100vh; /* Add this property */
        padding: 10px 0;
        box-shadow: 0px 10px 30px -5px rgba(0, 0, 0, 0.3);
        border-radius: 20px;
        transition:
            opacity 0.3s,
            visibility 0.3s;
        opacity: 1;
        visibility: visible;
        z-index: 50;
        padding-top: 14px; /* Add padding to shorten scrollbar */
        padding-bottom: 14px; /* Add padding to shorten scrollbar */
    }

    .categories-wrapper.hidden {
        opacity: 0;
        visibility: hidden;
    }

    .categories-outer {
        width: 100%;
        max-height: 100%; /* Subtract double the padding */
        overflow-y: auto; /* Move this property here */
        border-radius: 20px; /* Add border radius here */
    }

    .categories {
        width: 100%;
    }

    .categories.hidden {
        opacity: 0;
        visibility: hidden;
    }

    .category-item {
        color: #000; /* change this to the desired color */
        padding: 10px 15px;
        cursor: pointer;
        transition: color 0.3s;
    }

    .category-item:hover {
        color: #007bff;
    }

    .hide {
        display: none;
    }

    .button-container {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 11; /* This will bring the button to the front */
        background-color: #33333300;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 10%;
        padding: 5px;
        margin: 10px;
    }

    svg path {
        fill: #f97316; /* Change this to the color you want */
    }

    .menu-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 200px;
        min-width: 200px;
        z-index: 10; /* This will bring the menu to the front */
        flex-basis: 200px;
        background-color: rgba(255, 255, 255, 0.7);
        opacity: 3.7;
        height: 100vh; /* This will limit the height to the height of the viewport */
        overflow-y: auto;
        transform: translateX(-100%); /* Hide the menu off screen */
        transition: transform 0.3s ease-in-out; /* Animate the transition */
    }

    .menu-container.show {
        transform: translateX(0); /* Show the menu */
    }

    button:focus {
        outline: none;
    }

    /* This will affect the scrollbar globally */
    ::-webkit-scrollbar {
        width: 10px; /* Adjust scrollbar width */
        height: 10px; /* Adjust scrollbar height */
    }

    ::-webkit-scrollbar-track {
        background: #f1f1f1; /* Color of the track */
        border-radius: 20px; /* Radius for the scroll thumb */
    }

    ::-webkit-scrollbar-thumb {
        background: #888; /* Color of the scroll thumb */
        border-radius: 20px; /* Radius for the scroll thumb */
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #555; /* Color of the scroll thumb on hover */
    }

    /* This will affect the scrollbar in the categories div only */
    .categories::-webkit-scrollbar {
        width: 10px; /* Adjust scrollbar width */
    }

    .categories::-webkit-scrollbar-track {
        background: #f1f1f1; /* Color of the track */
    }

    .categories::-webkit-scrollbar-thumb {
        background: #888; /* Color of the scroll thumb */
        border-radius: 20px; /* Radius for the scroll thumb */
    }

    .categories::-webkit-scrollbar-thumb:hover {
        background: #555; /* Color of the scroll thumb on hover */
    }

    .divider-line {
        margin-left: 12%;
        border-top: 1px solid #d1d1d1;
        padding: 1px;
        width: 76%;
    }
</style>
