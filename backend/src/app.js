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


// Legt einen neuen Skill in der Datenbank an
app.post("/skills", async (req, res) => {
  try {
    // Destructuring des Request-Bodys
    // Felder werden vom Client erwartet
    const {
      name,                   // Name des Skills
      category_id_fk,         // Fremdschlüssel zur Kategorie
      current_level,          // aktuelles Level (1-5)
      target_level,           // Ziel-Level (1-5)
      priority = 'Medium',    // optional, default = Medium
      note = null,            // optionale Notiz
    } = req.body;


    // Minimal-Validation - Diese Felder sind zwingend notwendig
    if (!name || !category_id_fk || !current_level || !target_level) {
      // 400 = Bad Request (Client-Fehler)
      return res.status(400).json({
        error: "Missing required fields",
        required: [
          "name", 
          "category_id_fk", 
          "current_level", 
          "target_level"
        ],
      });
    }


    // Insert Query (prepared statement -> sicher gegen SQL Injection)
    const [result] = await pool.query(
      `INSERT INTO skill (name, category_id_fk, current_level, target_level, priority, note)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [name, category_id_fk, current_level, target_level, priority, note]
    );


    // result.insertId enthält die automatisch generierte skill_id.
    // Mit dieser wird der neu angelegte Skill wieder ausgelesen
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
      WHERE s.skill_id = ?`,
      [result.insertId]
    );

    // 201 = Created
    // Neu erstellter Datensatz als JSON zurück geben
    res.status(201).json(rows[0]);


  // Fehlerbehandlung
  } catch (err) {
    
    // UNIQUE Constraint verletzt
    // z.B. gleicher Skill-Name in derselben Kategorie
    if (err.code == "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "Skill already exists in this category",
      });
    }

    // Allgemeiner Server- oder DB-Fehler
    res.status(500).json({
      error: "DB instert failed",
      detail: err.message,
    });
  }     
});

// app.listen startet den HTTP-Server auf dem definierten PORT.
// Die Callback-Funktion läuft einmal beim Start.
app.listen(PORT, () => {
  console.log(`API läuft auf http://localhost:${PORT}`);
});
