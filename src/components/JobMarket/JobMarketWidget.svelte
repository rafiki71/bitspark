<!-- JobMarketWidget.svelte -->
<script>
    import { onMount, onDestroy } from "svelte";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import { Link } from "svelte-routing";
    import {
        job_categories,
        coding_language,
    } from "../../constants/categories.js";
    import { NOSTR_KIND_JOB } from "../../constants/nostrKinds.js";
    import SelectionModal from "../Modals/SelectionModal.svelte";
    import Modal, { bind } from "svelte-simple-modal";
    // import { jobFilterStore, langFilterStore } from "../../filterStore.js";
    import { selectedCategories, selectedLangs } from "../../filterStore.js";
    import ProfileImg from "../ProfileImg.svelte";
    import { navigate } from "svelte-routing";
    import { writable } from "svelte/store";
    import { socialMediaManager } from "../../backend/SocialMediaManager.js";

    function navigateToIdea(ideaId) {
        navigate(`/idea/${ideaId}`);
    }

    let jobs = [];
    // let selectedCategories = [];
    // let selectedLangs = [];

    function initialize() {
        subscribeToJobs();
    }

    function subscribeToJobs() {
        if ($nostrManager) {
            const eventCriteria = {
                kinds: [NOSTR_KIND_JOB],
                "#t": ["job"],
            };

            if ($selectedCategories.length) {
                eventCriteria["#c"] = $selectedCategories;
            }

            if ($selectedLangs.length) {
                eventCriteria["#l"] = $selectedLangs;
            }

            $nostrManager.subscribeToEvents(eventCriteria);

            jobs.forEach((job) => {
                socialMediaManager.subscribeProfile(job.pubkey);
            });

            updateJobs();
        }
    }

    function subscribeToAuthors() {
        if ($nostrManager) {
            jobs.forEach((job) => {
                socialMediaManager.subscribeProfile(job.pubkey);
            });
        }
    }

    function updateJobs() {
        // Erstelle ein Kriterien-Objekt für die Abfrage
        const criteria = {
            kinds: [NOSTR_KIND_JOB],
            tags: {},
        };

        criteria.tags["t"] = ["job"];

        // Füge Kategorien hinzu, falls ausgewählt
        if ($selectedCategories.length) {
            criteria.tags["c"] = $selectedCategories;
        }

        // Füge Programmiersprachen hinzu, falls ausgewählt
        if ($selectedLangs.length) {
            criteria.tags["l"] = $selectedLangs;
        }

        // Führe die Abfrage aus und lade die Jobs
        jobs = $nostrCache.getEventsByCriteria(criteria);

        // Lade die Profile der Autoren der Jobs
        loadProfiles();
    }

    let jobModal = writable(null);
    let languageModal = writable(null);

    function openCategoryModal() {
        jobModal.set(
            bind(SelectionModal, {
                categories: job_categories,
                initialSelectedCategories: $selectedCategories,
                onConfirm: handleCategoryConfirm,
            }),
        );
    }

    function handleCategoryConfirm(categories) {
        selectedCategories.set(categories);
        subscribeToJobs();
    }

    function openLangModal() {
        languageModal.set(
            bind(SelectionModal, {
                categories: coding_language,
                initialSelectedCategories: $selectedLangs,
                onConfirm: handleLangConfirm,
            }),
        );
    }

    function handleLangConfirm(categories) {
        selectedLangs.set(categories);
        subscribeToJobs();
    }

    function loadProfiles() {
        jobs = jobs.map((job) => {
            job.profile = socialMediaManager.getProfile(job.pubkey);
            return job;
        });
    }

    onMount(initialize);

    onDestroy(() => {
        $nostrManager.unsubscribeAll();
        jobModal.set(false);
        languageModal.set(false);
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
    <div class="modal-buttons-container">
        <Modal show={$jobModal}>
            <button class="modal-button" on:click={openCategoryModal}>
                <i class="fas fa-filter"></i> Filter by Category
            </button>
        </Modal>
        <Modal show={$languageModal}>
            <button class="modal-button" on:click={openLangModal}>
                <i class="fas fa-code"></i> Filter by Language
            </button>
        </Modal>
    </div>

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
                    <Link to={`/job/${job.id}`}>
                        {job.tags.find((tag) => tag[0] === "jTitle")?.[1]}
                    </Link>
                </h2>
            </div>
            <button
                class="view-idea-button"
                on:click={() =>
                    navigateToIdea(job.tags.find((tag) => tag[0] === "e")[1])}
            >
                View Idea
            </button>
        </div>
    {/each}
</div>

<style>
    .modal-buttons-container {
        display: flex;
        justify-content: flex-end; /* Rechtsbündig */
        padding: 10px; /* Abstand von oben und rechts */
    }

    .modal-button {
        background-color: #f7931a; /* Bitcoin-Orange */
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px;
        margin-left: 10px; /* Abstand zwischen den Buttons */
        cursor: pointer;
        font-size: 0.9rem;
        display: flex;
        align-items: center; /* Icon und Text vertikal zentrieren */
        transition: background-color 0.2s ease;
    }

    .modal-button i {
        margin-right: 5px; /* Abstand zwischen Icon und Text */
    }

    .modal-button:hover {
        background-color: #e6830b; /* Dunkleres Orange beim Hover */
    }

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
