// NostrManagerStore.js
import { writable } from 'svelte/store';
import { NostrCacheManager } from './NostrCacheManager.js';

// Erstellen des Svelte Stores
export const nostrManager = writable(null);

// Asynchrone Initialisierung des NostrCacheManager
async function initializeNostrManager(login) {
  const manager = new NostrCacheManager(['wss://relay.damus.io'], login);
  await manager.initialize();
  nostrManager.set(manager); // Setzen des Stores erst nach der Initialisierung
}

// Aufruf der Initialisierungsfunktion
initializeNostrManager(true);
