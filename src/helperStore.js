// helperStore.js
import { writable, derived } from 'svelte/store';

export const helperStore = writable(null);
export const sidebarOpen = writable(false);


export const contentContainerClass = derived(sidebarOpen, $sidebarOpen =>
    $sidebarOpen ? "combined-content-container sidebar-open" : "combined-content-container"
);