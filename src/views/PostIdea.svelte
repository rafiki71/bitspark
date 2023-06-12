<script>
    import { navigate } from "svelte-routing";
    import { onMount } from "svelte";
    import MultiSelectDropdown from "../components/Dropdowns/MultiSelectDropdown.svelte";
    import { helperStore } from "../helperStore.js";
    import { previewStore } from "../previewStore.js";

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
</script>

<main class="profile-page">
    <section class="relative block h-500-px">
        <div
            class="absolute top-0 w-full h-full bg-center bg-cover"
            style="
          background-image: url(https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80);
        "
        >
            <span
                id="blackOverlay"
                class="w-full h-full absolute opacity-50 bg-black"
            />

            <div
                class="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full"
            >
                <h1 class="text-4xl font-bold text-white">BitSpark</h1>
                <h2 class="text-2xl font-light text-white">Spark Idea</h2>
            </div>
        </div>
        <!-- Hinzugefügt: Schräg abgeschnittener Banner -->
        <div
            class="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
            style="transform: translateZ(0);"
        >
            <svg
                class="absolute bottom-0 overflow-hidden"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                version="1.1"
                viewBox="0 0 2560 100"
                x="0"
                y="0"
            >
                <polygon
                    class="text-blueGray-200 fill-current"
                    points="2560 0 2560 100 0 100"
                />
            </svg>
        </div>
        <!-- Ende: Schräg abgeschnittener Banner -->
    </section>
    <section class="relative py-16 bg-blueGray-200">
        <div class="container mx-auto px-4">
            <div
                class="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto bg-white p-8 rounded-xl shadow-lg"
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
    <section class="relative pb-16" />
</main>
