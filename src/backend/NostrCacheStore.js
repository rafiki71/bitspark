import { writable } from 'svelte/store';

// Definiert die Struktur des Cache-Objekts
class NostrEventCache {
  constructor() {
    this.events = new Map();
    this.kindIndex = new Map();
    this.authorIndex = new Map();
  }

  // Fügt ein Event hinzu oder aktualisiert es
  addOrUpdateEvent(event) {
    this.events.set(event.id, event);

    // Aktualisieren der kindIndex Map
    if (!this.kindIndex.has(event.kind)) {
      this.kindIndex.set(event.kind, new Set());
    }
    this.kindIndex.get(event.kind).add(event);

    // Aktualisieren der authorIndex Map
    if (!this.authorIndex.has(event.pubkey)) {
      this.authorIndex.set(event.pubkey, new Set());
    }
    this.authorIndex.get(event.pubkey).add(event);
  }

  // Holt ein Event anhand seiner ID
  getEventById(eventId) {
    return this.events.get(eventId);
  }

  // Filtert Events basierend auf übergebenen Kriterien
  getEventsByCriteria(criteria) {
    let filteredEvents = new Set(this.events.values());
  
    // Nutzen der Indizes für 'kinds' und 'authors'
    if (criteria.kinds) {
      filteredEvents = new Set(
        criteria.kinds.flatMap(kind => Array.from(this.kindIndex.get(kind) || []))
      );
    }
    if (criteria.authors) {
      const authorFiltered = new Set(
        criteria.authors.flatMap(author => Array.from(this.authorIndex.get(author) || []))
      );
      filteredEvents = new Set([...filteredEvents].filter(event => authorFiltered.has(event)));
    }
  
    // Für Tags und weitere Filter den reduzierten Event-Satz durchsuchen
    if (criteria.tags) {
      filteredEvents = new Set([...filteredEvents].filter(event =>
        this.matchesCriteria(event, criteria)
      ));
    }
  
    return Array.from(filteredEvents);
  }

  // Hilfsmethode zur Überprüfung der Kriterienübereinstimmung
  matchesCriteria(event, criteria) {
    for (let key in criteria) {
      if (key === 'kinds' && !criteria.kinds.includes(event.kind)) {
        return false;
      }
      if (key === 'authors' && !criteria.authors.includes(event.pubkey)) {
        return false;
      }
      if (key.startsWith('#')) {
        const tagValues = event.tags.filter(tag => tag[0] === key.substring(1)).map(tag => tag[1]);
        // Überprüft, ob jeder Wert im Filter auch in der Tag-Liste ist
        for (let value of criteria[key]) {
          if (!tagValues.includes(value)) {
            return false;
          }
        }
      }
    }
    return true;
  }
  
}

// Erstellt einen Svelte Store mit einer Instanz von NostrEventCache
const cache = new NostrEventCache();
export const nostrCache = writable(cache);

// Beispiel für eine Exportmethode, um ein Event hinzuzufügen oder zu aktualisieren
export const addOrUpdateEvent = (event) => {
  console.log("Event Added:", event);
  nostrCache.update(cache => {
    cache.addOrUpdateEvent(event);
    return cache;
  });
};

// Beispiel für eine Exportmethode, um Events nach Kriterien zu filtern
export const getEventsByCriteria = (criteria) => {
  let filteredEvents;
  nostrCache.subscribe(cache => {
    filteredEvents = cache.getEventsByCriteria(criteria);
  })();
  return filteredEvents;
};
