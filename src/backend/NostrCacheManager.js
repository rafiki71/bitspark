// NostrCacheManager.js
import 'websocket-polyfill'
import { addOrUpdateEvent } from './NostrCacheStore.js';
const { SimplePool, generatePrivateKey, getPublicKey, getEventHash, signEvent, validateEvent, verifySignature, nip19 } = window.NostrTools;


export class NostrCacheManager {
    constructor(relays, write_mode) {
        this.pool = new SimplePool();
        this.relays = relays;
        this.subscriptions = new Map();
        this.write_mode = write_mode;
    }

    async extensionAvailable() {
        if ("nostr" in window) {
          return true;
        }
        return false;
      }
    
    async getPublicRelaysString() {
        return ["wss://relay.damus.io",
          "wss://nostr-pub.wellorder.net"];
      }

    async initialize() {
        let useExtension = await this.extensionAvailable();
        console.log("useExtension2:", useExtension);
        console.log("writeMode:", this.write_mode);
        if (this.write_mode && useExtension) {
            this.publicKey = await window.nostr.getPublicKey();
            console.log("publicKey:", this.publicKey);
        }
        else {
            this.write_mode = false;
            this.publicKey = null;
            this.relays = await this.getPublicRelaysString(); //fetch from the public first
        }
        console.log("used relays:", this.relays);
    }

    async extensionAvailable() {
        if ("nostr" in window) {
            return true;
        }
        return false;
    }

    uniqueTags(tags) {
        // Convert each tag array to a string and put it in a set.
        const tagSet = new Set(tags.map(tag => JSON.stringify(tag)));

        // Convert the set back to an array of arrays.
        const uniqueTags = Array.from(tagSet).map(tagStr => JSON.parse(tagStr));

        return uniqueTags;
    }

    async sendEvent(kind, content, tags) {
        if (!this.write_mode) return; // Do nothing in read-only mode
        if (!this.extensionAvailable()) return;

        let event = {
            pubkey: this.publicKey,
            created_at: Math.floor(Date.now() / 1000),
            kind,
            content,
            tags,
        };

        event.tags.push(["s", "bitspark"]);
        event = await window.nostr.signEvent(event);

        event.tags = this.uniqueTags(event.tags);
        const pubs = this.pool.publish(this.relays, event);
        console.log("send event:", event);
        return event.id;
    }

    // Methode zum Abonnieren von Events mit Fehlerbehandlung
    subscribeToEvents(criteria) {
        const subscriptionKey = this.generateSubscriptionKey(criteria);

        if (this.subscriptions.has(subscriptionKey)) {
            console.warn('Subscription for these criteria already exists.');
            return;
        } else {
            console.log('Subscription:', criteria);
        }

        let sub;
        try {
            sub = this.pool.sub(this.relays, [criteria]);
        } catch (error) {
            console.error('Failed to subscribe to events:', error);
            return;
        }

        sub.on('event', event => {
            try {
                addOrUpdateEvent(event);
            } catch (error) {
                console.error('Error updating event in store:', error);
            }
        });

        sub.on('error', error => {
            console.error('Error with subscription:', error);
            this.subscriptions.delete(subscriptionKey);
        });

        this.subscriptions.set(subscriptionKey, sub);
    }

    // Generiert einen eindeutigen Schlüssel für die Subscription
    generateSubscriptionKey(criteria) {
        return JSON.stringify(criteria);
    }

    // Methode zum Beenden aller Abonnements
    unsubscribeAll() {
        this.subscriptions.forEach(sub => sub.unsub());
        this.subscriptions.clear();
    }
}