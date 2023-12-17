<script>
    import { navigate } from "svelte-routing";
    import { onMount } from "svelte";
    import Menu from "../components/Menu.svelte";
    import { previewStore } from "../previewStore.js";
    import Footer from "../components/Footers/FooterBS.svelte";
    import { sidebarOpen } from "../helperStore.js";
    import Banner from "../components/Banner.svelte";
    import SelectionModal from "../components/Modals/SelectionModal.svelte";
    import Modal, { bind } from "svelte-simple-modal";
    import { filterStore } from "../filterStore.js";
    import { nostrManager } from "../backend/NostrManagerStore.js";

    function navigateTo(route) {
        navigate(route);
    }

    function openCategoryModal() {
        // Pass the current selected categories to the modal
        filterStore.set(
            bind(SelectionModal, {
                categories: categories,
                initialSelectedCategories: $previewStore.categories,
                onConfirm: handleCategoryConfirm,
            }),
        );
    }

    function handleCategoryConfirm(selectedCategories) {
        $previewStore.categories = selectedCategories;
    }

    onMount(async () => {});
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

    function autoResizeTextarea(e) {
        e.target.style.height = "";
        e.target.style.height = e.target.scrollHeight + "px";
    }

    async function postIdea() {
        if (
            $previewStore.name &&
            $previewStore.subtitle &&
            $previewStore.abstract &&
            $previewStore.message &&
            $previewStore.bannerUrl &&
            $previewStore.githubRepo &&
            $previewStore.lightningAddress &&
            $previewStore.categories
        ) {
            let tags = [
                ["iName", $previewStore.name],
                ["iSub", $previewStore.subtitle],
                ["ibUrl", $previewStore.bannerUrl],
                ["gitrepo", $previewStore.githubRepo],
                ["lnadress", $previewStore.lightningAddress],
                ["abstract", $previewStore.abstract],
            ];
            $previewStore.categories.forEach((category) => {
                tags.push(["c", category]);
            });

            // Senden des Events über nostrManager
            if ($nostrManager && $nostrManager.write_mode) {
                await $nostrManager.sendEvent(
                    1339,
                    $previewStore.message,
                    tags,
                );
            }

            // Zurücksetzen der previewStore Werte
            $previewStore.name = "";
            $previewStore.subtitle = "";
            $previewStore.abstract = "";
            $previewStore.message = "";
            $previewStore.bannerUrl = "";
            $previewStore.githubRepo = "";
            $previewStore.lightningAddress = "";
            $previewStore.categories = [];
            navigate("/overview");
        } else {
            console.log("Please fill all fields.");
        }
    }

    let contentContainerClass = "combined-content-container";

    $: {
        if ($sidebarOpen) {
            contentContainerClass = "combined-content-container sidebar-open";
        } else {
            contentContainerClass = "combined-content-container";
        }
    }

    let bannerImage = "../../img/Banner1u.png";
    let title = "BitSpark";
    let subtitle = "Spark idea";

    function removeCategory(category) {
        let selectedCategories = $previewStore.categories.filter(
            (item) => item !== category,
        );
        $previewStore.categories = selectedCategories;
    }
</script>

<main class="overview-page">
    <Menu />
    <div class="flex-grow">
        <Banner {bannerImage} {title} {subtitle} show_right_text={true} />
        <div class={contentContainerClass}>
            <div class="single-card container">
                <div class="text-center mt-6 px-6">
                    <h2 class="base-h2 text-color-df">Spark Idea</h2>
                    <div class="single-card-content text-color-df">
                        <h5 class="base-h5 text-color-df">Idea Title</h5>
                        <input
                            type="text"
                            class="input-style"
                            bind:value={$previewStore.name}
                        />
                        <h5 class="base-h5 text-color-df">Idea Subtitle</h5>
                        <input
                            type="text"
                            class="input-style"
                            bind:value={$previewStore.subtitle}
                        />
                        <h5 class="base-h5 text-color-df">Abstract</h5>
                        <textarea
                            rows="1"
                            class="input-style input-style-resize"
                            on:input={autoResizeTextarea}
                            bind:value={$previewStore.abstract}
                        />
                        <h5 class="base-h5 text-color-df">Description</h5>
                        <textarea
                            rows="1"
                            class="input-style input-style-resize"
                            on:input={autoResizeTextarea}
                            bind:value={$previewStore.message}
                        />
                        <h5 class="base-h5 text-color-df">Banner URL</h5>
                        <input
                            type="text"
                            class="input-style"
                            bind:value={$previewStore.bannerUrl}
                        />
                        <h5 class="base-h5 text-color-df">GitHub Repository</h5>
                        <input
                            type="text"
                            class="input-style"
                            bind:value={$previewStore.githubRepo}
                        />
                        <h5 class="base-h5 text-color-df">Lightning Address</h5>
                        <input
                            type="text"
                            class="input-style"
                            bind:value={$previewStore.lightningAddress}
                        />

                        <h5 class="base-h5 text-color-df">Categories</h5>

                        <div class="category-container">
                            <Modal show={$filterStore}>
                                <button
                                    class="font-bold py-1 plus-button"
                                    on:click={openCategoryModal}>+</button
                                >
                            </Modal>
                            {#each $previewStore.categories as category}
                                <button
                                    class="category-button"
                                    on:click={() => removeCategory(category)}
                                >
                                    {category}
                                </button>
                            {/each}
                        </div>
                    </div>
                </div>
                <div class="container mx-auto px-4 py-4 flex justify-end">
                    <button
                        class="bs-blue text-white font-bold py-2 px-4 block rounded border ml-4 mt-2 hover:shadow-xl"
                        on:click={() => navigateTo("/preview")}
                    >
                        Preview
                    </button>
                    <button
                        class="bs-orange active:bg-orange-600 text-white font-bold py-2 px-4 block rounded border ml-4 mt-2 hover:shadow-xl"
                        on:click={postIdea}
                    >
                        Spark Idea
                    </button>
                </div>
            </div>
        </div>
        <Footer />
    </div>
</main>

<style>
    .category-container {
        display: flex; /* Use flexbox to layout buttons */
        flex-wrap: wrap; /* Allow the items to wrap as needed */
        gap: 8px; /* Adjust the gap between buttons as needed */
    }
    .category-button {
        /* Remove the flex-grow property if you don't want the buttons to grow */
        padding: 4px 8px; /* Adjust padding to fit the text */
        background-color: rgb(238, 238, 238);
        border: none; /* Remove border if you don't need it */
        cursor: pointer; /* Makes it clear the element is clickable */
        white-space: nowrap; /* Prevent text inside the button from wrapping */
        /* You can remove min-width if you want the button to only be as wide as its content plus padding */
        /* min-width: 120px; */
        margin: 2px; /* Provide some space around the buttons */
        border-radius: 4px; /* If you want rounded corners */
        /* Add text alignment and other styles as needed */
        text-align: center;
        font-size: 1rem; /* Adjust font size as needed */
    }

    .category-button:hover {
        background-color: #223d6d;
        position: relative;
        color: #adadad;
    }

    .plus-button {
        /* Remove the flex-grow property if you don't want the buttons to grow */
        padding: 4px 8px; /* Adjust padding to fit the text */
        background-color: rgb(238, 238, 238);
        border: none; /* Remove border if you don't need it */
        cursor: pointer; /* Makes it clear the element is clickable */
        white-space: nowrap; /* Prevent text inside the button from wrapping */
        /* You can remove min-width if you want the button to only be as wide as its content plus padding */
        /* min-width: 120px; */
        margin: 2px; /* Provide some space around the buttons */
        border-radius: 4px; /* If you want rounded corners */
        /* Add text alignment and other styles as needed */
        text-align: center;
        font-size: 1rem; /* Adjust font size as needed */
    }

    .plus-button:hover {
        background-color: rgb(249 115 22);
        position: relative;
        color: #fff;
    }

    .category-button:hover::after {
        content: "×"; /* Unicode multiplication sign as 'x' */
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%); /* Center the 'x' */
        color: #fff; /* Color of the 'x', choose what stands out */
        font-size: 1.5rem; /* Size of the 'x', adjust as needed */
        pointer-events: none; /* Prevents the 'x' from interfering with button clicks */
    }

    .category-button:focus {
        outline: none;
    }
</style>
