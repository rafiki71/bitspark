class ProfileBuffer {
    constructor() {
        this.profiles = new Map();
    }

    // Hinzufügen eines Profils zur Map
    addProfile(profile) {
        if (!profile) {
            return;
        }
        const timestamp = Date.now();
        this.profiles.set(profile.pubkey, { profile, timestamp });
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
}

export default ProfileBuffer;
