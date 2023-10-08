import { writable } from 'svelte/store';

// Definieren Sie die anfänglichen Daten für einen Job
const initialJob = {
    ideaId: "",            // Diese ID wird verwendet, um den Job mit einer bestimmten Idee zu verknüpfen
    sats: "",            // Diese ID wird verwendet, um den Job mit einer bestimmten Idee zu verknüpfen
    jobTitle: "",
    jBannerUrl: "",
    jobDescription: "",
    jobCategories: [],
};

// Erstellen Sie den Store für Job
export const previewJobStore = writable(initialJob);
