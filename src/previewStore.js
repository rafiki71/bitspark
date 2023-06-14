import { writable } from 'svelte/store';

// Definieren Sie die anfänglichen Daten
const initialIdea = {
    name: "",
    subtitle: "",
    abstract: "",
    message: "",
    bannerUrl: "",
    githubRepo: "",
    lightningAddress: "",
    categories: [],
};

// Erstellen Sie den Store
export const previewStore = writable(initialIdea);
