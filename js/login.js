document.addEventListener('DOMContentLoaded', () => {
    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const user = {
                username: document.getElementById('loginUsername').value,
                password: document.getElementById('loginPassword').value
            };

            try {
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                });

                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('gameRecToken', data.token);
                    window.location.href = 'index.html';
                } else {
                    alert(data.error || 'Login failed');
                }
            } catch (error) {
                alert('Error connecting to server');
            }
        });
    }
});

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// In-memory user storage; replace with a database in production
const users = [];

// User registration endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  // Check if the user already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ error: 'User already exists.' });
  }

  try {
    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Save the new user
    users.push({ username, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// User login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  // Find the user in the storage
  const user = users.find(user => user.username === username);
  if (!user) {
    return res.status(400).json({ error: 'User not found.' });
  }

  try {
    // Compare the provided password with the hashed password stored
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password.' });
    }

    // Generate a JWT; in production, store your secret key in an environment variable
    const token = jwt.sign({ username: user.username }, 'secret_key', { expiresIn: '1h' });
    res.json({ message: 'Login successful.', token });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});