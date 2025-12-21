# SkillTracker

Webapp, um Skills zu verwalten und Lernfortschritte anzuzeigen.

## Stack

SkillTracker ist eine REST-API, mit der Skills strukturiert in einer MySQL-Datenbank gespeichert und über HTTP-Endpoints gelesen und erstellt werden können.

Frontend kommt noch.

Es besteht aus drei klar getrennten Ebenen:

### Ebene 1: Der Client (curl / Browser / später Frontend)

Der Client schickt HTTP-Requests und bekommt JSON zurück.

### Ebene 2: Das Backend (Node.js + Express)

Startpunkt: app.js

*// JSON-Bodies werden automatisch geparst*
*// Express wird initialisiert* 
*// Die DB-Verbindung wird vorbereitet*

const express = require("express"); 
const pool = require("./db");

const app = express();
app.use(express.json());

#### Was passiert bei welcher URL?

**/health**
app.get("/health", ...)

- Testet ob Server läuft
- Testet Zugriff auf DB


**GET /skills**
app.get("/skills", async (req, res) => {
  const [rows] = await pool.query(...);
  res.json(rows);
});

- Express empfängt den Request
- pool.query() führt SQL aus
- MySQL gibt Daten zurück
- Express gibt die Daten als JSON an Client zurück
- Client bekommt [] oder ein Array von Objekten


**POST /skills**
app.post("/skills", async (req, res) => {
  // validieren
  // INSERT
  // SELECT
  // zurückgeben
});

- Client schickt JSON an API
- Express legt Request in req.body ab und prüft Pflichtfelder
- INSERT per Prepared Statement
- DB prüft Constraints (FK, UNIQUE, CHECK)
- Wenn INSERT erfolgreich, eigene ID für neuen Datensatz
- SELECT liest neuen Datensatz
- API gibt ihn als JSON zurück


### Ebene 3: Die Datenbank (MySQL)

Die Datenbank wird über schema.sql definiert.

Darin ist festgelegt:
- welche Tabellen existieren
- welche Beziehungen erlaubt sind