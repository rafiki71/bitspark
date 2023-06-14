<!-- Menu.svelte -->
<script>
    import { onMount } from "svelte";
    import { Link, navigate } from "svelte-routing";
    import NostrHelper from "../NostrHelper.js";
    import { writable } from "svelte/store";

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
        console.log("nostrHelper:", nostrHelper);
        const loggedIn = (await nostrHelper.publicKey) != null;
        const usingExtension = await nostrHelper.extensionAvailable();
        menuState.set({ logged_in: loggedIn, use_extension: usingExtension });
    });

    let linkStyle = "menu-item";
    let loginStyle = "menu-item";

    $: {
        if (showCategories) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }
</script>

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
                <div
                    class={showCategories ? "categories" : "categories hidden"}
                >
                    {#each categories as category}
                        <Link to={`/overview/${category}`}
                            ><div class="category-item">{category}</div></Link
                        >
                    {/each}
                </div>
            </div>
        </li>
        <li>
            <Link to="/postidea" class={linkStyle}>Spark Idea</Link>
        </li>
        <li>
            {#if !$menuState.use_extension}
                <a href={link} class={linkStyle} target="_blank">{optionText}</a>
            {:else if $menuState.logged_in}
                <button class={loginStyle} on:click={logout} on:keydown={logout}>Logout</button>
            {:else}
                <button class={loginStyle} on:click={login} on:keydown={login}>Login</button>
            {/if}
        </li>
    </ul>
</div>

<style>
    a.menu-card {
        width: 200px;
        margin: 0 auto;
        border-radius: 20px;
        padding: 20px;
        color: #000;
        background: #fff;
        box-shadow: 0px 10px 30px -5px rgba(0, 0, 0, 0.3);
        transition: box-shadow 0.5s;
        position: relative;
    }

    a.menu-item {
        font-size: 1rem; /* adjust this value as needed */
        padding: 15px;
        cursor: pointer;
        transition: color 0.3s;
        display: block;
    }

    .menu-card {
        width: 200px;
        margin: 0 auto;
        border-radius: 20px;
        padding: 20px;
        color: #000;
        background: #fff;
        box-shadow: 0px 10px 30px -5px rgba(0, 0, 0, 0.3);
        transition: box-shadow 0.5s;
        position: relative;
    }

    .menu-item {
        font-size: 1rem; /* adjust this value as needed */
        padding: 15px;
        cursor: pointer;
        transition: color 0.3s;
        display: block;
    }

    .menu-item:hover {
        color: #007bff;
    }

    .categories {
        position: fixed; /* change this to fixed */
        top: 50px; /* adjust this as needed */
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
</style>
