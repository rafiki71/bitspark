#!/bin/bash

# Stoppt das Skript bei einem Fehler
set -e

# Aktualisiert die Paketlisten
sudo apt update

# Installiert notwendige Pakete
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Fügt den Docker GPG-Schlüssel hinzu
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Fügt das Docker Repository hinzu
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Aktualisiert die Paketlisten nach Hinzufügen des Repositories
sudo apt update

# Installiert Docker Engine
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Fügt den aktuellen Benutzer zur Docker-Gruppe hinzu
sudo usermod -aG docker $USER

# Startet den Docker-Dienst
sudo service docker start

# Testet die Docker-Installation
docker run hello-world

# Fügt einen crontab-Eintrag hinzu, um Docker bei jedem Start von WSL zu starten
(crontab -l 2>/dev/null; echo "@reboot sudo service docker start") | crontab -

# Aktualisiert die Gruppenmitgliedschaft ohne Ab- und Anmeldung
echo "Wechseln Sie zur neuen Gruppenmitgliedschaft. Führen Sie nach Abschluss des Skripts 'exit' aus, um zur normalen Shell zurückzukehren."
newgrp docker

echo "Docker wurde erfolgreich installiert und konfiguriert!"
