import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "tamsynling",
  host: "localhost",
  database: "journal_app",
  password: "yourpassword",
  port: 5432,
});

export default pool;