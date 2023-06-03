<!-- Menu.svelte -->
<script>
    import { onMount } from "svelte";
    import { Link, navigate } from "svelte-routing";
    import NostrHelper from "../NostrHelper.js";
    export let menuState = { logged_in: false, use_extension: false };

    let optionText = "getAlby";
    let link = "https://www.getalby.com";

    const categories = ["Category 1", "Category 2", "Category 3"];
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
    }

    async function logout() {
        console.log("Logging out...");
        await NostrHelper.create(false);

    }
</script>

<div class="menu-card">
    <ul>
        <li>
            <div
                on:mouseover={handleMouseOver}
                on:mouseout={handleMouseOut}
                on:focus={handleFocus}
                on:blur={handleBlur}
            >
                <span class="menu-item">Overview</span>
            </div>
            <div
                class={showCategories ? "categories" : "categories hidden"}
                on:mouseover={handleMouseOver}
                on:mouseout={handleMouseOut}
                on:focus={handleFocus}
                on:blur={handleBlur}
            >
                {#each categories as category}
                    <Link to={`/overview/${category}`}
                        ><div class="category-item">{category}</div></Link
                    >
                {/each}
            </div>
        </li>
        <li>
            {#if !menuState.use_extension}
                <a href={link} class="menu-item" target="_blank">{optionText}</a
                >
            {:else if menuState.logged_in}
                <button class="menu-item" on:click={logout} on:keydown={logout}
                    >Logout</button
                >
            {:else}
                <button class="menu-item" on:click={login} on:keydown={login}
                    >Login</button
                >
            {/if}
        </li>
    </ul>
</div>

<style>
    a.menu-item {
        color: #000; /* change this to the desired color */
        text-decoration: none; /* remove underline */
    }

    a.menu-item:hover {
        color: #007bff; /* change this to the color you want when hovered */
    }

    .menu-card {
        width: 200px;
        border-radius: 20px;
        padding: 20px;
        color: #000;
        background: #fff;
        box-shadow: 0px 10px 30px -5px rgba(0, 0, 0, 0.3);
        transition: box-shadow 0.5s;
        position: relative;
    }

    .menu-card:hover {
        box-shadow: 0px 30px 100px -10px rgba(0, 0, 0, 0.4);
    }

    .menu-item {
        font-size: 1rem; /* adjust this value as needed */
        padding: 15px;
        cursor: pointer;
        transition: color 0.3s;
    }

    .menu-item:hover {
        color: #007bff;
    }

    .categories {
        position: absolute;
        top: 0;
        left: 100%;
        background: #fff;
        width: 150px; /* Or whatever width you want the dropdown to be */
        padding: 10px 0;
        box-shadow: 0px 10px 30px -5px rgba(0, 0, 0, 0.3);
        border-radius: 20px; /* Update this line */
        transition: opacity 0.3s, visibility 0.3s;
        opacity: 1;
        visibility: visible;
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
