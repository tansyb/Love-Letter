import express from "express";
import pool from "./db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const SECRET = "supersecret";
app.use(express.json());

// testing db connection 
app.get("/test-db", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows);
});

// testing server connection 
app.listen(3001, "0.0.0.0", () => {
  console.log("Server running on port 3001");
});

// middleware security 
function authenticateToken(req, res, next) {

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  jwt.verify(token, SECRET, (err, user) => {

    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = user;
    next();

  });

}

// sign up route 
app.post("/signup", async (req, res) => {
    console.log("Signup route hit", req.body);

  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {

    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING id",
      [email, hashedPassword]
    );

    res.json({ userId: result.rows[0].id });

  } catch (err) {

    res.status(400).json({ error: "User already exists" });

  }

});

// login route
app.post("/login", async (req, res) => {

  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({ error: "Invalid login" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ error: "Invalid login" });
  }

  const token = jwt.sign({ userId: user.id }, SECRET);

  res.json({ token });

});

// profile route, Returns basic info about the logged-in user
app.get("/profile", authenticateToken, async (req, res) => {

  const result = await pool.query(
    "SELECT id, email FROM users WHERE id=$1",
    [req.user.userId]
  );

  res.json(result.rows[0]);

});