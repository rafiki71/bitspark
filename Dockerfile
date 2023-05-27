# Verwenden Sie die offizielle Node.js LTS-Version als Basis-Image
FROM node:lts

# Arbeitsverzeichnis erstellen
WORKDIR /app

# Kopieren Sie das Projekt in den Container
COPY . .

# Installieren Sie die notwendigen Abhängigkeiten
RUN npm install --legacy-peer-deps
RUN npm install nostr-tools
# Tailwind CSS und FontAwesome bauen
RUN npm run build:tailwind
RUN npm run build:fontawesome

# Port 5000 für den Entwicklungsserver verfügbar machen
#EXPOSE 5000

# Starten Sie den Entwicklungsserver
CMD ["npm", "run", "dev"]