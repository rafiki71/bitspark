<script>
    import { onMount } from "svelte";
    import { Link } from "svelte-routing";
    import { helperStore } from "../helperStore.js";
    export let profile_id;

    let ideas = [];

    onMount(async () => {
        try {
            const ideas_ = await $helperStore.getUserIdeas(profile_id);
            ideas = ideas_.map((idea) => {
                const tags = idea.tags.reduce(
                    (tagObj, [key, value]) => ({ ...tagObj, [key]: value }),
                    {}
                );
                return {
                    id: idea.id,
                    name: tags.iName,
                    subtitle: tags.iSub,
                    bannerImage: tags.ibUrl,
                    message: idea.content,
                    abstract: tags.abstract,
                };
            });
        } catch (error) {
            console.error("Error fetching user ideas:", error);
        }
    });
</script>

<section class="relative py-16 bg-blueGray-200">
    <div class="container mx-auto px-4">
        <div
            class="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64"
        >
            <div class="px-6">
                <div
                    class="mt-10 py-10 border-t border-blueGray-200 text-center"
                >
                    <div class="flex flex-wrap justify-center">
                        {#each ideas as idea (idea.id)}
                            <Link to={`/idea/${idea.id}`} class="w-full sm:w-6/12 md:w-6/12 lg:w-3/12 px-4 mb-6 no-underline">
                                <div
                                    class="shadow-lg rounded-lg text-center relative w-full min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg pointer-events-auto cursor-pointer"
                                >
                                    <div class="relative flex flex-col min-w-0 w-full mb-0 shadow-lg rounded-lg bg-blueGray-600">
                                        <img class="align-middle border-none max-w-full h-auto rounded-lg" src={idea.bannerImage} alt={idea.name} />
                                    </div>
                                    <blockquote class="relative p-8 mb-4">
                                        <h4 class="text-xl font-bold text-blueGray-700">
                                            {idea.name}
                                        </h4>
                                        {#if idea.subtitle}
                                        <p class="text-md font-light mt-2 text-blueGray-600">
                                            {idea.subtitle}
                                        </p>
                                        {/if}
                                    </blockquote>
                                </div>
                            </Link>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
