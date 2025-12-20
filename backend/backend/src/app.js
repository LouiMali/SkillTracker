// Express ist ein Framework für Node.js,
// HTTP-Server und API-Routen werden damit erstellt
const express = require("express");

// Express-Applikation wird erstellt
const app = express();

// Port für den Server.
// Wird verwendet, falls keine Umgebungsvariable PORT gesetzt ist
const PORT = process.env.PORT || 3000;

// Middleware:
// Falls Anfrage JSON im Body enthält, automatisch parsen
// und im req.body ablegen
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