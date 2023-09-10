class JobBuffer {
    constructor() {
        this.ideas = {};         // { ideaId: ideaData }
        this.jobs = {};          // { jobId: jobData }
        this.offers = {};        // { offerId: { offerData, jobId } }
        this.pullRequests = {};  // { prId: { prData, offerId } }
        this.reviews = {};       // { offerId: [reviewData, ...] }
    }

    // Job
    addJob(jobEvent) {
        const ideaId = jobEvent.tags.find(tag => tag[0] === "e")[1];
        this.jobs[jobEvent.id] = { ...jobEvent, ideaId };
    }

    // Offer
    addOffer(offerEvent) {
        const jobId = offerEvent.tags.find(tag => tag[0] === "e")[1];
        this.offers[offerEvent.id] = { offerData: offerEvent, jobId };
    }

    // Pull Request
    addPullRequest(prEvent) {
        const offerId = prEvent.tags.find(tag => tag[0] === "e")[1];
        this.pullRequests[prEvent.id] = { prData: prEvent, offerId };
    }

    // Review
    addReview(reviewEvent) {
        const offerId = reviewEvent.tags.find(tag => tag[0] === "e")[1];
        if (!this.reviews[offerId]) {
            this.reviews[offerId] = [];
        }
        this.reviews[offerId].push(reviewEvent);
    }

    // Accept/Decline Offers
    acceptOffer(offerEvent) {
        const offerId = offerEvent.id;
        if (this.offers[offerId]) {
            const statusTag = offerEvent.tags.find(tag => tag[0] === "status");
            this.offers[offerId].offerData.status = statusTag ? statusTag[1] : 'accepted';
        }
    }

    declineOffer(offerEvent) {
        const offerId = offerEvent.id;
        if (this.offers[offerId]) {
            const statusTag = offerEvent.tags.find(tag => tag[0] === "status");
            const reasonTag = offerEvent.tags.find(tag => tag[0] === "reason");
            this.offers[offerId].offerData.status = statusTag ? statusTag[1] : 'declined';
            this.offers[offerId].offerData.reason = reasonTag ? reasonTag[1] : undefined;
        }
    }

    // Accept/Decline Pull Requests
    acceptPullRequest(prEvent) {
        const prId = prEvent.id;
        if (this.pullRequests[prId]) {
            const statusTag = prEvent.tags.find(tag => tag[0] === "status");
            this.pullRequests[prId].prData.status = statusTag ? statusTag[1] : 'accepted';
        }
    }

    declinePullRequest(prEvent) {
        const prId = prEvent.id;
        if (this.pullRequests[prId]) {
            const statusTag = prEvent.tags.find(tag => tag[0] === "status");
            const reasonTag = prEvent.tags.find(tag => tag[0] === "reason");
            this.pullRequests[prId].prData.status = statusTag ? statusTag[1] : 'declined';
            this.pullRequests[prId].prData.reason = reasonTag ? reasonTag[1] : undefined;
        }
    }
}
