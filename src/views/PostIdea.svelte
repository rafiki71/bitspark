<script>
    import { navigate } from "svelte-routing";
    import { onMount } from "svelte";
    import MultiSelectDropdown from "../components/Dropdowns/MultiSelectDropdown.svelte";
    import Menu from "../components/Menu.svelte";
    import { helperStore } from "../helperStore.js";
    import { previewStore } from "../previewStore.js";
    import Footer from "../components/Footers/FooterBS.svelte";
    import { sidebarOpen } from "../helperStore.js";
    import Banner from "../components/Banner.svelte";

    function navigateTo(route) {
        navigate(route);
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
            await $helperStore.postIdea(
                $previewStore.name,
                $previewStore.subtitle,
                $previewStore.abstract,
                $previewStore.message,
                $previewStore.bannerUrl,
                $previewStore.githubRepo,
                $previewStore.lightningAddress,
                $previewStore.categories
            );

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

    let contentContainerClass = "content-container";
    let titleClass = "title-class";

    $: {
        if ($sidebarOpen) {
            contentContainerClass = "content-container sidebar-open";
            titleClass = "title-class sidebar-open";
        } else {
            contentContainerClass = "content-container";
            titleClass = "title-class";
        }
    }

    let bannerImage = "../../img/Banner1u.png";
    let title = "BitSpark";
    let subtitle = "Spark idea";
</script>

<div style="position: relative;">
    <main class="overview-page bg-blueGray-200">
        <div class="flex">
            <Menu />
            <div class="flex-grow">
                <Banner {bannerImage} {title} {subtitle} showSubtitles={true} />
                <div class={contentContainerClass}>
                    <section
                        class="content-container relative py-16 bg-blueGray-200"
                    >
                        <div class="container mx-auto px-4">
                            <div
                                class="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto bg-white p-8 rounded-xl shadow-lg"
                                style="width: 100%;"
                            >
                                <h2 class="text-2xl font-semibold mb-4">
                                    Spark Idea
                                </h2>
                                <div>
                                    <div class="mb-4">
                                        <input
                                            type="text"
                                            placeholder="Idea Name"
                                            class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            bind:value={$previewStore.name}
                                            style="width: 90%;"
                                        />
                                    </div>

                                    <div class="mb-4">
                                        <input
                                            type="text"
                                            placeholder="Idea Subtitle"
                                            class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            bind:value={$previewStore.subtitle}
                                            style="width: 90%;"
                                        />
                                    </div>

                                    <div class="mb-4">
                                        <textarea
                                            rows="1"
                                            placeholder="Abstract"
                                            class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 resize-none overflow-hidden"
                                            bind:value={$previewStore.abstract}
                                            on:input={autoResizeTextarea}
                                            style="width: 90%;"
                                        />
                                    </div>

                                    <div class="mb-4">
                                        <textarea
                                            rows="1"
                                            placeholder="Description"
                                            class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 resize-none overflow-hidden"
                                            bind:value={$previewStore.message}
                                            on:input={autoResizeTextarea}
                                            style="width: 90%;"
                                        />
                                    </div>

                                    <div class="mb-4">
                                        <input
                                            type="text"
                                            placeholder="Banner URL"
                                            class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            bind:value={$previewStore.bannerUrl}
                                            style="width: 90%;"
                                        />
                                    </div>
                                    <div class="mb-4">
                                        <input
                                            type="text"
                                            placeholder="GitHub Repository"
                                            class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            bind:value={$previewStore.githubRepo}
                                            style="width: 90%;"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Lightning Address"
                                            class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            bind:value={$previewStore.lightningAddress}
                                            style="width: 90%;"
                                        />
                                    </div>
                                    <div class="mb-4 mt-4" style="width: 90%;">
                                        <MultiSelectDropdown
                                            {categories}
                                            bind:selected={$previewStore.categories}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="container mx-auto px-4 flex justify-end">
                            <button
                                class="bg-red-500 text-white font-bold py-2 px-4 block rounded border border-red-500 mt-2 hover:shadow-xl"
                                on:click={() => navigateTo("/overview")}
                            >
                                Back to Home
                            </button>
                            <button
                                class="bg-blue-500 text-white font-bold py-2 px-4 block rounded border border-blue-500 ml-4 mt-2 hover:shadow-xl"
                                on:click={() => navigateTo("/preview")}
                            >
                                Preview
                            </button>
                            <button
                                class="bg-green-500 text-white font-bold py-2 px-4 block rounded border-transparent ml-4 mt-2 hover:shadow-xl"
                                on:click={postIdea}
                            >
                                Spark Idea
                            </button>
                        </div>
                    </section>
                    <Footer />
                </div>
            </div>
        </div>
    </main>
</div>

<style>
    .content-section {
        display: flex;
        background-color: #e2e8f0 !important;
    }

    .content-container {
        flex-grow: 1;
        z-index: 0;
    }

    .title-class {
        position: absolute;
        left: 0;
        right: 0;
        top: 1/2;
        transition: left 0.3s ease-in-out;
        left: 30px;
    }

    .title-class.sidebar-open {
        left: 215px;
    }

    .flex-grow {
        /* Other styles */
        z-index: 0; /* This will keep the div behind the button */
    }
    .content-container {
        margin-left: 0; /* This is the starting state */
        transition: margin-left 0.3s ease-in-out;
        flex-grow: 1;
        z-index: 0; /* This will keep the div behind the button */
    }

    .content-container.sidebar-open {
        margin-left: 200px; /* This should be equal to the width of the sidebar */
    }
</style>
