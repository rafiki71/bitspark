class EventBuffer {
    constructor() {
        this.profiles = new Map();
        this.userIdeas = new Map();  // to store idea ids by user
        this.categoryIdeas = new Map();  // to store idea ids by category
        this.ideas = new Map();
    }

    // Hinzufügen eines Profils zur Map
    addProfile(profile) {
        if (!profile) {
            return;
        }
        const timestamp = Date.now();
        this.profiles.set(profile.pubkey, { profile, timestamp });
        console.log("Profile added:", this.profiles.get(profile.pubkey))
    }

    // Abrufen eines Profils aus der Map, sofern es nicht älter als eine Stunde ist
    getProfile(pubkey) {
        const profileData = this.profiles.get(pubkey);
        if (profileData) {
            const oneHour = 60 * 60 * 1000; // Zeit in Millisekunden
            if (Date.now() - profileData.timestamp < oneHour) {
                return profileData.profile;
            }
        }
        return undefined;
    }

    addIdea(idea) {
        if (!idea) {
            return;
        }
        // If the idea is already in the map, don't add it again
        if (this.ideas.has(idea.id)) {
            return;
        }
        console.log("addIdea:", idea)
        this.ideas.set(idea.id, idea);

        // Add idea to user's set of ideas
        const userIdeaSet = this.userIdeas.get(idea.pubkey) || new Set();
        userIdeaSet.add(idea.id);
        this.userIdeas.set(idea.pubkey, userIdeaSet);

        // Add idea to each category's set of ideas
        idea.tags.forEach(tag => {
            if (tag[0] === 'c') {  // Assuming category is denoted by 'c'
                const categoryIdeaSet = this.categoryIdeas.get(tag[1]) || new Set();
                categoryIdeaSet.add(idea.id);
                this.categoryIdeas.set(tag[1], categoryIdeaSet);
            }
        });
    }

    // Get all ideas of a user
    getUserIdeas(userId) {
        const userIdeaIds = this.userIdeas.get(userId);
        return Array.from(userIdeaIds || []).map(id => this.ideas.get(id));
    }

    // Get all ideas in a category
    getCategoryIdeas(category) {
        if (!category) {
            let allIdeas = new Set();
            for (let categoryIdeaIds of this.categoryIdeas.values()) {
                Array.from(categoryIdeaIds).forEach(id => allIdeas.add(this.ideas.get(id)));
            }
            return Array.from(allIdeas);
        } else {
            const categoryIdeaIds = this.categoryIdeas.get(category);
            return Array.from(categoryIdeaIds || []).map(id => this.ideas.get(id));
        }
    }
}

export default EventBuffer;
