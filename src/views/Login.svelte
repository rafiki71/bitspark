<script>
  import { link } from "svelte-routing";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import NostrHelper from "../NostrHelper.js";
  import { navigate } from "svelte-routing";
  import "websocket-polyfill";

  const privateKey = writable("");

  async function handleLogin() {
    // Warten Sie darauf, dass NostrHelper.create aufgelöst ist, bevor Sie fortfahren
    const helper = await NostrHelper.create(true);

    // Erstelle einen neuen NostrHelper und speichere ihn in helperStore

    // Überprüfe, ob der NostrHelper korrekt im Store gespeichert wurde
    if (helper) {
      console.log("NostrHelper successfully saved in store");
      // Danach leiten wir den Benutzer zur Übersichtsseite
      navigate("/overview");
    } else {
      console.error("Failed to save NostrHelper in store");
    }
  }

  onMount(() => {
    document.body.style.overflow = "auto";
  });
</script>

<div
  class="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-indigo-500"
  style="background-image: url('https://images.wallpaperscraft.com/image/single/leaves_plant_dark_129098_3840x2400.jpg'); background-repeat: no-repeat; background-size: cover;"
>
  <div
    class="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 px-4 py-6 backdrop-blur-md rounded-lg shadow-lg"
    style="background-color: rgba(0, 255, 0, 0.1);"
  >
    <h2 class="text-2xl font-bold mb-6 text-center text-green-800">Login</h2>
    <div class="space-y-3">
      <div class="flex flex-col">
        <input
          bind:value={$privateKey}
          id="privateKey"
          type="password"
          class="border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Private Key"
        />
      </div>
      <div class="flex items-center justify-center mt-6">
        <button
          class="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-3 rounded-lg font-bold text-lg hover:bg-gradient-to-r hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 transition duration-150 shadow-md"
          on:click={handleLogin}
        >
          Sign In
        </button>
      </div>
    </div>
  </div>
</div>
