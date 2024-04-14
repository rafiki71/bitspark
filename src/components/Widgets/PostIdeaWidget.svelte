<script>
    import { navigate } from "svelte-routing";
    import { onDestroy } from "svelte";
    import { previewStore } from "../../previewStore.js";
    import Modal, { bind } from "svelte-simple-modal";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import SelectionModal from "../Modals/SelectionModal.svelte";
    import { writable } from "svelte/store";
    import { NOSTR_KIND_IDEA } from "../../constants/nostrKinds";

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

    let categoryModal = writable(null);
    function openCategoryModal() {
        categoryModal.set(
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
    onDestroy(() => {
        categoryModal.set(false);
    });

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
                ["s", "bitspark"],
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
                    NOSTR_KIND_IDEA,
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
            navigate("/");
        } else {
            console.log("Please fill all fields.");
        }
    }

    function removeCategory(category) {
        let selectedCategories = $previewStore.categories.filter(
            (item) => item !== category,
        );
        $previewStore.categories = selectedCategories;
    }
</script>

<div class="single-card container">
    <div class="text-center mt-6 px-6">
        <h2 class="base-h2 text-color-df">Spark Idea</h2>
        <div class="single-card-content text-color-df">
            <h5 class="base-h5 text-color-df">Idea Title</h5>
            <div>
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
            </div>
            <hr
                class="text-blueGray-600"
                style="width: 90%; margin: auto; margin-top: 30pt"
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
                <Modal show={$categoryModal}>
                    <button
                        class="font-bold py-1 add-button"
                        on:click={openCategoryModal}>+</button
                    >
                </Modal>
                {#each $previewStore.categories as category}
                    <button
                        class="bs-blue remove-button"
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
            on:click={() => navigate("/preview")}
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

<style>
    .category-container {
        display: flex; /* Use flexbox to layout buttons */
        flex-wrap: wrap; /* Allow the items to wrap as needed */
        gap: 8px; /* Adjust the gap between buttons as needed */
    }

    .remove-button:hover::after {
        content: "×"; /* Unicode multiplication sign as 'x' */
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%); /* Center the 'x' */
        color: #fff; /* Color of the 'x', choose what stands out */
        font-size: 1.5rem; /* Size of the 'x', adjust as needed */
        pointer-events: none; /* Prevents the 'x' from interfering with button clicks */
    }
</style>
