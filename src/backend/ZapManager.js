// ZapManager.js
import { get } from 'svelte/store';
import { nostrCache } from "./NostrCacheStore.js";
import { nostrManager } from "./NostrManagerStore.js";

export class ZapManager {

    // Abonniert Zaps für ein bestimmtes Event
    subscribeZaps(eventId) {
        const manager = get(nostrManager);
        if (manager) {
            manager.subscribeToEvents({
                kinds: [9735], // Kind für Zap-Events
                "#e": [eventId],
            });
        }
    }

    // Berechnet die Gesamtanzahl der Zaps für ein Event
    getTotalZaps(eventId) {
        const cache = get(nostrCache);
        const zaps = cache.getEventsByCriteria({
            kinds: [9735],
            tags: { e: [eventId] },
        });

        let totalReceivedSats = 0;
        zaps.forEach(zap => {
            const descriptionTag = zap.tags.find(tag => tag[0] === "description");
            if (descriptionTag) {
                try {
                    const descriptionData = JSON.parse(descriptionTag[1]);
                    const amountMillisats = parseInt(
                        descriptionData.tags.find(tag => tag[0] === "amount")?.[1],
                        10,
                    );
                    totalReceivedSats += amountMillisats / 1000; // Umrechnung in Sats
                } catch (error) {
                    console.error("Fehler beim Parsen der Zap-Description:", error);
                }
            }
        });

        return totalReceivedSats;
    }
}

export const zapManager = new ZapManager();
