// Datenbank-Verbindung initialisieren + Test ausführen
// Pool importieren, um Queries zu machen
const pool = require("./db");

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

// Route reagiert auf HTTP GET Anfragen an /health.
// Testet, ob der Server läuft
app.get("/health", (req, res) => {
  // Schickt eine JSON-Antwort zurück
  // status: "ok" -> Server lebt
  // time -> aktuelle Serverzeit (ISO-Format)
  res.json({
    status: "ok",
    time: new Date().toISOString(),
  });
});

app.get("/skills", async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
         s.skill_id,
         s.name,
         c.name AS category,
         s.current_level,
         s.target_level,
         s.priority,
         s.note,
         s.created_at
       FROM skill s
       JOIN category c ON c.category_id = s.category_id_fk
       ORDER BY c.name, s.name;`
        );
        
        res.json(rows);
    }   catch (err) {
        res.status(500).json({error: "DB query failed", detail: err.message });

    }
});


// app.listen startet den HTTP-Server auf dem definierten PORT.
// Die Callback-Funktion läuft einmal beim Start.
app.listen(PORT, () => {
  console.log(`API läuft auf http://localhost:${PORT}`);
});
