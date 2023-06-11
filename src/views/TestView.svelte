<script>
    import UserIdeas from "../components/UserIdeas.svelte";
    let profile_id = '32ff6345af6bea020295e43cd71c3d2365396f1a740d196af64d16e18db15d2a'; // Setzen Sie hier Ihre Profil-ID ein
</script>

<div style="width: 100%;">
    <UserIdeas {profile_id} />
</div>
