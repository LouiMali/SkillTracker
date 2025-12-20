// Datenbank-Verbindung initialisieren (Test läuft beim Import)
require("./db");

// Express ist ein Framework für Node.js,
// Baut HTTP-Server und API-Routen auf
const express = require("express");

// Erzeugt eine Express-Applikation
const app = express();

// Verwendet Umgebungsvariable PORT, sonst 3000
const PORT = process.env.PORT || 3000;

// Parsed Anfragen im JSON Body automatisch und legt sie im req.body ab
// Für Anfragen mit JSON im Body
app.use(express.json());

// --------------------------------------------
// HEALTHCHECK-ENDPOINT
// --------------------------------------------
// Diese Route reagiert auf HTTP GET Anfragen an /health.
// Zweck:
// - Testen, ob der Server läuft
// - Wird oft von Monitoring / Load Balancern verwendet
app.get("/health", (req, res) => {
  // Wir schicken eine JSON-Antwort zurück
  // status: "ok" -> Server lebt
  // time -> aktuelle Serverzeit (ISO-Format)
  res.json({
    status: "ok",
    time: new Date().toISOString(),
  });
});

// --------------------------------------------
// SERVER STARTEN
// --------------------------------------------
// app.listen startet den HTTP-Server.
// Er hört auf dem definierten PORT.
// Die Callback-Funktion läuft einmal beim Start.
app.listen(PORT, () => {
  console.log(`API läuft auf http://localhost:${PORT}`);
});
