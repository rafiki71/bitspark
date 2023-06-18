<!-- Menu.svelte -->
<script>
    import { onMount, onDestroy } from "svelte";
    import { slide } from "svelte/transition";
    import { Link, navigate } from "svelte-routing";
    import NostrHelper from "../NostrHelper.js";
    import { writable } from "svelte/store";
    import { helperStore } from "../helperStore.js"; // Import the store
    import { sidebarOpen } from "../helperStore.js";

    function toggleSidebar() {
        sidebarOpen.update((value) => !value);
    }

    const menuState = writable({ logged_in: false, use_extension: false });

    let optionText = "getAlby";
    let link = "https://www.getalby.com";
    let nostrHelper = null;

    let categories = [
        "Art & Design",
        "Bitcoin & P2P",
        "Comics & Graphic Novels",
        "Crafts & DIY",
        "Fashion & Beauty",
        "Film, Video & Animation",
        "Food & Beverages",
        "Games & Gaming",
        "Health & Fitness",
        "Journalism & News",
        "Music & Audio",
        "Photography & Visual Arts",
        "Publishing & Writing",
        "Technology & Software",
        "Education & Learning",
        "Environment & Sustainability",
        "Sports & Outdoors",
        "Travel & Tourism",
        "Non-Profit & Social Causes",
        "Business & Entrepreneurship",
        "Science & Research",
        "Home & Lifestyle",
        "Automotive & Transportation",
        "Pets & Animals",
        "Parenting & Family",
    ];
    let showCategories = false;

    let timeoutId;

    function handleMouseOver() {
        clearTimeout(timeoutId);
        showCategories = true;
    }

    function handleMouseOut() {
        timeoutId = setTimeout(() => {
            showCategories = false;
        }, 200); // 200ms delay before hiding categories
    }

    function handleFocus() {
        showCategories = true;
    }

    function handleBlur() {
        showCategories = false;
    }

    async function login() {
        // Warten Sie darauf, dass NostrHelper.create aufgelöst ist, bevor Sie fortfahren
        console.log("Logging in...");
        await NostrHelper.create(true);
        menuState.update((state) => ({ ...state, logged_in: true }));
    }

    async function logout() {
        console.log("Logging out...");
        await NostrHelper.create(false);
        menuState.update((state) => ({ ...state, logged_in: false }));
    }

    onMount(async () => {
        nostrHelper = await NostrHelper.create();
        const loggedIn = (await nostrHelper.publicKey) != null;
        const usingExtension = await nostrHelper.extensionAvailable();
        menuState.set({ logged_in: loggedIn, use_extension: usingExtension });
    });

    let linkStyle = "block menu-item";
    let loginStyle = "block menu-item";
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
                <div
                    on:mouseover={handleMouseOver}
                    on:mouseout={handleMouseOut}
                    on:focus={handleFocus}
                    on:blur={handleBlur}
                >
                    <span class={linkStyle}>Overview</span>
                </div>
            </li>
            <li>
                <button class={linkStyle} on:click={() => navigate("/postidea")}
                    >Spark Idea</button
                >
            </li>
            <li>
                {#if !$menuState.use_extension}
                    <a href={link} class={linkStyle} target="_blank"
                        >{optionText}</a
                    >
                {:else if $menuState.logged_in}
                    <button
                        class={loginStyle}
                        on:click={logout}
                        on:keydown={logout}>Logout</button
                    >
                {:else}
                    <button
                        class={loginStyle}
                        on:click={login}
                        on:keydown={login}>Login</button
                    >
                {/if}
            </li>
        </ul>
    </div>
</div>
<div class={showCategories ? "categories" : "categories hidden"}>
    {#each categories as category}
        <Link to={`/overview/${category}`}
            ><div class="category-item">
                {category}
            </div></Link
        >
    {/each}
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

    a.menu-item {
        font-size: 1rem;
        padding: 15px;
        cursor: pointer;
        transition: color 0.3s;
        display: block;
        text-decoration: none;
    }
    a.menu-item:hover {
        color: #007bff;
        text-decoration: none !important;
    }
    .menu-card {
        width: 200px;
        margin: 0 auto;
        /* border-radius: 20px; */
        padding: 20px;
        color: #000;
        /* background: #fff; */
        /* box-shadow: 0px 10px 30px -5px rgba(0, 0, 0, 0.3); */
        /* transition: box-shadow 0.5s; */
        position: relative;
        /* border-right: 1px solid #000; */
        padding-right: 40px;
        /* height: 100vh; */
    }

    .menu-item {
        font-size: 1rem; /* adjust this value as needed */
        padding: 15px;
        cursor: pointer;
        transition: color 0.3s;
        display: block;
        text-decoration: none;
        color: #d1d1d1;
        outline: none; /* Add this line */
    }

    .menu-item:hover {
        color: #60adff;
        text-decoration: none;
        outline: none; /* Add this line */
    }

    .categories {
        position: fixed; /* change this to fixed */
        /* top: 50px; adjust this as needed */
        left: 225px; /* adjust this as needed, should be the width of your side bar */
        background: #fff;
        width: 300px; /* Or whatever width you want the dropdown to be */
        max-height: calc(
            100vh - 50px
        ); /* adjust this as needed, subtract the top offset */
        overflow-y: auto; /* enable vertical scroll when the height exceeds max-height */
        padding: 10px 0;
        box-shadow: 0px 10px 30px -5px rgba(0, 0, 0, 0.3);
        border-radius: 20px; /* Update this line */
        transition: opacity 0.3s, visibility 0.3s;
        opacity: 1;
        visibility: visible;
        z-index: 50;
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
        background-color: #333333;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 10%;
        padding: 5px;
        margin: 10px;
    }

    svg path {
        fill: #d1d1d1; /* Change this to the color you want */
    }

    .menu-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 300px;
        min-width: 300px;
        z-index: 10; /* This will bring the menu to the front */
        flex-basis: 300px;
        background-color: #494949;
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
</style>
