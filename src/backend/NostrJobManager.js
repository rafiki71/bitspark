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
    if (!store) {
      return;
    }
    console.log(store);
    const unsubscribe = store.subscribe(updateFunction);
    return unsubscribe; // Rückgabe der Unsubscribe-Funktion für spätere Aufräumaktionen
  }

  async subscribeJobRelatedEvents(jobId) {
    if (!jobId) return;

    if (!this.manager) {
      console.error("NostrManager is not initialized.");
      return;
    }

    this.manager.subscribeToEvents({
      kinds: [NOSTR_KIND_JOB],
      "#e": [jobId],
      "#s": ["bitspark"],
    });
  }

  async subscribeUserRelatedJobs(publicKey) {
    if (!publicKey) {
      console.error("Public key is required to subscribe to jobs and offers.");
      return;
    }

    if (!this.manager) {
      console.error("NostrManager is not initialized.");
      return;
    }

    // Abonniere eigene Job-Postings und Angebote
    this.manager.subscribeToEvents({
      kinds: [NOSTR_KIND_JOB],
      authors: [publicKey],
      "#t": ["job"],
      "#t": ["offer"],
      "#s": ["bitspark"],
    });
  }

  async fetchUserRelatedJobs(publicKey) {
    if (!publicKey) {
      console.error("Public key is required to fetch jobs and offers.");
      return [];
    }
    let jobIdsFromOffers = new Set();
    let jobs = this.cache.getEventsByCriteria({
      kinds: [NOSTR_KIND_JOB],
      authors: [publicKey],
      tags: { s: ["bitspark"], t: ["job"] },
    });

    // Offers abrufen und Job-IDs extrahieren
    const offers = this.cache.getEventsByCriteria({
      kinds: [NOSTR_KIND_JOB],
      authors: [publicKey],
      tags: { s: ["bitspark"], t: ["offer"] },
    });

    offers.forEach((offer) => {
      const jobIdTag = offer.tags.find((tag) => tag[0] === "e");
      if (jobIdTag) {
        jobIdsFromOffers.add(jobIdTag[1]);
      }
    });

    // Jobs für extrahierte Job-IDs abonnieren
    jobIdsFromOffers.forEach((jobId) => {
      this.manager.subscribeToEvents({
        kinds: [NOSTR_KIND_JOB],
        ids: [jobId],
        "#s": ["bitspark"],
        "#t": ["job"],
      });
    });

    let uniqueJobsMap = new Map();

    // Jobs zu Map hinzufügen (Duplikate werden entfernt)
    jobs.forEach((job) => {
      uniqueJobsMap.set(job.id, job);
    });

    // Jobs aus Job-IDs von Offers hinzufügen
    jobIdsFromOffers.forEach((jobId) => {
      const job = this.cache.getEventById(jobId);
      if (job) {
        uniqueJobsMap.set(job.id, job);
      }
    });

    // Umwandeln der Map in Array und Sortierung
    jobs = Array.from(uniqueJobsMap.values());
    jobs.sort((a, b) => b.created_at - a.created_at);
    return jobs;
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

  async loadJobEvent(jobId) {
    if (!jobId) {
      console.error("Job ID is required to load job event.");
      return null;
    }

    const jobEvent = await this.cache.getEventById(jobId);
    if (!jobEvent) {
      console.error("Job event not found.");
      return null;
    }

    return jobEvent;
  }


  async isCreator(eventId, userPubKey) {
    if (!eventId) {
      console.error("Idea ID is required to check if the user is the idea creator.");
      return false;
    }

    const creator = await this.getCreator(eventId);
    if (userPubKey === creator) {
      console.log("User is the idea creator.");
      return true;
    } else {
      console.log("User is not the idea creator.");
      return false;
    }
  }

  async getCreator(eventID) {
    if (!eventID) {
      console.error("Idea ID is required to check if the user is the idea creator.");
      return false;
    }

    const ideaEvent = await this.cache.getEventById(eventID);
    if (!ideaEvent) {
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
      authors: [creator],
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

  async setJobApprovalStatus(jobId, approval) {
    if (!jobId) {
      console.error("Job ID is required to change the approval status.");
      return;
    }

    if (!this.manager || !this.manager.write_mode) {
      console.error("NostrManager is not ready or write mode is not enabled.");
      return;
    }

    const event = await this.cache.getEventById(jobId);
    const witnessEventString = btoa(JSON.stringify(event));

    const tags = [
      ["e", jobId],
      ["t", approval ? "job_approved" : "job_declined"],
      ["witness", witnessEventString],
      ["s", "bitspark"],
    ];

    try {
      await this.manager.sendEvent(NOSTR_KIND_JOB, approval ? "JobApproval" : "JobDecline", tags);
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

  async checkOfferStatus(offerId) {
    if (!offerId) {
      console.error("Offer ID is required to check the offer status.");
      return "pending";
    }

    const responses = await this.cache.getEventsByCriteria({
      kinds: [NOSTR_KIND_JOB],
      tags: {
        o: [offerId],
        t: ["ao", "do"],
        s: ["bitspark"],
      },
    });

    if (responses.length > 0) {
      const statusTag = responses[0].tags.find(tag => tag[0] === "t")[1];
      return statusTag === "ao" ? "accepted" : "declined";
    }

    return "pending";
  }

  async getJobId(offerId) {
    if (!offerId) {
      console.error("Offer ID is required to get the job ID.");
      return null;
    }

    const offerEvent = await this.cache.getEventById(offerId);
    if (!offerEvent) {
      console.error("Offer event not found.");
      return null;
    }

    const jobIdTag = offerEvent.tags.find(tag => tag[0] === "e");
    if (!jobIdTag) {
      console.error("Job ID tag not found in the offer event.");
      return null;
    }

    return jobIdTag[1];
  }

  async setOfferApprovalStatus(offerId, accept) {
    if (!this.manager || !this.manager.write_mode) {
      console.error("NostrManager is not ready or write mode is not enabled.");
      return;
    }

    const jobId = await this.getJobId(offerId);
    if (!jobId) {
      console.error("Unable to retrieve job ID from offer ID:", offerId);
      return;
    }
    const event = await this.cache.getEventById(offerId);
    const witnessEventString = btoa(JSON.stringify(event));

    
    const responseType = accept ? "ao" : "do";
    const content = accept ? "OfferApproval" : "OfferDecline";
    
    const tags = [
      ["t", responseType],
      ["e", jobId],
      ["o", offerId],
      ["witness", witnessEventString],
      ["s", "bitspark"],
      // Die Verwendung eines "witness" Tags könnte von der Logik und den Anforderungen der Anwendung abhängen
    ];

    try {
      await this.manager.sendEvent(NOSTR_KIND_JOB, content, tags);
      console.log(`Response ${content} sent successfully for offerId: ${offerId}`);
    } catch (error) {
      console.error("Error sending response:", error);
    }
  }

  async loadOffer(offerId) {
    if (!offerId) {
      console.error("Offer ID is required to load offer details.");
      return null;
    }

    const offerEvents = await this.cache.getEventsByCriteria({
      kinds: [NOSTR_KIND_JOB],
      ids: [offerId],
    });

    if (offerEvents && offerEvents.length > 0) {
      return offerEvents[0];
    } else {
      console.error("Offer not found.");
      return null;
    }
  }

  async sendPR(offerId, prUrl) {
    if (!this.manager || !this.manager.write_mode) {
      console.error("NostrManager is not ready or write mode is not enabled.");
      return;
    }

    if (!offerId || !prUrl) {
      console.error("Offer ID and PR URL are required.");
      return;
    }

    // Holen des Events, das das Angebot genehmigt hat
    const approvalEvent = await this.getOfferApprovalEvent(offerId);
    if (!approvalEvent) {
      console.error("Approval event for the offer not found.");
      return;
    }

    const jobId = await this.getJobId(offerId);
    if (!jobId) {
      console.error("Unable to retrieve job ID from offer ID:", offerId);
      return;
    }

    const witnessEventString = btoa(JSON.stringify(approvalEvent));

    const tags = [
      ["s", "bitspark"],
      ["t", "pr"],
      ["e", jobId], // Job ID
      ["o", offerId], // Offer ID
      ["pr_url", prUrl], // URL des Pull Requests
      ["witness", witnessEventString], // Zeuge des genehmigten Angebots
    ];

    try {
      await this.manager.sendEvent(NOSTR_KIND_JOB, "PR", tags);
      console.log("Pull Request submitted successfully.");
    } catch (error) {
      console.error("Error sending Pull Request:", error);
    }
  }

  // Diese Hilfsmethode holt das Genehmigungsevent für ein Angebot
  async getOfferApprovalEvent(offerId) {
    const responses = await this.cache.getEventsByCriteria({
      kinds: [NOSTR_KIND_JOB],
      tags: {
        o: [offerId],
        t: ["ao"], // Tag für Angebot genehmigt
        s: ["bitspark"],
      },
    });

    if (responses.length > 0) {
      // Rückgabe des neuesten Genehmigungsevents, wenn vorhanden
      return responses[responses.length - 1];
    } else {
      return null;
    }
  }

  async getPRStatus(prId) {
    if (!prId) {
      console.error("PR ID is required to check PR status.");
      return "pending";
    }

    // Lade das PR-Event, um die Job- und Offer-IDs zu extrahieren
    const prEvent = await this.cache.getEventById(prId);
    if (!prEvent) {
      console.error("PR event not found.");
      return "pending";
    }

    const jobIdTag = prEvent.tags.find(tag => tag[0] === "e");
    const offerIdTag = prEvent.tags.find(tag => tag[0] === "o");
    if (!jobIdTag || !offerIdTag) {
      console.error("Job ID or Offer ID tag missing in PR event.");
      return "pending";
    }

    const jobId = jobIdTag[1];
    const offerId = offerIdTag[1];

    // Suche nach Events, die den Status des PR festlegen
    const responses = await this.cache.getEventsByCriteria({
      kinds: [NOSTR_KIND_JOB],
      tags: {
        e: [jobId],
        pr: [prId],
        o: [offerId],
        t: ["apr", "dpr"],
      },
    });

    // Bestimme den Status basierend auf dem neuesten relevanten Event
    if (responses.length > 0) {
      const latestResponse = responses[responses.length - 1]; // Nehme das neueste Event
      const statusTag = latestResponse.tags.find(tag => tag[0] === "t")[1];
      return statusTag === "apr" ? "accepted" : "declined";
    }

    return "pending";
  }

  async handlePRResponse(prId, isAccepted) {
    if (!this.manager || !this.manager.write_mode) {
      console.error("NostrManager is not ready or write mode is not enabled.");
      return;
    }

    if (!prId) {
      console.error("PR ID is required to handle PR response.");
      return;
    }

    // Lade das PR-Event, um die Job- und Offer-IDs zu extrahieren
    const prEvent = await this.cache.getEventById(prId);
    if (!prEvent) {
      console.error("PR event not found.");
      return;
    }

    const jobIdTag = prEvent.tags.find(tag => tag[0] === "e");
    const offerIdTag = prEvent.tags.find(tag => tag[0] === "o");
    if (!jobIdTag || !offerIdTag) {
      console.error("Job ID or Offer ID tag missing in PR event.");
      return;
    }

    const jobId = jobIdTag[1];
    const offerId = offerIdTag[1];
    const responseType = isAccepted ? "apr" : "dpr"; // "apr" für Akzeptanz, "dpr" für Ablehnung
    const witnessEventString = btoa(JSON.stringify(prEvent)); // Kodiere das PR-Event als Witness-String

    const tags = [
      ["s", "bitspark"],
      ["t", responseType],
      ["o", offerId],
      ["e", jobId],
      ["pr", prId],
      ["witness", witnessEventString]
    ];

    try {
      await this.manager.sendEvent(NOSTR_KIND_JOB, isAccepted ? "PRApproval" : "PRDecline", tags);
      console.log(`PR response '${isAccepted ? "accepted" : "declined"}' sent successfully for PR ID:`, prId);
    } catch (error) {
      console.error(`Error sending PR response '${isAccepted ? "accepted" : "declined"}' for PR ID:`, prId, error);
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
