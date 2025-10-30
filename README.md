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

## Hinzufügen eines neuen Planeten

Um einen weiteren Planeten oder Mond zur Simulation hinzuzufügen, sind folgende Schritte in `CGV-P1/js/script.js` notwendig:

1.  **Textur vorbereiten:**
    -   Legen Sie eine Bilddatei für die Planetenoberfläche im Ordner `CGV-P1/assets/` ab (z.B. `jupiter.jpg`).

2.  **Material erstellen:**
    -   Erstellen Sie in der `init()`-Funktion ein neues Material mit `createTexturedMaterial`.
    ```javascript
    const jupiterMaterial = createTexturedMaterial(scene, 'jupiterMat', 'assets/jupiter.jpg');
    ```

3.  **Himmelskörper erstellen:**
    -   Rufen Sie `system.createBody()` auf und definieren Sie die Eigenschaften des Planeten.
    ```javascript
    const jupiter = system.createBody({
        name: 'Jupiter',
        parent: sun, // Umlauf um die Sonne
        orbitRadius: 3.0, // Abstand zur Sonne
        diameter: 0.5, // Größe
        material: jupiterMaterial,
        axisTilt: (3 * Math.PI) / 180 // 3 Grad Achsenneigung
    });
    ```

4.  **Zeitkonfiguration erweitern:**
    -   Öffnen Sie die Funktion `computeTemporalConfig(earthOrbitMinutes)`.
    -   Fügen Sie die Berechnung für die Umlauf- und Rotationsdauer des neuen Planeten hinzu. Das Verhältnis basiert auf der Erde.
    ```javascript
    // Beispiel für Jupiter (Umlaufzeit ca. 11.86 Erdjahre)
    const jupiterOrbitMinutes = earthOrbitMinutes * 11.86;
    const jupiterDayMinutes = earthDayMinutes * (9.93 / 24); // Jupiter-Tag ist 9.93 Stunden
    
    return {
        // ... andere Werte
        jupiterOrbitMinutes,
        jupiterDayMinutes
    };
    ```

5.  **Zeitkonfiguration anwenden:**
    -   Aktualisieren Sie in `applyTemporalConfig(config, bodies)` die Perioden für den neuen Planeten.
    ```javascript
    bodies.jupiter.setOrbitPeriod(config.jupiterOrbitMinutes);
    bodies.jupiter.setRotationPeriod(config.jupiterDayMinutes);
    ```

6.  **Körper registrieren:**
    -   Fügen Sie die erstellte Planeten-Variable zum `bodies`-Objekt hinzu, damit die Zeitkonfiguration angewendet werden kann.
    ```javascript
    const bodies = { sun, earth, moon, satellite, mars, jupiter };
    ```

Nach diesen Schritten wird der neue Planet korrekt in der Szene angezeigt und animiert.

## Hinweise für Erklärungen
- Kommentare in `index.html` erläutern UI-Aufbau und Styling
- Kommentare in `script.js` begleiten jede wichtige Codepassage: Datenmodell, Update-Logik, Initialisierung
- Bei Bedarf kann die Konsole (`console.log`) genutzt werden, um aktuelle Winkel oder Positionen auszugeben

Viel Erfolg bei der Präsentation und Erklärung der Lösung!
