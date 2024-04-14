<!-- Banner.svelte -->
<script>
    import { sidebarOpen } from "../helperStore.js";

    export let title;
    export let bannerImage;
    export let subtitle;
    export let show_right_text = false;

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
            <div class="absolute right-4 flex justify-end" style="top: 4rem">
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
        <svg
            class="diagonal-cut"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMinYMin meet"
            version="1.1"
            viewBox="0 0 2560 80"
            x="0"
            y="0"
        >
            <polygon
                class="color-for-bg fill-current diagonal-cut"
                points="2560 0 2560 80 0 80"
            />
        </svg>
    </div>
</section>
