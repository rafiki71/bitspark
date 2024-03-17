// NostrManagerStore.js
import { writable } from 'svelte/store';
import { NostrCacheManager } from './NostrCacheManager.js';

// Erstellen des Svelte Stores
export const nostrManager = writable(null);

// Asynchrone Initialisierung des NostrCacheManager
export async function initializeNostrManager(login, init) {
  let currentValue;
  nostrManager.subscribe(value => {
    currentValue = value;
  })(); // Abonnieren und sofort kündigen, um den aktuellen Wert zu erhalten
  
  if (!init || currentValue === null) {  // Überprüfe, ob der aktuelle Wert des Stores null ist
    const manager = new NostrCacheManager(login);
    manager.updateRelays(['wss://relay.damus.io', 'wss://relay.plebstr.com', 'wss://nostr.wine'])
    await manager.initialize();
    nostrManager.set(manager); // Setzen des Stores erst nach der Initialisierung
  }
}

// Aufruf der Initialisierungsfunktion
//initializeNostrManager(true);
