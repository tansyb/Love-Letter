import express from "express";
import pool from "./db/db.js";

const app = express();

app.get("/test-db", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows);
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});