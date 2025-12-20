// Lädt Variablen aus der .env Datei (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
require("dotenv").config();

// mysql2 stellt einen MySQL-Client zur Verfügung
const mysql = require("mysql2/promise");

// Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // Defaults
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

// Testfunktion, um die Verbindung zu prüfen
async function testConnection() {
    try {
        const conn = await pool.getConnection();
        console.log("MySQL Verbindung erfolgreich");
        conn.release();
    } catch (err) {
        console.error("MySQL Verbindungsfehler", err.message);
        process.exit(1);
    }
}

// Testet Verbindung
testConnection();

// Initialisiert DB und exportiert Pool für spätere Queries
module.exports = pool;