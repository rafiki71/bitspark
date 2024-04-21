// SocialMediaManager.js
import { nostrManager } from "./NostrManagerStore.js";
import { nostrCache } from "./NostrCacheStore.js";

class SocialMediaManager {
  constructor() {
    this.init();
  }

  async likeEvent(event_id) {
    if (!event_id) {
      console.error("Event ID is required to like an event.");
      return;
    }

    if (!this.manager || !this.manager.publicKey) {
      console.error("User must be logged in to like events.");
      return;
    }

    if (await this.checkIfLiked(event_id)) {
      console.error("Must be unliked");
      return;
    }

    // Definition der Tags für das Like-Event
    const tags = [
      ["e", event_id],         // Event-ID, die geliked wird
    ];

    // Erstellen und Versenden des Like-Events
    try {
      await this.manager.sendEvent(7, "+", tags);  // Annahme: 7 ist der Event-Typ für Likes
      console.log("Like event created and sent successfully");
    } catch (error) {
      console.error("Error sending like event:", error);
    }
  }

  async unlikeEvent(event_id) {
    if (!event_id) {
      console.error("Event ID is required to unlike an event.");
      return;
    }

    if (!this.manager || !this.manager.publicKey) {
      console.error("User must be logged in to unlike events.");
      return;
    }

    if (!await this.checkIfLiked(event_id)) {
      console.error("Must be liked!");
      return;
    }

    try {
      // Zuerst finden wir das Like-Event, das der Benutzer für die spezifische Event-ID erstellt hat.
      const likeEvents = await this.cache.getEventsByCriteria({
        kinds: [7], // Annahme, dass 7 der Typ für Like-Events ist
        authors: [this.manager.publicKey],
        tags: {
          e: [event_id],
        }
      });

      if (likeEvents.length > 0) {
        const likeEventId = likeEvents[0].id; // Nehmen das erste gefundene Like-Event
        await this.manager.deleteEvent(likeEventId);
        console.log("Event unliked successfully:", likeEventId);
      } else {
        console.log("No like event found to unlike.");
      }
    } catch (error) {
      console.error("Error unliking the event:", error);
    }
  }

  async checkIfLiked(event_id) {
    if (!event_id) {
      console.error("Event ID is required to check if liked.");
      return false;
    }

    if (!this.manager || !this.manager.publicKey) {
      console.error("Not logged in");
      return false;
    }

    const events = await this.cache.getEventsByCriteria({
      kinds: [7],
      authors: [this.manager.publicKey],
      tags: {
        e: [event_id],
      }
    });

    return events.length > 0;
  }

  async getLikes(event_id) {
    if (!event_id) {
      console.error("Event ID is required to get likes.");
      return;
    }

    if (!this.cache) {
      console.error("Cache is not initialized.");
      return;
    }

    try {
      const events = await this.cache.getEventsByCriteria({
        kinds: [7], // Annahme, dass 7 der Kind-Code für Like-Events ist
        tags: {
          e: [event_id]
        }
      });

      console.log("getLikes - Events fetched:", events);

      // Erstellen eines Sets, um eindeutige PublicKeys zu speichern
      const uniqueLikers = new Set();

      // Filtern der Events auf den Inhalt "+" und Überprüfung auf doppelte PublicKeys
      events.forEach(event => {
        if (event.content === "+") {
          uniqueLikers.add(event.pubkey);
        }
      });

      // Die Größe des Sets gibt die Anzahl der einzigartigen Likes zurück
      return uniqueLikers.size;
    } catch (error) {
      console.error("Error fetching likes:", error);
      return 0;
    }
  }

  subscribeLikes(event_id) {
    if (!event_id) {
      console.error("Event ID is required to subscribe for likes.");
      return;
    }

    if (!this.manager) {
      console.error("Manager is not initialized.");
      return;
    }

    this.manager.subscribeToEvents({
      kinds: [7], // Likes-Event-Typ
      "#e": [event_id]
    });

    console.log(`Subscribed to like updates for event_id: ${event_id}`);
  }

  unsubscribeLikes(event_id) {
    if (!event_id) {
      console.error("Event ID is required to unsubscribe from likes.");
      return;
    }

    if (!this.manager) {
      console.error("Manager is not initialized.");
      return;
    }

    this.manager.unsubscribeEvent({
      kinds: [7], // Likes-Event-Typ
      "#e": [event_id]
    });

    console.log(`Unsubscribed from like updates for event_id: ${event_id}`);
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
      console.error("Public key is required to get a profile.", pubkey);
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
    if (!pubkeys) {
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

    console.log(`Subscribed to profile updates for pubkey: ${pubkeys}`);
  }

  subscribeFollowList(pubkey) {
    if (!this.manager) {
      console.error("Manager is not initialized.");
      return;
    }

    try {
      this.manager.subscribeToEvents({
        kinds: [3],
        authors: [pubkey]
      });
      console.log(`Subscribed to follow list updates for pubkey: ${pubkey}`);
    } catch (error) {
      console.error("Error subscribing to follow list updates:", error);
    }
  }

  async getFollowList(pubkey) {
    if (!this.manager) {
      console.error("Manager not ready");
      return [];
    }

    try {
      const followEvents = await this.cache.getEventsByCriteria({
        kinds: [3],
        authors: [pubkey]
      });

      // Nimm das neueste Follow-List-Event
      if (followEvents.length > 0) {
        return followEvents.sort((a, b) => b.created_at - a.created_at)[0].tags;
      }
      return [];
    } catch (error) {
      console.error("Error fetching follow list:", error);
      return [];
    }
  }

  async follow(pubkey) {
    if (!this.manager || !this.manager.publicKey) {
      console.error("User must be logged in to follow.");
      return;
    }

    const currentList = await this.getFollowList(this.manager.publicKey);
    // Überprüfen, ob der PublicKey bereits gefolgt wird, um Duplikate zu vermeiden
    if (currentList.some(tag => tag[1] === pubkey)) {
      console.error("Already following this profile.");
      return;
    }

    // Hinzufügen des neuen Follows zur aktuellen Liste
    currentList.push(["p", pubkey, "", ""]); // Hier könnten auch Relay-URL und Petname hinzugefügt werden

    try {
      await this.manager.sendEvent(3, "", currentList);
      console.log("Updated follow list sent successfully");
    } catch (error) {
      console.error("Error updating follow list:", error);
    }
  }

  async unfollow(pubkey) {
    if (!this.manager || !this.manager.publicKey) {
      console.error("User must be logged in to unfollow.");
      return;
    }

    const currentList = await this.getFollowList(this.manager.publicKey);

    // Entfernen des Unfollows aus der aktuellen Liste
    const updatedList = currentList.filter(tag => tag[1] !== pubkey);

    try {
      await this.manager.sendEvent(3, "", updatedList);
      console.log("Updated follow list sent successfully after unfollowing");
    } catch (error) {
      console.error("Error updating follow list after unfollowing:", error);
    }
  }

  async isFollowing(fromPubKey, toPubKey) {
    if (!this.manager) {
      console.error("Manager not initialized.");
      return false;
    }

    try {
      const followList = await this.getFollowList(fromPubKey);
      return followList.some(tag => tag[1] === toPubKey);
    } catch (error) {
      console.error("Error checking if following:", error);
      return false;
    }
  }

  async followsMe(otherPubKey) {
    if (!this.manager || !this.manager.publicKey) {
      console.error("User must be logged in to check if being followed.");
      return false;
    }

    return await this.isFollowing(otherPubKey, this.manager.publicKey);
  }

  async iFollow(otherPubKey) {
    if (!this.manager || !this.manager.publicKey) {
      console.error("User must be logged in to check if following someone.");
      return false;
    }

    return await this.isFollowing(this.manager.publicKey, otherPubKey);
  }

  // Aufräumfunktion, um die Subscriptions zu beenden
  cleanup() {
    this.cacheSubscription();
    this.managerSubscription();
  }
}

const socialMediaManager = new SocialMediaManager();
export { socialMediaManager };
