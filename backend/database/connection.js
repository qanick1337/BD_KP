import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

const connections = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export function runDBCommand(sqlQuery, params = []) {
  return new Promise((resolve, reject) => {
    connections.query(sqlQuery, params, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}
