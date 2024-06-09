// feedSelectionStore.js
import { writable } from 'svelte/store';

// Erstellen eines Svelte Stores mit dem initialen Wert 'verified'
export const selectedFeed = writable('hot');

// Funktion, um den Feed-Typ zu setzen
export function setFeed(feedType) {
    selectedFeed.set(feedType);
}
