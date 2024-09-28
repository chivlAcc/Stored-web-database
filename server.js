const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 5000;

// Create or open the database
const db = new sqlite3.Database('variables.db');

// Middleware to parse JSON requests
app.use(express.json());

// Create a table if not exists
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS variables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        value TEXT
    )`);
});

// API to get all variables
app.get('/variables', (req, res) => {
    db.all("SELECT * FROM variables", [], (err, rows) => {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        res.json(rows);
    });
});

// API to get a variable by name
app.get('/variables/:name', (req, res) => {
    const name = req.params.name;
    db.get("SELECT * FROM variables WHERE name = ?", [name], (err, row) => {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({message: "Variable not found"});
        }
    });
});

// API to create or update a variable
app.post('/variables', (req, res) => {
    const { name, value } = req.body;
    db.run("INSERT OR REPLACE INTO variables (name, value) VALUES (?, ?)", [name, value], function(err) {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        res.json({message: "Variable created/updated", id: this.lastID});
    });
});

// API to delete a variable
app.delete('/variables/:name', (req, res) => {
    const name = req.params.name;
    db.run("DELETE FROM variables WHERE name = ?", [name], function(err) {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (this.changes) {
            res.json({message: "Variable deleted"});
        } else {
            res.status(404).json({message: "Variable not found"});
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
