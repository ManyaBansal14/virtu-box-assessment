const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(cors());

// Database
const db = new sqlite3.Database("./db.sqlite");

// Tables
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  userId INTEGER
)`);

// ================= AUTH =================

// Signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("All fields required");

  const hashed = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashed],
    function (err) {
      if (err) return res.status(400).send("User already exists");
      res.send("Signup successful");
    }
  );
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email=?", [email], async (err, user) => {
    if (!user) return res.status(400).send("User not found");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send("Invalid password");

    res.json({ message: "Login successful", userId: user.id });
  });
});

// ================= CRUD =================

// Create item
app.post("/items", (req, res) => {
  const { title, userId } = req.body;
  db.run(
    "INSERT INTO items (title, userId) VALUES (?, ?)",
    [title, userId],
    () => res.send("Item added")
  );
});

// Read items
app.get("/items/:userId", (req, res) => {
  db.all(
    "SELECT * FROM items WHERE userId=?",
    [req.params.userId],
    (err, rows) => res.json(rows)
  );
});

// Update item
app.put("/items/:id", (req, res) => {
  db.run(
    "UPDATE items SET title=? WHERE id=?",
    [req.body.title, req.params.id],
    () => res.send("Item updated")
  );
});

// Delete item
app.delete("/items/:id", (req, res) => {
  db.run("DELETE FROM items WHERE id=?", [req.params.id], () =>
    res.send("Item deleted")
  );
});

app.listen(5000, () => console.log("Backend running on port 5000"));
