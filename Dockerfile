# Verwenden Sie die offizielle Node.js LTS-Version als Basis-Image
FROM node:lts

# Arbeitsverzeichnis erstellen
WORKDIR /app

# Kopieren Sie das Projekt in den Container
COPY . .

# Installieren Sie die notwendigen Abhängigkeiten
RUN npm install --legacy-peer-deps
RUN npm install nostr-tools
RUN npm install @getalby/lightning-tools
# Tailwind CSS und FontAwesome bauen
RUN npm run build:tailwind
RUN npm run build:fontawesome
RUN npm install --save websocket-polyfill
RUN npm install --save-dev @rollup/plugin-json
RUN npm install svelte-spa-router
RUN npm install --save-dev rollup-plugin-image
RUN npm install --save-dev rollup-plugin-url
RUN npm install --save-dev rollup-plugin-postcss

RUN apt install -y git

# Port 5000 für den Entwicklungsserver verfügbar machen
#EXPOSE 5000

# Starten Sie den Entwicklungsserver
CMD ["npm", "run", "dev"]