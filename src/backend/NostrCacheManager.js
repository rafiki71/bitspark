// NostrCacheManager.js
import 'websocket-polyfill'
import { addOrUpdateEvent } from './NostrCacheStore.js';
const { SimplePool } = window.NostrTools;


export class NostrCacheManager {
    constructor(relays, write_mode) {
        this.pool = new SimplePool();
        this.relays = relays;
        this.subscriptions = new Map();
        this.write_mode = write_mode;
        this.publicKey = null;
    }

    updateRelays(new_relays) {
        this.relays = new_relays;
        console.log("new relays:", this.relays);
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
        }
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

        //event.tags.push(["s", "bitspark"]);
        event = await window.nostr.signEvent(event);

        event.tags = this.uniqueTags(event.tags);
        const pubs = this.pool.publish(this.relays, event);
        console.log("send event:", event);
        console.log("used relays:", this.relays);
        return event.id;
    }

    // Methode zum Abonnieren von Events mit Fehlerbehandlung
    subscribeToEvents(criteria) {
        const subscriptionKey = this.generateSubscriptionKey(criteria);

        if (this.subscriptions.has(subscriptionKey)) {
            //console.warn('Subscription for these criteria already exists.');
            return;
        } else {
            console.log('Subscription:', criteria);
        }

        try {
            const sub = this.pool.subscribeMany(
                this.relays,
                [criteria],
                {
                    onevent: (event) => {
                        try {
                            addOrUpdateEvent(event);
                        } catch (error) {
                            console.error('Error updating event in store:', error);
                        }
                    },
                    onclose: () => {
                        console.log(`Sub ${subscriptionKey} closed.`);
                        this.subscriptions.delete(subscriptionKey);
                    }
                }
            );
            this.subscriptions.set(subscriptionKey, sub);
        } catch (error) {
            console.error('Failed to subscribe to events:', error);
            return;
        }
    }
    
    unsubscribeEvent(criteria) {
        const subscriptionKey = this.generateSubscriptionKey(criteria);
    
        // Check if a subscription exists for these criteria.
        if (this.subscriptions.has(subscriptionKey)) {
            try {
                // Close the subscription and remove it from the subscriptions map.
                this.subscriptions.get(subscriptionKey).close();
                this.subscriptions.delete(subscriptionKey);
                console.log(`Unsubscribed successfully from criteria: ${subscriptionKey}`);
            } catch (error) {
                console.error('Error unsubscribing:', error);
            }
        }

        console.log("subscriptions:", this.subscriptions);
    }

    unsubscribeAll() {
        this.subscriptions.forEach(sub => {
            try {
                sub.close();
            } catch (error) {
                console.error('Error closing subscription:', error);
            }
        });
        this.subscriptions.clear();
    }

    // Generiert einen eindeutigen Schlüssel für die Subscription
    generateSubscriptionKey(criteria) {
        return JSON.stringify(criteria);
    }

    // Methode zum Beenden aller Abonnements
    
}