import express from "express";
import pool from "./db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
const SECRET = "supersecret";
app.use(express.json());
app.use(cors());

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

  const token = jwt.sign(
  { userId: user.id },
  SECRET,
  { expiresIn: "1h" });

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


// adding a new entry 
app.post("/entries", authenticateToken, async (req, res) => {

  const { date, content } = req.body;

  try {

    const result = await pool.query(
      `INSERT INTO entries (user_id, date, content)
       VALUES ($1,$2,$3)
       ON CONFLICT (user_id, date)
       DO UPDATE SET content = EXCLUDED.content
       RETURNING *`,
      [req.user.userId, date, content]
    );

    res.json(result.rows[0]);

  } catch (err) {

    res.status(400).json({ error: "Could not save entry" });

  }

});

// get entry by date 
app.get("/entries", authenticateToken, async (req, res) => {
  const { date } = req.query;

  try {
    const result = await pool.query(
      "SELECT * FROM entries WHERE user_id=$1 AND date=$2",
      [req.user.userId, date]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(400).json({ error: "Could not fetch entry" });
  }
});

// get latest entry 
app.get("/entries/latest", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM entries WHERE user_id=$1 ORDER BY date DESC LIMIT 1",
      [req.user.userId]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(400).json({ error: "Could not fetch latest entry" });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong on the server" });
});