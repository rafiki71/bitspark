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
    let categoryStyle = "category-style";
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
                <button class={linkStyle} on:click={() => navigate("/")}
                    >BitSpark</button
                >
            </li>
            <li>
                <div
                    on:mouseover={handleMouseOver}
                    on:mouseout={handleMouseOut}
                    on:focus={handleFocus}
                    on:blur={handleBlur}
                >
                    <span class={linkStyle}>Categories</span>
                </div>
            </li>
            <hr class="divider-line" />
            <li>
                <button class={linkStyle} on:click={() => navigate("/postidea")}
                    >Spark Idea</button
                >
            </li>
            {#if $menuState.logged_in}
            <hr class="divider-line" />
            <li>
                <button
                    class={linkStyle}
                    on:click={() =>
                        navigate(`/profile/${nostrHelper.publicKey}`)}
                    >
                    <i class="fas fa-user" style="color: #223d6d;"></i> Profile
                </button>
            </li>
            
            <li>
                <button
                    class={linkStyle}
                    on:click={() =>
                        navigate(`/edit_profile/${nostrHelper.publicKey}`)}
                    >Edit Profile</button
                >
            </li>
        {/if}        
            <li>
                <hr class="divider-line" />
                {#if !$menuState.use_extension}
                    <button
                        class={linkStyle}
                        on:click={() => navigate("https://getalby.com/")}
                        >{optionText}</button
                    >
                {:else if $menuState.logged_in}
                    <button
                        class={linkStyle}
                        on:click={logout}
                        on:keydown={logout}>Logout</button
                    >
                {:else}
                    <button
                        class={linkStyle}
                        on:click={login}
                        on:keydown={login}>Login</button
                    >
                {/if}
            </li>
        </ul>
    </div>
</div>
<div
    class={showCategories ? "categories-wrapper" : "categories-wrapper hidden"}
    on:mouseover={handleMouseOver}
    on:mouseout={handleMouseOut}
    on:focus={handleFocus}
    on:blur={handleBlur}
>
    <div class="categories-outer">
        <div class="categories">
            {#each categories as category}
                <button
                    class={categoryStyle}
                    on:click={() => navigate(`/overview/${category}`)}
                    >{category}</button
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
        color: #EB6F1A;
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
        transition: opacity 0.3s, visibility 0.3s;
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
        width: 200px;
        min-width: 200px;
        z-index: 10; /* This will bring the menu to the front */
        flex-basis: 200px;
        background-color: rgba(255, 255, 255, 0.5);
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
