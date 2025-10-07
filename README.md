# CGV Praktikum Aufgabe 1 – Rotationen im Sonnensystem

## Überblick
- Interaktive Babylon.js-Szene mit Erde, Mond, künstlichem Satelliten und zusätzlichem Testplaneten (Mars)
- Umlauf- und Rotationszeiten lassen sich frei skalieren, damit die Zusammenhänge anschaulich erklärbar bleiben
- Alle relevanten Dateien sind ausführlich auf Deutsch kommentiert, sodass jede Teilfunktion im Praktikum gezeigt werden kann

## Projektstruktur
- `CGV-P1/index.html` – Einstiegspunkt, enthält Canvas und UI-Panel
- `CGV-P1/js/script.js` – komplette Szenelogik inkl. Datenmodell für Himmelskörper
- `CGV-P1/js/babylon.js` – Babylon.js Library (lokal gebundelter Stand)
- `CGV-P1/assets/` – Texturen für Sonne, Erde, Mond, Mars und Satellit
- `CGV-P1/textures/` – selbst erzeugte Skybox (Sternenwürfel)
- `docker-compose.yml` – optionale NGINX-Konfiguration zum schnellen Start eines Webservers

## Startanleitung
1. **Variante Docker**
   - `docker-compose up --build` im Projektstamm
   - Browser öffnen: `http://localhost:8080/index.html`
2. **Variante Lokaler Server**
   - `cd CGV-P1`
   - `python3 -m http.server 8080`
   - Browser öffnen: `http://localhost:8080/index.html`
3. **Direktes Öffnen**
   - `CGV-P1/index.html` doppelklicken (Texturen werden lokal geladen, da alle Pfade relativ sind)

## Bedienung und Nachweis der Aufgaben
- Eingabefeld „1 Erdumlauf in Minuten“ steuert die Simulationsgeschwindigkeit (z. B. 0.1666, 1, 60)
- Anzeigefelder zeigen automatisch Erdtag, Mondmonat, Satellitenperiode und Realzeitfaktor
- Kamera mit Maus bewegen (Orbit), Mausrad zum Zoomen, SHIFT + Linksklick zum Schwenken
- Erde rotiert 365.24× pro Umlauf (Teil 1 & 2), Mond bleibt zur Erde ausgerichtet (Teil 2), Satellit umkreist Mond dreimal schneller (Teil 3)
- Mars demonstriert das flexible Design (Teil 4), Skybox erfüllt Teil 5

## Hinweise für Erklärungen
- Kommentare in `index.html` erläutern UI-Aufbau und Styling
- Kommentare in `script.js` begleiten jede wichtige Codepassage: Datenmodell, Update-Logik, Initialisierung
- Bei Bedarf kann die Konsole (`console.log`) genutzt werden, um aktuelle Winkel oder Positionen auszugeben

Viel Erfolg bei der Präsentation und Erklärung der Lösung!
