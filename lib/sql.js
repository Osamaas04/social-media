import sql from "mssql";

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_USER,
  options: {
    encrypt: false,
    enableArithAbort: true,
    trustServerCertificate: true,
  },
};

let pool;

export async function getConnection() {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log("✅ Connected to SQL Server");
    }
    return pool;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    throw err;
  }
}
