const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files (like index.html) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize the SQLite database
let db = new sqlite3.Database('./variables.db', (err) => {
  if (err) {
    console.error('Error opening database: ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(
      `CREATE TABLE IF NOT EXISTS variables (
        name TEXT PRIMARY KEY,
        value TEXT
      )`,
      (err) => {
        if (err) {
          console.error('Error creating table: ' + err.message);
        }
      }
    );
  }
});

// API Route to get all variables
app.get('/variables', (req, res) => {
  db.all('SELECT name, value FROM variables', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API Route to get a specific variable by name
app.get('/variables/:name', (req, res) => {
  const { name } = req.params;
  db.get('SELECT value FROM variables WHERE name = ?', [name], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: 'Variable not found' });
      return;
    }
    res.json({ name, value: row.value });
  });
});

// API Route to add or update a variable
app.post('/variables', (req, res) => {
  const { name, value } = req.body;
  if (!name || !value) {
    return res.status(400).json({ error: 'Name and value are required' });
  }
  db.run(
    'INSERT INTO variables (name, value) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET value = excluded.value',
    [name, value],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Variable added/updated', name, value });
    }
  );
});

// API Route to delete a variable
app.delete('/variables/:name', (req, res) => {
  const { name } = req.params;
  db.run('DELETE FROM variables WHERE name = ?', [name], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: 'Variable not found' });
      return;
    }
    res.json({ message: 'Variable deleted' });
  });
});

// Serve index.html at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// // Port configuration
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

app.listen(port, '0.0.0.0', (err) => {
    if (err) {
        console.error('Failed to start server:', err);
        process.exit(1); // Exit with an error code
    }
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
