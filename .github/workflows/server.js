// Import required modules
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;  // Use environment PORT or default to 5000

// In-memory database to store variables
let variables = {
  "var1": "initial_value",
  "var2": 123,
  "var3": true
};

// Middleware to parse JSON bodies
app.use(express.json());

// Route to fetch all variables
app.get('/variables', (req, res) => {
  try {
    res.json({ success: true, data: variables });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching variables', error });
  }
});

// Route to update a specific variable
app.post('/variables', (req, res) => {
  const { key, value } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({ success: false, message: 'Invalid request. Provide key and value.' });
  }

  try {
    variables[key] = value;  // Update or create variable
    res.json({ success: true, message: `Variable ${key} updated.`, data: variables });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating variable', error });
  }
});

// Route to delete a specific variable
app.delete('/variables', (req, res) => {
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ success: false, message: 'Invalid request. Provide key to delete.' });
  }

  try {
    if (variables[key] !== undefined) {
      delete variables[key];
      res.json({ success: true, message: `Variable ${key} deleted.`, data: variables });
    } else {
      res.status(404).json({ success: false, message: `Variable ${key} not found.` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting variable', error });
  }
});

// Start the server and listen on the specified port
app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);  // Exit with an error code if server fails to start
  } else {
    console.log(`Server is running on http://0.0.0.0:${port}`);
  }
});
