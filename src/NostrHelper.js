import 'websocket-polyfill'
//import {SimplePool, generatePrivateKey, getPublicKey, getEventHash, signEvent, validateEvent, verifySignature} from 'nostr-tools'
const { SimplePool, generatePrivateKey, getPublicKey, getEventHash, signEvent, validateEvent, verifySignature, nip19 } = window.NostrTools;
import EventBuffer from './EventBuffer.js';
import { helperStore } from "./helperStore.js"; // Import the store

export default class NostrHelper {
  constructor(write_mode) {
    this.pool = new SimplePool();
    this.relays = [];//get set by initialize()
    this.idea_kind = 1339;
    this.job_kind = 1342;
    this.write_mode = write_mode;
    this.publicKey = null;
    this.publicRelays = [];
    this.clientRelays = [];
    this.eventBuffer = new EventBuffer();
    this.lastFetchTimeIdea = 0;
  }
  /*
########  ######## ##          ###    ##    ##    ##     ##    ###    ##    ## ########  ##       #### ##    ##  ######   
##     ## ##       ##         ## ##    ##  ##     ##     ##   ## ##   ###   ## ##     ## ##        ##  ###   ## ##    ##  
##     ## ##       ##        ##   ##    ####      ##     ##  ##   ##  ####  ## ##     ## ##        ##  ####  ## ##        
########  ######   ##       ##     ##    ##       ######### ##     ## ## ## ## ##     ## ##        ##  ## ## ## ##   #### 
##   ##   ##       ##       #########    ##       ##     ## ######### ##  #### ##     ## ##        ##  ##  #### ##    ##  
##    ##  ##       ##       ##     ##    ##       ##     ## ##     ## ##   ### ##     ## ##        ##  ##   ### ##    ##  
##     ## ######## ######## ##     ##    ##       ##     ## ##     ## ##    ## ########  ######## #### ##    ##  ######   
   */
  async getPublicRelaysString() {
    return ["wss://relay.damus.io",
      "wss://nostr-pub.wellorder.net"];

    let usePlugin = await this.extensionAvailable();
    if (!usePlugin || !this.write_mode) return ["wss://relay.damus.io",
      "wss://nostr-pub.wellorder.net",
      "wss://nostr.bitcoiner.social",
      "wss://nostr-01.bolt.observer"];

    // Get relays from getPublicRelays function
    let relaysFromGetPublicRelays = await this.getPublicRelays();
    // Transform it to include only relay URLs
    relaysFromGetPublicRelays = relaysFromGetPublicRelays.map(relay => relay[0]);
    this.publicRelays = relaysFromGetPublicRelays;
    console.log(relaysFromGetPublicRelays)
    return relaysFromGetPublicRelays
  }

  async getRelaysString(pubkey) {
    // Get relays from getRelays function
    let relaysFromGetRelays = await this.getRelays(pubkey);
    // Transform it to include only relay URLs
    relaysFromGetRelays = relaysFromGetRelays.map(relay => relay[1]);
    this.clientRelays = relaysFromGetRelays;
    return relaysFromGetRelays
  }

  async getAllRelays(pubkey) {
    // Get relays from getRelays function
    let relaysFromGetRelays = await this.getRelaysString(pubkey);

    // Get relays from getPublicRelays function
    let relaysFromGetPublicRelays = await this.getPublicRelaysString();

    // Combine both relay lists
    let allRelays = relaysFromGetRelays.concat(relaysFromGetPublicRelays);

    // Remove duplicates
    allRelays = [...new Set(allRelays)];

    return allRelays;
  }

  async getPublicRelays() {
    if (!this.extensionAvailable()) return; // Do nothing in read-only mode
    let relayObject = await window.nostr.getRelays();
    let relayList = [];

    for (let key in relayObject) {
      let relay = [key, relayObject[key].read, relayObject[key].write];
      relayList.push(relay);
    }

    return relayList;
  }

  async getRelays(pubkey) {
    // Get all events of kind 10002 (Relay List Metadata) authored by the given pubkey
    const events = await this.pool.list(this.relays, [
      {
        kinds: [10002],
        'authors': [pubkey]
      }
    ]);

    // If no events were found, return an empty array
    if (events.length === 0) {
      return [];
    }

    // Otherwise, take the first (most recent) event
    const event = events[0];
    console.log("event:", event)
    // The relay URLs are stored in 'r' tags of the event
    const relayTags = event.tags.filter(tag => tag[0] === 'r');

    return relayTags;
  }

  async addRelay(relay_url) {
    if (!this.write_mode) return; // Do nothing in read-only mode
    // Get the original Relay List Metadata event
    let originalRelays = await this.getRelays(this.publicKey);
    originalRelays = originalRelays || [];

    // Check if the relay_url already exists in the original relays
    const exists = originalRelays.find(relay => relay[1] === relay_url);
    // If the relay_url already exists, return
    if (exists) return;

    // Add the new relay to the list
    originalRelays.push(["r", relay_url]);

    // Create the relay list metadata event
    const relayListEvent = this.createEvent(10002, "", originalRelays);

    // Send the relay list metadata event
    try {
      await this.sendEvent(relayListEvent);
      // If the addition was successful, add it to clientRelays
      this.clientRelays.push(relay_url);
    } catch (error) {
      console.error("Error adding relay:", error);
    }
  }

  async deleteRelay(relay_url) {
    if (!this.write_mode) return; // Do nothing in read-only mode

    // Get the original Relay List Metadata event
    let originalRelays = await this.getRelays(this.publicKey);

    originalRelays = originalRelays || [];

    // Filter out the relay_url from the original relays
    const updatedRelays = originalRelays.filter(relay => relay[1] !== relay_url);

    // Create the relay list metadata event
    const relayListEvent = this.createEvent(10002, "", updatedRelays);

    try {
      // Send the relay list metadata event
      await this.sendEvent(relayListEvent);

      // Update the clientRelays array if the deletion was successful
      this.clientRelays = this.clientRelays.filter(relay => relay !== relay_url);
    } catch (error) {
      console.error("Error deleting relay:", error);
    }
  }

  async extensionAvailable() {
    if ("nostr" in window) {
      return true;
    }
    return false;
  }

  async initialize() {
    let useExtension = await this.extensionAvailable();
    console.error("useExtension:", useExtension);
    if (this.write_mode && useExtension) {
      this.publicKey = await window.nostr.getPublicKey();
      this.relays = await this.getPublicRelaysString(); //fetch from the public first
      this.relays = await this.getAllRelays(this.publicKey); //do it again since relays changed now.
    }
    else {
      this.write_mode = false;
      this.publicKey = null;
      this.relays = await this.getPublicRelaysString(); //fetch from the public first
    }
    console.log("used relays:", this.relays);
  }

  /*
######## ##     ## ######## ##    ## ########    ##     ##    ###    ##    ## ########  ##       #### ##    ##  ######   
##       ##     ## ##       ###   ##    ##       ##     ##   ## ##   ###   ## ##     ## ##        ##  ###   ## ##    ##  
##       ##     ## ##       ####  ##    ##       ##     ##  ##   ##  ####  ## ##     ## ##        ##  ####  ## ##        
######   ##     ## ######   ## ## ##    ##       ######### ##     ## ## ## ## ##     ## ##        ##  ## ## ## ##   #### 
##        ##   ##  ##       ##  ####    ##       ##     ## ######### ##  #### ##     ## ##        ##  ##  #### ##    ##  
##         ## ##   ##       ##   ###    ##       ##     ## ##     ## ##   ### ##     ## ##        ##  ##   ### ##    ##  
########    ###    ######## ##    ##    ##       ##     ## ##     ## ##    ## ########  ######## #### ##    ##  ######   
  */
  async sendEvent(event) {
    if (!this.write_mode) return; // Do nothing in read-only mode
    if (!this.extensionAvailable()) return;

    event.tags.push(["s", "bitspark"]);
    event = await window.nostr.signEvent(event);

    event.tags = uniqueTags(event.tags);
    const pubs = this.pool.publish(this.relays, event);
    console.log("send event:", event);
    return event.id;
  }

  async getEvent(event_id) {
    const event = await this.pool.get(this.relays, { ids: [event_id] });
    return event; // return the first event (should only be one event with this id)
  }

  createEvent(kind, content, tags) {
    const event = {
      pubkey: this.publicKey,
      created_at: Math.floor(Date.now() / 1000),
      kind,
      content,
      tags,
    };

    return event;
  }

  async deleteEvent(event_id) {
    if (!this.write_mode) return; // Do nothing in read-only mode

    let tags = [["e", event_id]];

    const deleteEvent = this.createEvent(5, "", tags);
    console.log("Event deleted:", event_id);
    return await this.sendEvent(deleteEvent);
  }

  async isDeleted(event_id) {
    let filters = [{ kinds: [5], '#s': ['bitspark'], '#e': [event_id] }]

    let deleted = await this.pool.list(this.relays, filters);
    console.log(deleted);
  }

  // Get all ideas of a user
  async getUserIdeas(userId) {
    if (this.eventBuffer.ideasEmpty()) {
      await this.fetchIdeas();
    }
    return this.eventBuffer.getUserIdeas(userId);
  }

  /*
   #### ########  ########    ###     ######  
    ##  ##     ## ##         ## ##   ##    ## 
    ##  ##     ## ##        ##   ##  ##       
    ##  ##     ## ######   ##     ##  ######  
    ##  ##     ## ##       #########       ## 
    ##  ##     ## ##       ##     ## ##    ## 
   #### ########  ######## ##     ##  ######  
  */
  async postIdea(ideaName, ideaSubtitle, abstract, content, bannerUrl, githubRepo, lnAdress, categories) {
    if (!this.write_mode) return; // Do nothing in read-only mode
    let tags = [
      ["iName", ideaName],
      ["iSub", ideaSubtitle],
      ["ibUrl", bannerUrl],
      ["gitrepo", githubRepo],
      ["lnadress", lnAdress],
      ["abstract", abstract]

    ];

    // Add each category to the tags
    categories.forEach(category => {
      tags.push(["c", category]);
    });

    const ideaEvent = this.createEvent(this.idea_kind, content, tags);
    console.log("Idea Posted")
    return await this.sendEvent(ideaEvent);
  }

  async getIdeas(categories = []) {
    if (categories.length == 0) {
      categories = undefined;
    }

    let ret = this.eventBuffer.getCategoryIdeas(categories);
    console.log("getIdeas:", ret)

    return ret;
  }

  async fetchIdeas() {
    const now = Date.now();
    const thresh = 10000; // 10 seconds in milliseconds
    // Check if it's been less than 10 seconds since the last fetch
    if (now - this.lastFetchTimeIdea < thresh) {
      console.log("fetchIdeas has been called too frequently. Please wait a bit.");
      return;
    }
    let filters = [{ kinds: [this.idea_kind], '#s': ['bitspark'] }]

    let ideas = await this.pool.list(this.relays, filters);

    // Get the profiles for each idea and store them in the ideas
    const profilePromises = ideas.map(async idea => {
      const profile = await this.getProfile(idea.pubkey);
      // Set githubVerified property for each idea
      idea.githubVerified = profile.githubVerified || false;
      // Hier speichern wir die Idee in unserem EventBuffer
      this.eventBuffer.addIdea(idea);
      return idea;
    });

    ideas = await Promise.all(profilePromises);

    console.log("fetchIdeas:", ideas)
    this.lastFetchTimeIdea = now;
    return ideas;
  }
  /*
 ######   #######  ##     ## ##     ## ######## ##    ## ########    ##     ##    ###    ##    ## ########  ##       #### ##    ##  ######   
##    ## ##     ## ###   ### ###   ### ##       ###   ##    ##       ##     ##   ## ##   ###   ## ##     ## ##        ##  ###   ## ##    ##  
##       ##     ## #### #### #### #### ##       ####  ##    ##       ##     ##  ##   ##  ####  ## ##     ## ##        ##  ####  ## ##        
##       ##     ## ## ### ## ## ### ## ######   ## ## ##    ##       ######### ##     ## ## ## ## ##     ## ##        ##  ## ## ## ##   #### 
##       ##     ## ##     ## ##     ## ##       ##  ####    ##       ##     ## ######### ##  #### ##     ## ##        ##  ##  #### ##    ##  
##    ## ##     ## ##     ## ##     ## ##       ##   ###    ##       ##     ## ##     ## ##   ### ##     ## ##        ##  ##   ### ##    ##  
 ######   #######  ##     ## ##     ## ######## ##    ##    ##       ##     ## ##     ## ##    ## ########  ######## #### ##    ##  ######   
   */
  async getComments(event_id) {
    const filters = [
      {
        kinds: [1],
        '#e': [event_id],
        '#s': ['bitspark']
      }
    ]
    let comments = await this.pool.list(this.relays, filters);

    // Fetch the profiles for each comment and store them in the comments
    const profilePromises = comments.map(async comment => {
      const profile = await this.getProfile(comment.pubkey);
      comment.name = profile.name || 'NoName';
      comment.picture = profile.picture || '';
      return comment;
    });
    comments = await Promise.all(profilePromises);

    console.log("getComments()")
    return comments;
  }
  async postComment(event_id, comment) {
    if (!this.write_mode) return; // Do nothing in read-only mode

    const tags = [
      ["e", event_id]
    ];

    const commentEvent = this.createEvent(1, comment, tags);
    console.log("postComment()")
    return await this.sendEvent(commentEvent);
  }

  /*
      ##  #######  ########  ##     ##    ###    ########  ##    ## ######## ######## 
      ## ##     ## ##     ## ###   ###   ## ##   ##     ## ##   ##  ##          ##    
      ## ##     ## ##     ## #### ####  ##   ##  ##     ## ##  ##   ##          ##    
      ## ##     ## ########  ## ### ## ##     ## ########  #####    ######      ##    
##    ## ##     ## ##     ## ##     ## ######### ##   ##   ##  ##   ##          ##    
##    ## ##     ## ##     ## ##     ## ##     ## ##    ##  ##   ##  ##          ##    
 ######   #######  ########  ##     ## ##     ## ##     ## ##    ## ########    ##                
  */
  async postJob(ideaId, sats, jobTitle, jBannerUrl, jobDescription, jobCategories) {
    if (!this.write_mode) return; // Do nothing in read-only mode

    const tags = [
      ["t", "job"],
      ["e", ideaId],
      ["jTitle", jobTitle],
      ["sats", sats],
      ["jbUrl", jBannerUrl]
    ];

    // Add each category to the tags
    jobCategories.forEach(category => {
      tags.push(["c", category]);
    });

    const jobEvent = this.createEvent(this.job_kind, jobDescription, tags);
    console.log("Job Posted:", jobEvent);
    return await this.sendEvent(jobEvent);
  }

  async getJob(jid) {
    if (this.eventBuffer.hasJob(jid)) {
      return this.eventBuffer.getJob(jid);
    }

    let job = await this.getEvent(jid);
    this.eventBuffer.addJob(job);

    return job;
  }

  async getJobByOffer(offerId) {
    const offer = await this.getEvent(offerId);
    if (offer && offer.tags) {
      // Finden Sie das Tag mit dem Schlüssel 'e', das die Job-ID enthält
      const jobTag = offer.tags.find(tag => tag[0] === 'e');
      if (jobTag && jobTag[1]) {
        // Rufen Sie die Job-ID aus dem Wert des Tags ab
        const jobId = jobTag[1];
        // Verwenden Sie die Job-ID, um den Job zu holen
        return await this.getJob(jobId);
      }
    }
    throw new Error("Job ID not found in offer tags");
  }

  async getJobs(ideaId) {
    if (this.eventBuffer.jobsEmpty(ideaId)) {
      return await this.fetchIdeaJobs(ideaId);
    }

    return this.eventBuffer.getJobsForIdea(ideaId);
  }

  async getUserJobs(npub) {
    if (this.eventBuffer.jobsEmpty(npub)) {
      return await this.fetchUserJobs(npub);
    }

    return this.eventBuffer.getJobsForUser(npub);
  }

  async fetchIdeaJobs(idea_id) {
    const now = Date.now();
    const thresh = 10000; // 10 seconds in milliseconds
    // Check if it's been less than 10 seconds since the last fetch
    if (now - this.lastFetchTimeIdea < thresh) {
      console.log("fetchJobs has been called too frequently. Please wait a bit.");
      return;
    }

    // Add idea_id to the filter
    let filters = [{ kinds: [this.job_kind], '#s': ['bitspark'], '#e': [idea_id], '#t': ['job'] }];
    let jobs = await this.pool.list(this.relays, filters);
    // Filter out jobs where job creator is not idea creator
    jobs = jobs.filter(job => {
      return job;
    });

    // Add each valid job to the associated idea in the eventBuffer
    jobs.forEach(job => {
      this.eventBuffer.addJob(job);
    });

    this.lastFetchTimeIdea = now;  // Consider having a separate timestamp for jobs, e.g., this.lastFetchTimeJob
    return jobs;
  }

  async fetchUserJobs(npub) {
    const now = Date.now();
    const thresh = 10000; // 10 seconds in milliseconds
    // Check if it's been less than 10 seconds since the last fetch
    if (now - this.lastFetchTimeIdea < thresh) {
      console.log("fetchJobs has been called too frequently. Please wait a bit.");
      return;
    }

    // Add idea_id to the filter
    let filters = [{ kinds: [this.job_kind], authors: [npub], '#s': ['bitspark'], '#t': ['job'] }];
    let jobs = await this.pool.list(this.relays, filters);

    // Add each valid job to the associated idea in the eventBuffer
    jobs.forEach(job => {
      this.eventBuffer.addJob(job);
    });

    this.lastFetchTimeIdea = now;  // Consider having a separate timestamp for jobs, e.g., this.lastFetchTimeJob
    return jobs;
  }

  // 3. Angebot senden:
  async postOffer(jobId, developerIntro, developerBid) {
    if (!this.write_mode) return;

    const tags = [
      ["t", "offer"],
      ["e", jobId],
      ["sats", developerBid]
    ];

    const offerEvent = this.createEvent(this.job_kind, developerIntro, tags);
    console.log("offerEvent:", offerEvent);
    return await this.sendEvent(offerEvent);
  }

  async fetchRelevantUserJobs(npub) {
    const now = Date.now();
    const thresh = 10000; // 10 seconds in milliseconds
    // Check if it's been less than 10 seconds since the last fetch
    if (now - this.lastFetchTimeIdea < thresh) {
      console.log("fetchUserJobsAndOffers has been called too frequently. Please wait a bit.");
      return;
    }

    // Fetch user's own jobs
    let jobFilters = [{ kinds: [this.job_kind], authors: [npub], '#s': ['bitspark'], '#t': ['job'] }];
    let jobs = await this.pool.list(this.relays, jobFilters);

    // Fetch offers made by the user
    let offerFilters = [{ kinds: [this.job_kind], authors: [npub], '#t': ['offer'] }];
    let offers = await this.pool.list(this.relays, offerFilters);

    // Fetch jobs for which the user has made offers
    let jobIdsFromOffers = offers.map(offer => offer.tags.find(tag => tag[0] === 'e')[1]);
    let jobsFromOffers = await Promise.all(jobIdsFromOffers.map(jobId => this.getJob(jobId)));

    // Combine both arrays and remove duplicates
    let allJobs = [...jobs, ...jobsFromOffers].reduce((acc, current) => {
      const x = acc.find(item => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    // Add each valid job to the associated idea in the eventBuffer
    allJobs.forEach(job => {
      this.eventBuffer.addJob(job);
    });

    this.lastFetchTimeIdea = now;  // Consider having a separate timestamp for jobs, e.g., this.lastFetchTimeJob
    return allJobs;
  }

  // 4. Angebote für einen Job abrufen:
  async getOffersForJob(jobId) {
    const filters = [{ kinds: [this.job_kind], '#e': [jobId], '#t': ['offer'] }];
    let offers = await this.pool.list(this.relays, filters);

    // Hängen Sie jedem Angebot den Status an
    for (let offer of offers) {
      let stat = await this.getOfferStatus(offer.id);
      offer.status = stat.status;
      offer.reason = stat.reason;
    }

    console.log(offers);
    return offers;
  }

  // 5. Jobs von einem User abrufen:
  async getOffersForUser(npub) {
    const filters = [{ kinds: [this.job_kind], authors: [npub], '#t': ['offer'] }];
    let offers = await this.pool.list(this.relays, filters);

    // Hängen Sie jedem Angebot den Status an
    for (let offer of offers) {
      let stat = await this.getOfferStatus(offer.id);
      offer.status = stat.status;
      offer.reason = stat.reason;
    }

    return offers;
  }

  async getOfferStatus(offerId) {
    const job = await this.getJobByOffer(offerId);
    if (!job) {
      throw new Error("Job not found for the offer");
    }

    // Filter für Akzeptanzen des Angebots
    const filters1 = [{ kinds: [this.job_kind], authors: [job.pubkey], '#o': [offerId], '#t': ['ao'] }];
    let accepts = await this.pool.list(this.relays, filters1);

    // Filter für Ablehnungen des Angebots
    const filters2 = [{ kinds: [this.job_kind], authors: [job.pubkey], '#o': [offerId], '#t': ['do'] }];
    let declines = await this.pool.list(this.relays, filters2);

    // Kombinieren Sie beide Arrays und sortieren Sie sie nach dem Erstellungsdatum
    let allResponses = [...accepts, ...declines].sort((a, b) => b.created_at - a.created_at);

    // Nehmen Sie die jüngste Antwort (Accept oder Decline)
    let latestResponse = allResponses[0];
    console.log("latestResponse:", latestResponse);

    // Basierend auf der jüngsten Antwort den Status zurückgeben
    let statusDetails = {
      status: 'pending',
      reason: ''
    };

    // Basierend auf der jüngsten Antwort den Status und den Grund zurückgeben
    if (latestResponse) {
      const responseType = latestResponse.tags.find(tag => tag[0] === 't')[1];
      const reason = latestResponse.tags.find(tag => tag[0] === 'reason');
      statusDetails.reason = reason ? reason[1] : ''; // Überprüfen Sie, ob das 'reason'-Tag vorhanden ist

      if (responseType === 'ao') {
        statusDetails.status = 'accepted';
      } else if (responseType === 'do') {
        statusDetails.status = 'declined';
      }
    }

    return statusDetails; // Gibt ein Objekt mit Status und Grund zurück
  }

  async updateOfferStatus(jobId, offerId, status, reason = '') {
    console.log("offerId:", offerId);
    const offer = await this.getEvent(offerId);
    console.log("offer:", offer);
    let offerOwner = offer.pubkey;
    console.log("offerOwner:", offerOwner);
    const tags = [
      ["t", status === 'accepted' ? 'ao' : 'do'],
      ["e", jobId],
      ["o", offerId],
      ["p", offerOwner],
      ["status", status],
      ["reason", reason]
    ];

    const updateEvent = this.createEvent(this.job_kind, `Offer ${status}`, tags);
    return await this.sendEvent(updateEvent);
  }

  async getJobAccepts(jobid) {
    const filters = [{ kinds: [this.job_kind], '#t': ['ao'], '#e': [jobid] }];
    let accepts = await this.pool.list(this.relays, filters);
    console.log("accepts:", accepts)
    return accepts;
  }

  // 6. Pull Request abgeben und informieren:
  async postPullRequest(jobId, offerId, pullRequestId, jobProfile) {
    if (!this.write_mode) return;

    const tags = [
      ["t", "pr"],
      ["e", jobId],
      ["o", offerId],
      ["pr_url", pullRequestId],
      ["p", jobProfile]
    ];

    const prEvent = this.createEvent(this.job_kind, "Pull Request", tags);
    console.log("Pull Request Posted");
    return await this.sendEvent(prEvent);
  }

  async getPullRequestsForOffer(jobid, offerid) {
    const filters = [{ kinds: [this.job_kind], '#t': ['pr'], '#e': [jobid], '#o': [offerid] }];
    let pullreqs = await this.pool.list(this.relays, filters);
    console.log("Pull Requests:", pullreqs)
    return pullreqs;
  }

  async getPullRequests(jobid) {
    const filters = [{ kinds: [this.job_kind], '#t': ['pr'], '#e': [jobid] }];
    let pullreqs = await this.pool.list(this.relays, filters);
    console.log("Pull Requests:", pullreqs)
    return pullreqs;
  }

  async setPullRequestStatus(pullRequestId, offerProfile, status, reason = '') {
    const statusTag = status === 'accepted' ? ["status", "accepted"] : ["status", "declined"];
    const tags = [
      ["t", status === 'accepted' ? "apr" : "dpr"],
      ["e", pullRequestId],
      ["p", offerProfile],
      statusTag
    ];

    // Wenn der Pull Request abgelehnt wird, fügen Sie einen Grund hinzu
    if (status === 'declined' && reason) {
      tags.push(["reason", reason]);
    }

    const event = this.createEvent(this.job_kind, `PR ${status}`, tags);
    return await this.sendEvent(event);
  }

  async getPullRequestStatus(pullRequestId) {
    // Filter für Akzeptanzen des Pull Requests
    const filtersAccept = [{ kinds: [this.job_kind], '#e': [pullRequestId], '#t': ['apr'] }];
    let accepts = await this.pool.list(this.relays, filtersAccept);

    // Filter für Ablehnungen des Pull Requests
    const filtersDecline = [{ kinds: [this.job_kind], '#e': [pullRequestId], '#t': ['dpr'] }];
    let declines = await this.pool.list(this.relays, filtersDecline);

    // Kombinieren Sie beide Arrays und sortieren Sie sie nach dem Erstellungsdatum
    let allResponses = [...accepts, ...declines].sort((a, b) => b.created_at - a.created_at);

    // Nehmen Sie die jüngste Antwort (Accept oder Decline)
    let latestResponse = allResponses[0];
    console.log("latestResponse:", latestResponse);

    // Basierend auf der jüngsten Antwort den Status zurückgeben
    let statusDetails = {
      status: 'pending',
      reason: ''
    };

    // Basierend auf der jüngsten Antwort den Status und den Grund zurückgeben
    if (latestResponse) {
      const responseType = latestResponse.tags.find(tag => tag[0] === 't')[1];
      const reason = latestResponse.tags.find(tag => tag[0] === 'reason');
      statusDetails.reason = reason ? reason[1] : ''; // Überprüfen Sie, ob das 'reason'-Tag vorhanden ist

      if (responseType === 'apr') {
        statusDetails.status = 'accepted';
      } else if (responseType === 'dpr') {
        statusDetails.status = 'declined';
      }
    }

    return statusDetails; // Gibt ein Objekt mit Status und Grund zurück
  }

  // 9. Bewertungen:
  async postReview(offerId, reviewContent, rating, profileRef) {
    const tags = [
      ["t", "review"],
      ["e", offerId],  // Offer ID
      ["p", profileRef],  // Profile of the developer
      ["review", reviewContent],
      ["rating", rating]
    ];

    const reviewEvent = this.createEvent(this.job_kind, "Review Posted", tags);
    return await this.sendEvent(reviewEvent);
  }


  /*
    ##       #### ##    ## ########    ##     ##    ###    ##    ## ########  ##       #### ##    ##  ######   
    ##        ##  ##   ##  ##          ##     ##   ## ##   ###   ## ##     ## ##        ##  ###   ## ##    ##  
    ##        ##  ##  ##   ##          ##     ##  ##   ##  ####  ## ##     ## ##        ##  ####  ## ##        
    ##        ##  #####    ######      ######### ##     ## ## ## ## ##     ## ##        ##  ## ## ## ##   #### 
    ##        ##  ##  ##   ##          ##     ## ######### ##  #### ##     ## ##        ##  ##  #### ##    ##  
    ##        ##  ##   ##  ##          ##     ## ##     ## ##   ### ##     ## ##        ##  ##   ### ##    ##  
    ######## #### ##    ## ########    ##     ## ##     ## ##    ## ########  ######## #### ##    ##  ######   
   */
  async likeEvent(event_id) {
    if (!this.write_mode) return; // Do nothing in read-only mode

    const tags = [
      ["e", event_id]
    ];

    const likeEvent = this.createEvent(7, "+", tags);
    console.log("likeEvent")
    return await this.sendEvent(likeEvent);
  }

  async getLikes(event_id) {
    const events = await this.pool.list(this.relays, [
      {
        kinds: [7],
        '#e': [event_id],
        '#s': ['bitspark']
      }
    ]);
    console.log("getLikes")
    return events.filter(event => event.content === "+").length;
  }

  async getGithubIdent(profile) {
    try {
      if (!profile.tags) {
        return null;
      }

      const tag = profile.tags.find(tag => tag[0] === 'i' && tag[1].startsWith('github:'));
      if (!tag) {
        return null;
      }

      // Extrahiere den Benutzernamen und den Nachweis aus dem Tag
      const githubInfo = tag[1].split(':');
      const username = githubInfo[1];
      const proof = tag[2];

      return { username, proof };
    } catch (error) {
      console.error(`Error in getGithubIdent: ${error}`);
      return null; // Return null if something goes wrong
    }
  }

  async validateGithubIdent(username, pubkey, proof) {
    try {
      const gistUrl = `https://api.github.com/gists/${proof}`;

      const response = await fetch(gistUrl, { mode: 'cors' });
      const data = await response.json();

      const nPubKey = nip19.npubEncode(pubkey);

      const expectedText = `${nPubKey}`;

      for (const file in data.files) {
        if (data.files[file].content.includes(expectedText) &&
          data.files[file].raw_url.includes(username)) {
          console.log(username, "verified!")
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error(`Error in validateGithubIdent: ${error}`);
      return false;
    }
  }
  /*
    ########  ########   #######  ######## #### ##       ########    ##     ##    ###    ##    ## ########  ##       #### ##    ##  ######   
    ##     ## ##     ## ##     ## ##        ##  ##       ##          ##     ##   ## ##   ###   ## ##     ## ##        ##  ###   ## ##    ##  
    ##     ## ##     ## ##     ## ##        ##  ##       ##          ##     ##  ##   ##  ####  ## ##     ## ##        ##  ####  ## ##        
    ########  ########  ##     ## ######    ##  ##       ######      ######### ##     ## ## ## ## ##     ## ##        ##  ## ## ## ##   #### 
    ##        ##   ##   ##     ## ##        ##  ##       ##          ##     ## ######### ##  #### ##     ## ##        ##  ##  #### ##    ##  
    ##        ##    ##  ##     ## ##        ##  ##       ##          ##     ## ##     ## ##   ### ##     ## ##        ##  ##   ### ##    ##  
    ##        ##     ##  #######  ##       #### ######## ########    ##     ## ##     ## ##    ## ########  ######## #### ##    ##  ######   
  */
  async getProfile(pubkey) {
    console.log("getProfile:", pubkey);

    // Überprüfen, ob das Profil bereits im ProfileBuffer gespeichert ist
    let profile = await this.eventBuffer.getProfile(pubkey);

    if (profile) {
      console.log("getProfile speed up:", profile);
      return profile;
    }
    else {
      console.log("buffer failed:", profile)
    }

    const events = await this.pool.list(this.relays, [
      {
        kinds: [0],
        'authors': [pubkey]
      }
    ]);

    // Wenn keine Events gefunden wurden, geben Sie ein leeres Objekt zurück
    if (events.length === 0) {
      return { 'pubkey': pubkey };
    }

    // Ansonsten nehmen Sie das erste Event
    const event = events[0];

    // Inhalt als JSON analysieren und als Eigenschaften zum Event hinzufügen
    const content = JSON.parse(event.content);
    for (let key in content) {
      event[key] = content[key];
    }

    // Get GitHub Identity
    const githubIdent = await this.getGithubIdent(event);
    if (githubIdent) {
      event.githubUsername = githubIdent.username;
      event.githubProof = githubIdent.proof;

      // Überprüfen der Github-Verifikation und speichern des Ergebnisses in profile.githubVerified
      event.githubVerified = await this.validateGithubIdent(githubIdent.username, pubkey, githubIdent.proof);
    }

    // Den ursprünglichen content entfernen
    delete event.content;

    this.eventBuffer.addProfile(event);
    console.log("getProfile done:", event);
    return event;
  }


  async getOriginalProfile() {
    const events = await this.pool.list(this.relays, [
      {
        kinds: [0],
        'authors': [this.publicKey]
      }
    ]);

    // Return the first event (there should only be one event with this id)
    return events[0];
  }

  async updateProfile(name, picture, banner, dev_about, lud16, identities = []) {
    console.log("updateProfile");
    if (!this.write_mode) return; // Do nothing in read-only mode

    // Get the original profile event
    const originalEvent = await this.getOriginalProfile();
    console.log("originalEvent:", originalEvent)

    // Parse the content and merge it with the new data
    let originalContent = null;
    try {
      originalContent = JSON.parse(originalEvent.content);
    }
    catch {
      originalContent = {};
    }

    const newContent = {
      ...originalContent,
      name,
      picture,
      banner,
      dev_about,
      lud16,
    };

    // Convert the updated content back to a JSON string
    const contentStr = JSON.stringify(newContent);

    // Create the tags list by transforming the identity proofs into the required format
    const tags = identities.map(identity => ['i', `${identity.platform}:${identity.identity}`, identity.proof]);

    const combinedTags = [...tags];

    // Update the original event's content and tags
    const profileEvent = this.createEvent(0, contentStr, combinedTags);
    let ret = await this.sendEvent(profileEvent);
    console.log("Profile Update done:", profileEvent);
    return ret;
  }
}

function uniqueTags(tags) {
  // Convert each tag array to a string and put it in a set.
  const tagSet = new Set(tags.map(tag => JSON.stringify(tag)));

  // Convert the set back to an array of arrays.
  const uniqueTags = Array.from(tagSet).map(tagStr => JSON.parse(tagStr));

  return uniqueTags;
}

let storedInstance = null;

NostrHelper.create = async function (write_mode) {
  // Get stored object.
  helperStore.subscribe(value => { storedInstance = value; })();

  // If not in storage, create one.
  if (storedInstance === null) {
    if (write_mode == undefined) {
      write_mode == false;
    }
    const instance = new NostrHelper(write_mode);
    await instance.initialize();
    helperStore.set(instance);
    storedInstance = instance;
    return storedInstance;
  }

  // Wenn write_mode definiert ist, erstelle eine neue Instanz und speichere sie im Store.
  if (write_mode !== undefined) {
    if (storedInstance.write_mode != write_mode) {
      storedInstance.write_mode = write_mode;
      await storedInstance.initialize();
      helperStore.set(storedInstance);
    }
  }

  // Gibt die Instanz aus dem Store zurück
  return storedInstance;
}


