// SocialMediaManager.js
import { nostrManager } from "./NostrManagerStore.js";
import { nostrCache } from "./NostrCacheStore.js";

class SocialMediaManager {
  constructor() {
    this.init();
  }

  init() {
    // Initialisiere die Store-Abonnements
    this.cacheSubscription = this.subscribeToStore(nostrCache, (value) => {
      this.cache = value;
    });

    this.managerSubscription = this.subscribeToStore(nostrManager, (value) => {
      this.manager = value;
    });
  }

  subscribeToStore(store, updateFunction) {
    const unsubscribe = store.subscribe(updateFunction);
    return unsubscribe; // Rückgabe der Unsubscribe-Funktion für spätere Aufräumaktionen
  }

  async getProfile(pubkey) {
    if (!pubkey) {
      console.error("Public key is required to get a profile.");
      return null;
    }

    // Stelle sicher, dass der Cache initialisiert ist
    if (!this.cache) {
      console.error("Cache is not initialized.");
      return null;
    }

    const profileEvents = this.cache.getEventsByCriteria({
      kinds: [0], // Annahme: Kind 0 steht für Profil-Events
      authors: [pubkey],
    });

    if (profileEvents.length > 0) {
      profileEvents.sort((a, b) => b.created_at - a.created_at);
      return profileEvents[0].profileData; // Gibt das neueste Profil-Event zurück
    } else {
      console.log("No profile found for the provided public key. Attempting to subscribe for updates.");
      this.subscribeProfile(pubkey);
      return null;
    }
  }

  subscribeProfile(pubkey) {
    if (!pubkey) {
      console.error("Public key is required to subscribe to a profile.");
      return;
    }

    // Stelle sicher, dass der Manager initialisiert ist
    if (!this.manager) {
      console.error("Manager is not initialized.");
      return;
    }

    this.manager.subscribeToEvents({
      kinds: [0], // Profil-Event
      authors: [pubkey],
    });

    console.log(`Subscribed to profile updates for pubkey: ${pubkey}`);
  }

  subscribeProfiles(pubkeys) {
    if (!pubkey) {
      console.error("Public key is required to subscribe to a profile.");
      return;
    }

    // Stelle sicher, dass der Manager initialisiert ist
    if (!this.manager) {
      console.error("Manager is not initialized.");
      return;
    }

    this.manager.subscribeToEvents({
      kinds: [0], // Profil-Event
      authors: pubkeys,
    });

    console.log(`Subscribed to profile updates for pubkey: ${pubkey}`);
  }

  // Aufräumfunktion, um die Subscriptions zu beenden
  cleanup() {
    this.cacheSubscription();
    this.managerSubscription();
  }
}

const socialMediaManager = new SocialMediaManager();
export { socialMediaManager };
