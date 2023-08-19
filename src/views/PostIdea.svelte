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
</script>

<main class="overview-page">
    <Menu />
    <div class="flex-grow">
        <Banner {bannerImage} {title} {subtitle} show_right_text={true} />
        <div class={contentContainerClass}>
            <div
                class="container bg-card relative flex flex-col min-w-0 break-words"
            >
                <div class="flex flex-wrap justify-center">
                    <div
                        class="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto bg-white p-8"
                        style="width: 100%;"
                    >
                        <h2 class="text-2xl font-semibold mb-4">Spark Idea</h2>
                        <div>
                            <div class="mb-4">
                                <input
                                    type="text"
                                    placeholder="Idea Name"
                                    class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    bind:value={$previewStore.name}
                                    style="width: 100%;"
                                />
                            </div>

                            <div class="mb-4">
                                <input
                                    type="text"
                                    placeholder="Idea Subtitle"
                                    class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    bind:value={$previewStore.subtitle}
                                    style="width: 100%;"
                                />
                            </div>

                            <div class="mb-4">
                                <textarea
                                    rows="1"
                                    placeholder="Abstract"
                                    class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 resize-none overflow-hidden"
                                    bind:value={$previewStore.abstract}
                                    on:input={autoResizeTextarea}
                                    style="width: 100%;"
                                />
                            </div>

                            <div class="mb-4">
                                <textarea
                                    rows="1"
                                    placeholder="Description"
                                    class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 resize-none overflow-hidden"
                                    bind:value={$previewStore.message}
                                    on:input={autoResizeTextarea}
                                    style="width: 100%;"
                                />
                            </div>

                            <div class="mb-4">
                                <input
                                    type="text"
                                    placeholder="Banner URL"
                                    class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    bind:value={$previewStore.bannerUrl}
                                    style="width: 100%;"
                                />
                            </div>
                            <div class="mb-4">
                                <input
                                    type="text"
                                    placeholder="GitHub Repository"
                                    class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    bind:value={$previewStore.githubRepo}
                                    style="width: 100%;"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Lightning Address"
                                    class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    bind:value={$previewStore.lightningAddress}
                                    style="width: 100%;"
                                />
                            </div>
                            <div class="mb-4 mt-4" style="width: 100%;">
                                <MultiSelectDropdown
                                    {categories}
                                    bind:selected={$previewStore.categories}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="container mx-auto px-4 py-4 flex justify-end">
                    <button
                        class="prevButton text-white font-bold py-2 px-4 block rounded border ml-4 mt-2 hover:shadow-xl"
                        on:click={() => navigateTo("/preview")}
                    >
                        Preview
                    </button>
                    <button
                        class="bg-orange-500 active:bg-orange-600 text-white font-bold py-2 px-4 block rounded border ml-4 mt-2 hover:shadow-xl"
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
    .prevButton {
        background-color: #223d6d;
    }

    .prevButton:active {
        background-color: #182c4e;
    }
</style>
