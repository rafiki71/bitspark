<!-- Footer.svelte -->
<script>
  // make dynamic date to be added to footer
  let date = new Date().getFullYear();
</script>

<footer class="block py-4 footer" id="myFooter">
  <div class="container mx-auto px-4">
    <div class="flex flex-wrap items-center md:justify-between justify-center">
      <div class="w-full px-4">
        <ul class="flex flex-wrap list-none md:justify-center justify-center">
          <li>
            <a
              href="https://lightning.network/lightning-network-paper.pdf"
              class="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3"
            >
              Powered by Lightning
            </a>
          </li>
          <li>
            <a
              href="https://nostr.com/"
              class="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3"
            >
              Powered by Nostr
            </a>
          </li>
          <li>
            <a
              href="https://getalby.com/"
              class="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3"
            >
              Powered by Alby
            </a>
          </li>
          <li>
            <a
              href="https://www.creative-tim.com?ref=ns-footer-admin"
              class="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3"
            >
              Creative Tim
            </a>
          </li>
          <li>
            <a
              href="https://github.com/creativetimofficial/notus-svelte/blob/main/LICENSE.md?ref=ns-footer-admin"
              class="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3"
            >
              MIT License
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</footer>
