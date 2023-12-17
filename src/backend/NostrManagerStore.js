// NostrManagerStore.js
import { writable } from 'svelte/store';
import { NostrCacheManager } from './NostrCacheManager.js';

// Initialisierung des NostrCacheManager
const initialManager = new NostrCacheManager([
  // Liste der Relay-URLs
  'wss://relay.damus.io'
], true); // Der zweite Parameter ist 'write_mode'

initialManager.initialize();

// Erstellen des Svelte Stores
export const nostrManagerStore = writable(initialManager);
