import { runDBCommand } from "../database/connection.js";

export async function getAllCountries(req, res) {
  try {
    const query = "SELECT * FROM country";
    const data = await runDBCommand(query);
    res.json(data); 
  } catch (error) {
    console.error("Помилка при отриманні країн:", error);
    res.status(500).json({ message: "Помилка на сервері" });
  }
}
