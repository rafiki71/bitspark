// NostrJobManager.js
import { nostrManager } from "./NostrManagerStore.js";
import { nostrCache } from "./NostrCacheStore.js";
import { NOSTR_KIND_JOB, NOSTR_KIND_IDEA } from "../constants/nostrKinds";

class NostrJobManager {
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

  subscribeIdea(ideaId) {
    if (!ideaId) {
      console.error("Idea ID is required to subscribe to an idea.");
      return;
    }

    if (!this.manager) {
      console.error("NostrManager is not initialized.");
      return;
    }

    this.manager.subscribeToEvents({
      kinds: [NOSTR_KIND_IDEA],
      ids: [ideaId],
      "#s": ["bitspark"],
    });

    console.log(`Subscribed to idea updates for ideaId: ${ideaId}`);
  }

  async isCreator(ideaId, userPubKey) {
    if (!ideaId) {
      console.error("Idea ID is required to check if the user is the idea creator.");
      return false;
    }

    const creator = await this.getCreator(ideaId);
    if (userPubKey === creator) {
      console.log("User is the idea creator.");
      return true;
    } else {
      console.log("User is not the idea creator.");
      return false;
    }
  }

  async getCreator(ideaId) {
    if (!ideaId) {
      console.error("Idea ID is required to check if the user is the idea creator.");
      return false;
    }

    const ideaEvent = await this.cache.getEventById(ideaId);
    if(!ideaEvent) {
      // this.manager.subscribeIdea(ideaId);
      return;
    }
    return ideaEvent.pubkey;
  }

  async getJobApprovalStatus(jobId) {
    if (!jobId) {
      console.error("Job ID is required to check the job approval status.");
      return;
    }

    const creator = await this.getCreator(jobId);

    const responses = await this.cache.getEventsByCriteria({
      kinds: [NOSTR_KIND_JOB],
      // authors: [creator],
      tags: {
        e: [jobId],
        t: ["job_approved", "job_declined"],
        s: ["bitspark"],
      },
    });

    const sortedResponses = responses.sort((a, b) => a.created_at - b.created_at);
    if (sortedResponses.length > 0) {
      const latestResponse = sortedResponses[0];
      return latestResponse.tags.find((tag) => tag[0] === "t")[1];
    } else {
      console.log("No approval status found for the job.");
      return "pending";
    }
  }

  async setApprovalStatus(jobId, approval) {
    if (!jobId) {
      console.error("Job ID is required to change the approval status.");
      return;
    }

    if (!this.manager || !this.manager.write_mode) {
      console.error("NostrManager is not ready or write mode is not enabled.");
      return;
    }

    // //const witnessEventString = btoa(JSON.stringify(event));
    const tags = [
      ["e", jobId],
      ["t", approval ? "job_approved" : "job_declined"],
      //["witness", witnessEventString]
      ["s", "bitspark"],
    ];

    try {
      await this.manager.sendEvent(NOSTR_KIND_JOB, approval ? "approved" : "declined", tags);
      console.log(`Job approval status changed to ${approval ? "approved" : "declined"}.`);
    } catch (error) {
      console.error("Error changing job approval status:", error);
    }
  }

  async submitRating(event, rating, comment) {
    if (!this.manager || !this.manager.write_mode) {
      console.error("NostrManager is not ready or write mode is not enabled.");
      return;
    }

    const witnessTag = event.tags.find(tag => tag[0] === "witness");
    if (!witnessTag) {
      console.error("Witness tag missing in event");
      return;
    }
    const witnessedEventString = witnessTag[1];
    const witnessedEvent = JSON.parse(atob(witnessedEventString));
    const creatorPubkey = witnessedEvent.pubkey;

    const jobIdTag = event.tags.find(tag => tag[0] === "e");
    const offerIdTag = event.tags.find(tag => tag[0] === "o");

    const jobId = jobIdTag ? jobIdTag[1] : null;
    const offerId = offerIdTag ? offerIdTag[1] : null;

    const tags = [
      ["t", "review"],
      jobId ? ["e", jobId] : null,
      offerId ? ["o", offerId] : null,
      ["e", event.id],
      ["p", creatorPubkey],
      ["rating", rating.toString()],
      ["s", "bitspark"]
    ].filter(Boolean); // Removes any null values

    try {
      await this.manager.sendEvent(NOSTR_KIND_JOB, comment, tags);
      console.log("Rating submitted successfully");
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  }

  // Aufräumfunktion, um die Subscriptions zu beenden
  cleanup() {
    this.cacheSubscription();
    this.managerSubscription();
  }
}

const nostrJobManager = new NostrJobManager();
export { nostrJobManager };
