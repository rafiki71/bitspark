import { SimplePool } from 'nostr-tools';
import { addOrUpdateEvent } from './NostrStore.js';

export class NostrCacheManager {
    constructor(relays) {
        this.pool = new SimplePool();
        this.relays = relays;
        this.subscriptions = new Map();
    }

    // Methode zum Abonnieren von Events mit Fehlerbehandlung
    subscribeToEvents(criteria) {
        const subscriptionKey = this.generateSubscriptionKey(criteria);
        
        if (this.subscriptions.has(subscriptionKey)) {
            console.warn('Subscription for these criteria already exists.');
            return;
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

    // Weitere nützliche Methoden...
}

export const cacheManager = new NostrCacheManager([
    // Liste der Relay-URLs
]);
