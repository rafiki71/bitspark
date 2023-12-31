<!-- JobMarketWidget.svelte -->
<script>
    import { onMount, onDestroy } from "svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import { Link } from "svelte-routing";
    import { job_categories } from "../../constants/categories.js";
    import { NOSTR_KIND_JOB } from "../../constants/nostrKinds.js";
    import SelectionModal from "../Modals/SelectionModal.svelte";
    import Modal, { bind } from "svelte-simple-modal";
    import { jobFilterStore } from "../../filterStore.js";
    import ProfileImg from "../ProfileImg.svelte";
    import { navigate } from "svelte-routing";

    function navigateToIdea(ideaId) {
        navigate(`/idea/${ideaId}`);
    }

    let jobs = [];
    let selectedCategories = [];

    function initialize() {
        subscribeToJobs();
    }

    function subscribeToJobs() {
        if ($nostrManager) {
            const eventCriteria = {
                kinds: [NOSTR_KIND_JOB],
                "#t": ["job"],
            };

            if (selectedCategories.length) {
                eventCriteria["#c"] = selectedCategories;
            }

            $nostrManager.subscribeToEvents(eventCriteria);

            jobs.forEach((job) => {
                $nostrManager.subscribeToEvents({
                    kinds: [0], // Profil-Kind
                    authors: [job.pubkey],
                });
            });

            updateJobs();
        }
    }

    function subscribeToAuthors() {
        if ($nostrManager) {
            jobs.forEach((job) => {
                $nostrManager.subscribeToEvents({
                    kinds: [0], // Profil-Kind
                    authors: [job.pubkey],
                });
            });
        }
    }

    function updateJobs() {
        const criteria = {
            kinds: [NOSTR_KIND_JOB],
            tags: selectedCategories.length ? { c: selectedCategories } : {},
        };
        jobs = $nostrCache.getEventsByCriteria(criteria);
        loadProfiles();
    }

    function openCategoryModal() {
        console.log("job_categories:", job_categories);
        jobFilterStore.set(
            bind(SelectionModal, {
                title: "Select Job Categories",
                categories: job_categories,
                initialSelectedCategories: selectedCategories,
                onConfirm: handleCategoryConfirm,
            }),
        );
    }

    function handleCategoryConfirm(categories) {
        selectedCategories = categories;
        subscribeToJobs();
    }

    function loadProfiles() {
        jobs = jobs.map((job) => {
            const profileEvents = $nostrCache.getEventsByCriteria({
                kinds: [0],
                authors: [job.pubkey],
            });

            if (profileEvents.length > 0) {
                profileEvents.sort((a, b) => b.created_at - a.created_at);
                job.profile = profileEvents[0].profileData;
            }
            return job;
        });
    }

    onMount(initialize);

    onDestroy(() => {
        $nostrManager.unsubscribeAll();
    });

    $: if ($nostrManager) {
        initialize();
    }

    $: if ($nostrCache) {
        updateJobs();
        subscribeToAuthors();
    }
</script>

<div class="job-market-widget single-card container">
    <Modal show={$jobFilterStore}>
        <button class="font-bold py-1 plus-button" on:click={openCategoryModal}
            >+</button
        >
    </Modal>
    {#each jobs as job}
        <div class="job-entry">
            {#if job.profile}
                <div class="profile-container">
                    <ProfileImg
                        profile={job.profile}
                        style={"object-fit: cover; border-radius: 50%;"}
                    />
                </div>
            {/if}
            <div class="job-title">
                <h2>
                    <Link to={`/job/${job.id}`}
                        >{job.tags.find((tag) => tag[0] === "jTitle")[1]}</Link
                    >
                </h2>
            </div>
            <button class="view-idea-button" on:click={() => navigateToIdea(job.tags.find((tag) => tag[0] === "e")[1])}>
                View Idea
            </button>
        </div>
    {/each}
</div>

<style>
    .view-idea-button {
        padding: 10px 20px;
        background-color: #f7931a; /* Bitcoin-Orange for the button */
        color: white;
        text-decoration: none;
        border: none;
        border-radius: 5px;
        font-size: 1rem;
        font-weight: 600;
        margin-left: auto; /* Pushes the button to the right */
        transition: background-color 0.2s ease;
    }

    .view-idea-button:hover {
        background-color: #e6830b; /* Darker orange on hover */
    }

    .job-entry {
        display: flex;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #eaeaea;
    }

    .profile-container,
    .job-title,
    .view-idea-button {
        margin-right: 15px; /* Standard spacing */
    }

    .profile-container {
        width: 70px; /* Smaller profile image */
        height: 70px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center; /* Centers the image vertically and horizontally */
    }

    .job-title {
        flex-grow: 1;
        margin-right: 15px; /* Ensures consistent spacing */
    }

    /* Additional styles to ensure the button is vertically centered */
    .view-idea-button {
        align-self: center; /* Aligns the button itself to center */
        height: fit-content; /* Fits the height to its content */
    }
</style>
