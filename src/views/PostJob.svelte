<script>
    import { navigate } from "svelte-routing";
    import { onMount } from "svelte";
    import MultiSelectDropdown from "../components/Dropdowns/MultiSelectDropdown.svelte";
    import Menu from "../components/Menu.svelte";
    import { previewJobStore } from "../previewJobStore.js";
    import Footer from "../components/Footers/FooterBS.svelte";
    import { sidebarOpen } from "../helperStore.js";
    import Banner from "../components/Banner.svelte";
    import ToolBar from "../components/ToolBar.svelte";
    import { nostrManager } from "../backend/NostrManagerStore.js";
    import { NOSTR_KIND_JOB } from '../constants/nostrKinds';


    export let ideaID; // Empfange die ideaID direkt von der Route
    $previewJobStore.ideaId = ideaID;

    let categories = [
        "a",
        "b",
        "c",
        "d"];

    function autoResizeTextarea(e) {
        e.target.style.height = "";
        e.target.style.height = e.target.scrollHeight + "px";
    }

    async function postJob() {
        if (
            $previewJobStore.ideaId &&
            $previewJobStore.sats &&
            $previewJobStore.jobTitle &&
            $previewJobStore.jBannerUrl &&
            $previewJobStore.jobDescription &&
            $previewJobStore.jobCategories.length
        ) {
            let tags = [
                ["t", "job"],
                ["s", "bitspark"],
                ["jTitle", $previewJobStore.jobTitle],
                ["sats", $previewJobStore.sats],
                ["jbUrl", $previewJobStore.jBannerUrl],
                ["e", $previewJobStore.ideaId],
                ...$previewJobStore.jobCategories.map(category => ["c", category])
            ];

            // Senden des Job-Events über nostrManager
            if ($nostrManager && $nostrManager.write_mode) {
                await $nostrManager.sendEvent(
                    NOSTR_KIND_JOB, // Der Kind-Wert für Jobs
                    $previewJobStore.jobDescription,
                    tags
                );
            }

            // Zurücksetzen des Zustands
            for (let key in $previewJobStore) {
                if (Array.isArray($previewJobStore[key])) {
                    $previewJobStore[key] = [];
                } else {
                    $previewJobStore[key] = "";
                }
            }
            navigate(`/idea/${ideaID}`);
        } else {
            console.log("Bitte füllen Sie alle Felder aus.");
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
    let subtitle = "Post a Job";
</script>

<main class="overview-page">
    <Menu />
    <div class="flex-grow">
        <Banner {bannerImage} {title} {subtitle} show_right_text={true} />
        <ToolBar/>
        <div class={contentContainerClass}>
            <div
                class="container bg-card relative flex flex-col min-w-0 break-words"
            >
                <div class="flex flex-wrap justify-center">
                    <div
                        class="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto bg-white p-8"
                        style="width: 100%;"
                    >
                        <h2 class="text-2xl font-semibold mb-4">Post a Job</h2>
                        <div>
                            <div class="mb-4">
                                <input
                                    type="text"
                                    placeholder="Job Title"
                                    class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    bind:value={$previewJobStore.jobTitle}
                                    style="width: 100%;"
                                />
                            </div>

                            <div class="mb-4">
                                <input
                                    type="text"
                                    placeholder="Sats"
                                    class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    bind:value={$previewJobStore.sats}
                                    style="width: 100%;"
                                />
                            </div>

                            <div class="mb-4">
                                <input
                                    type="text"
                                    placeholder="Banner URL"
                                    class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    bind:value={$previewJobStore.jBannerUrl}
                                    style="width: 100%;"
                                />
                            </div>

                            <div class="mb-4">
                                <textarea
                                    rows="1"
                                    placeholder="Job Description"
                                    class="flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 resize-none overflow-hidden"
                                    bind:value={$previewJobStore.jobDescription}
                                    on:input={autoResizeTextarea}
                                    style="width: 100%;"
                                />
                            </div>

                            <div class="mb-4 mt-4" style="width: 100%;">
                                <MultiSelectDropdown
                                    {categories}
                                    bind:selected={$previewJobStore.jobCategories}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="container mx-auto px-4 py-4 flex justify-end">
                    <button
                        class="prevButton text-white font-bold py-2 px-4 block rounded border ml-4 mt-2 hover:shadow-xl"
                        on:click={postJob}
                    >
                        Post Job
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
        background-color: #11253b; /* dunklere Schattierung von #223d6d für den aktiven Zustand */
    }
</style>
