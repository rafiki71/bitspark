import 'websocket-polyfill'
//import {SimplePool, generatePrivateKey, getPublicKey, getEventHash, signEvent, validateEvent, verifySignature} from 'nostr-tools'
const { SimplePool, generatePrivateKey, getPublicKey, getEventHash, signEvent, validateEvent, verifySignature, nip19 } = window.NostrTools;

export default class NostrHelper {
  constructor(write_mode) {
    this.pool = new SimplePool();
    this.relays = ['wss://relay.damus.io', 'wss://nostr-pub.wellorder.net'];
    //this.relays = ['wss://relay.damus.io', 'wss://nostr-pub.wellorder.net'];
    this.idea_kind = 1338;
    this.write_mode = write_mode
    this.publicKey = ""

  }

  async getAllRelays(pubkey) {
    // Get relays from getRelays function
    let relaysFromGetRelays = await this.getRelays(pubkey);
    // Transform it to include only relay URLs
    relaysFromGetRelays = relaysFromGetRelays.map(relay => relay[1]);
  
    // Get relays from getPublicRelays function
    let relaysFromGetPublicRelays = await this.getPublicRelays();
    // Transform it to include only relay URLs
    relaysFromGetPublicRelays = relaysFromGetPublicRelays.map(relay => relay[0]);
  
    // Combine both relay lists
    let allRelays = relaysFromGetRelays.concat(relaysFromGetPublicRelays);
  
    // Remove duplicates
    allRelays = [...new Set(allRelays)];
  
    return allRelays;
  }
  
  async getPublicRelays() {
      let relayObject = await window.nostr.getRelays();
      let relayList = [];
    
      for(let key in relayObject) {
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
  
    // The relay URLs are stored in 'r' tags of the event
    const relayTags = event.tags.filter(tag => tag[0] === 'r');
  
    return relayTags;
  }

  async addRelay(relay_url) {
    if (!this.write_mode) return; // Do nothing in read-only mode
    
    // Get the original Relay List Metadata event
    const originalEvent = await this.getRelays(this.publicKey);
    let originalRelays = originalEvent ? originalEvent.tags : [];
  
    originalRelays = originalRelays || [];
    
    // Check if the relay_url already exists in the original relays
    const exists = originalRelays.find(relay => relay[1] === relay_url);
  
    if (!exists) {
      // Add the new relay to the list
      originalRelays.push(["r", relay_url]);
    }
  
    // Create the relay list metadata event
    const relayListEvent = this.createEvent(10002, "", originalRelays);
  
    // Send the relay list metadata event
    await this.sendEvent(relayListEvent);
  }
  
  async deleteRelay(relay_url) {
    if (!this.write_mode) return; // Do nothing in read-only mode
    
    // Get the original Relay List Metadata event
    const originalEvent = await this.getRelays(this.publicKey);
    let originalRelays = originalEvent ? originalEvent.tags : [];
  
    originalRelays = originalRelays || [];
  
    // Filter out the relay_url from the original relays
    const updatedRelays = originalRelays.filter(relay => relay[1] !== relay_url);
  
    // Create the relay list metadata event
    const relayListEvent = this.createEvent(10002, "", updatedRelays);
  
    // Send the relay list metadata event
    await this.sendEvent(relayListEvent);
  }

  async extensionAvailable() {
    if("nostr" in window) {
      return true;
    }
    return false;
  }

  async initialize() {
    let useExtension = this.extensionAvailable();
    if (this.write_mode && useExtension) {
      this.publicKey = await window.nostr.getPublicKey();
      self.relays = await this.getAllRelays(self.publicKey); //fetch from the public first
      console.log(self.relays)
      self.relays = this.getAllRelays(self.publicKey); //do it again since relays changed now.
      console.log(self.relays)
    }
    else {
      this.write_mode = false;
    }

    console.log(this.publicKey);
  }

  async sendEvent(event) {
    console.log("sign event")
    if (!this.write_mode) return; // Do nothing in read-only mode
    if (!this.extensionAvailable()) return;

    event.tags.push(["s", "bitstarter"]);
    event = await window.nostr.signEvent(event);
    
    event.tags = uniqueTags(event.tags);
    const pubs = this.pool.publish(this.relays, event);
    console.log("send event:");
    console.log(event);
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

  async postIdea(ideaName, ideaSubtitle, content, bannerUrl, githubRepo, lnAdress) {
    if (!this.write_mode) return; // Do nothing in read-only mode

    const tags = [
      ["iName", ideaName],
      ["iSub", ideaSubtitle],
      ["ibUrl", bannerUrl],
      ["gitrepo", githubRepo],
      ["lnadress", lnAdress]
    ];

    const ideaEvent = this.createEvent(this.idea_kind, content, tags);
    console.log("Idea Posted")
    return await this.sendEvent(ideaEvent);
  }

  async getIdeas() {
    const filters = [{ kinds: [this.idea_kind], '#s': ['bitstarter'] }]
    let ideas = await this.pool.list(this.relays, filters);
    
    // Get the profiles for each idea and store them in the ideas
    const profilePromises = ideas.map(async idea => {
      const profile = await this.getProfile(idea.pubkey);
      // Set githubVerified property for each idea
      idea.githubVerified = profile.githubVerified || false;
      return idea;
    });
    
    ideas = await Promise.all(profilePromises);
  
    console.log("getIdeas()")
    return ideas;
  }
  
  async getComments(event_id) {
    const filters = [
      {
        kinds: [1],
        '#e': [event_id],
        '#s': ['bitstarter']
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
        '#s': ['bitstarter']
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

  async validateGithubIdent(pubkey, proof) {
    try {
      const gistUrl = `https://api.github.com/gists/${proof}`;

      const response = await fetch(gistUrl, { mode: 'cors' });
      const data = await response.json();

      const nPubKey = nip19.npubEncode(pubkey);

      const expectedText = `${nPubKey}`;

      for (const file in data.files) {
        if (data.files[file].content.includes(expectedText)) {
          console.log(data.files[file].content)
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error(`Error in validateGithubIdent: ${error}`);
      return false;
    }
  }

  async getProfile(pubkey) {
    console.log("getProfile");

    const events = await this.pool.list(this.relays, [
      {
        kinds: [0],
        'authors': [pubkey]
      }
    ]);

    // Wenn keine Events gefunden wurden, geben Sie ein leeres Objekt zurück
    if (events.length === 0) {
      return {'pubkey': pubkey};
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
      event.githubVerified = await this.validateGithubIdent(pubkey, githubIdent.proof);
    }

    // Den ursprünglichen content entfernen
    delete event.content;

    console.log(event);
    console.log("getProfile done");

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

  async updateProfile(name, picture, banner, dev_about, lnurl, identities = []) {
    console.log("updateProfile");
    if (!this.write_mode) return; // Do nothing in read-only mode

    // Get the original profile event
    const originalEvent = await this.getOriginalProfile();

    // Parse the content and merge it with the new data
    const originalContent = JSON.parse(originalEvent.content);
    const newContent = {
      ...originalContent,
      name,
      picture,
      banner,
      dev_about,
      lnurl,
    };

    // Convert the updated content back to a JSON string
    const contentStr = JSON.stringify(newContent);

    // Create the tags list by transforming the identity proofs into the required format
    const tags = identities.map(identity => ['i', `${identity.platform}:${identity.identity}`, identity.proof]);

    console.log(originalEvent.tags);
    console.log(tags);
    const combinedTags = [...tags];
    console.log(combinedTags);

    // Update the original event's content and tags
    const profileEvent = this.createEvent(0, contentStr, combinedTags);
    console.log(profileEvent);
    let ret = await this.sendEvent(profileEvent);
    console.log("Profile Update done");
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

NostrHelper.create = async function (write_mode) {
  const instance = new NostrHelper(write_mode);
  await instance.initialize();
  return instance;
}

/*
(async function() {
  const bitstarter = new BitstarterHelper('360dc1e47a2170c3a7477b3a401c10039354c073128f6f673bf5c9d5e12922c5');
  // Hole alle Ideen
  const allIdeas = await bitstarter.getIdeas();
  console.log('Alle Ideen:', allIdeas);
  // Erstelle eine neue Idee
  const ideaId = await bitstarter.postIdea("Testidee", "beste testidee ever", "Testidee", "url2banner", "github.com/user/repo", "somelnadress")
  console.log('Idee erstellt mit ID:', ideaId);
  
  // Poste einen Kommentar
  const comment = 'Das ist ja super';
  const commentid = await bitstarter.postComment(ideaId, comment);
  console.log('Kommentar gepostet:', commentid);
  
  // Like die Idee
  const likeid = await bitstarter.likeEvent(ideaId);
  console.log('Idee geliked:', likeid);
  
  
  // Hole die erstellte Idee
  const loadedIdea = await bitstarter.getEvent('9d3625d1e2dc0bbca24a96b93f5aa59ac2b090660f9b4b152cc21b8976c7fd8b');
  console.log('Geladene Idee:', loadedIdea);
  
  const loadedComment = await bitstarter.getEvent("3ad172b7463befc27b17f8edb245f5d95b25486116aa57ddcdcc10ae3d7cc304");
  console.log('Geladener Kommentar:', loadedComment);
  
  // Hole die Anzahl der Likes und Kommentare der Idee
  const likes = await bitstarter.getLikes("9d3625d1e2dc0bbca24a96b93f5aa59ac2b090660f9b4b152cc21b8976c7fd8b");
  console.log('Anzahl Likes:', likes);
  
  const comments = await bitstarter.getComments("9d3625d1e2dc0bbca24a96b93f5aa59ac2b090660f9b4b152cc21b8976c7fd8b");
  console.log('Anzahl Kommentare:', comments.length);
})();
*/
