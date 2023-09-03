<!-- Banner.svelte -->
<script>
    import { onMount, onDestroy } from "svelte";
    import { sidebarOpen } from "../helperStore.js";

    export let title;
    export let bannerImage;
    export let subtitle;
    export let show_right_text = false;

    onMount(async () => {});
    let titleClass = "title-class";

    $: {
        if ($sidebarOpen) {
            titleClass = "title-class sidebar-open";
        } else {
            titleClass = "title-class";
        }
    }
</script>

<section class="relative block h-500-px">
    <div
        class="absolute top-0 w-full h-full bg-center bg-cover"
        style="
    background-image: url({bannerImage});
  "
    >
        <span
            id="blackOverlay"
            class="w-full h-full absolute opacity-50 bg-black"
        />

        <!-- Titel und Untertitel hinzufügen -->
        <div
            class="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full"
        >
            <div
                class="flex flex-col items-start"
                style="margin-top: 10rem; margin-left: 10rem;"
            >
                <div class={titleClass}>
                    <h1 class="text-8xl font-bold text-white mr-4 mb-0;">
                        {title}
                    </h1>
                    <h2
                        class="text-4xl font-light text-white mt-0"
                        style="line-height: 0.9;"
                    >
                        <span class="ml-2">{subtitle}</span>
                    </h2>
                </div>
            </div>
            <div class="absolute top-4 right-4 flex justify-end">
                <div class="text-4xl font-light text-white">
                    {#if show_right_text}
                        <p
                            class="text-5xl leading-tight"
                            style="opacity: 0.3; margin-bottom: -0.4rem;"
                        >
                            ignite ideas.
                        </p>
                        <p
                            class="text-5xl leading-tight"
                            style="opacity: 1; margin-left: -2.8rem;"
                        >
                            ignite <span class="text-orange-500">change</span>.
                        </p>
                    {/if}
                </div>
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
                    class="color-for-bg fill-current"
                    points="2560 0 2560 100 0 100"
                />
            </svg>
        </div>
        <!-- Ende: Schräg abgeschnittener Banner -->
        <!-- Create Idea Button hinzufügen -->
    </div>
    <!-- ... -->
</section>

<style>
    .title-class {
        position: absolute;
        left: 0;
        right: 0;
        top: 1/2;
        transition: left 0.3s ease-in-out;
        left: 55px;
    }

    .title-class.sidebar-open {
        left: 215px;
    }
</style>
