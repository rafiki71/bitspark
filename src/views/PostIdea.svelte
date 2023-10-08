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
                        <h5 class="base-h5 text-color-df">Select Categories</h5>
                        <MultiSelectDropdown
                            {categories}
                            bind:selected={$previewStore.categories}
                        />
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
