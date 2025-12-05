import { runDBCommand } from "../database/connection.js"; 

export async function getPopularCitiesStat(req, res) {

  try {
    const rows = await runDBCommand(
      `
        SELECT 
            c.city_name,
            COUNT(cd.candidate_id) AS candidate_count
        FROM city AS c
        LEFT JOIN candidate AS cd 
            ON cd.city_id = c.city_id
        GROUP BY c.city_id, c.city_name
        ORDER BY candidate_count DESC;
      `
    );

    res.json(rows);
  } catch (err) {
    console.error("Помилка отримання найпопулярніших міст:", err);
    res.status(500).json({ message: "Помилка сервера при отриманні найпоплууряніших міст" });
  }
}

export async function getCitySalaryExpectation(req, res) {

  try {
    const rows = await runDBCommand(
      `
        SELECT city.city_name, AVG(c.expected_salary) AS avg_salary
        FROM candidate AS c
        JOIN city ON city.city_id = c.city_id
        GROUP BY city.city_id
        ORDER BY avg_salary DESC;
      `
    );

    res.json(rows);
  } catch (err) {
    console.error("Помилка отримання очікувань кандидитів по зарплаті", err);
    res.status(500).json({ message: "Помилка сервера при зарплатних очікувань кандидатів" });
  }
}