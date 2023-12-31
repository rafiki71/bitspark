<script>
  import { Link } from 'svelte-routing';
  export let profile = {};
  export let style = {}; // new prop - it's now an object

  let pubkey, picture, githubVerified; // initial declaration

  // Reactive statements to update values when profile changes
  $: {
    pubkey = profile.pubkey;
    picture = profile.picture;
    githubVerified = profile.verified;
  }
  
  // Converts style object to CSS string
  const toStyleString = (styleObj) => Object.entries(styleObj)
    .map(([prop, value]) => `${prop}: ${value}`)
    .join('; ');

  $: styleString = toStyleString({ ...style, 'border-radius': '50%' }); // added border-radius here

</script>

<Link to={`/profile/${pubkey}`}>
  <img
    class="profile-image object-cover {githubVerified ? '' : 'grayscale'}"
    src={picture}
    alt="Profile Img"
    style={styleString}
  />
</Link>

<style>
  .profile-image {
    width: 50px; /* Oder jede andere gewünschte Größe */
    height: 50px;
    border-radius: 50%;
    object-fit: cover; /* Stellt sicher, dass das Bild das Element ausfüllt */
    object-position: center; /* Zentriert das Bild im Element */
  }
</style>
