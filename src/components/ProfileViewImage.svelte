
<script>
    import ProfileImg from "../components/ProfileImg.svelte";

    export let profile = null;
</script>

<div class="flex justify-center">
    <div class="single-card-profile-img">
        {#if profile && profile.picture}
            <ProfileImg
                {profile}
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    top: "0",
                    left: "0",
                }}
            />
        {/if}
    </div>
</div>