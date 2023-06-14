<script>
    import { onMount } from "svelte";
    import { Link } from "svelte-routing";
    import { helperStore } from "../helperStore.js";
    export let profile_id;

    let ideas = [];
    let profile = null;

    onMount(async () => {
        try {
            profile = await $helperStore.getProfile(profile_id);
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

<div style="width: 100%;">
    <section class="relative py-16 bg-blueGray-200">
        <div>
            <div
                class="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg mx-auto"
                style="max-width: 100%;"
            >
                <div class="px-6 py-6">
                    {#if profile}
                    <h1 class="relative flex text-4xl font-bold text-black ml-6 mb-6">{profile.name}'s Ideas</h1>
                    {/if}
                    <div class="flex flex-wrap justify-between">
                        {#each ideas as idea (idea.id)}
                            <Link
                                to={`/idea/${idea.id}`}
                                class="w-full md:w-6/12 lg:w-3/12 px-4 mb-6 no-underline"
                            >
                                <div
                                    class="shadow-lg rounded-lg text-center relative min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg pointer-events-auto cursor-pointer lg:w-full"
                                >
                                    <div
                                        class="relative flex flex-col min-w-0 w-full mb-0 shadow-lg rounded-lg bg-blueGray-600"
                                    >
                                        <img
                                            class="align-middle border-none max-w-full h-auto rounded-lg"
                                            src={idea.bannerImage}
                                            alt={idea.name}
                                        />
                                    </div>
                                    <blockquote class="relative p-8 mb-4">
                                        <h4
                                            class="text-xl font-bold text-blueGray-700"
                                        >
                                            {idea.name}
                                        </h4>
                                        {#if idea.subtitle}
                                            <p
                                                class="text-md font-light mt-2 text-blueGray-600"
                                            >
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
    </section>
</div>
