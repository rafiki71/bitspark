import { writable } from 'svelte/store';

// Initialisiert den Store mit einem leeren Array
export const ideas = writable([]);
export const verifiedCards = writable([]);
export const unverifiedCards = writable([]);
