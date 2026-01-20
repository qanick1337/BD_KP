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

export async function getApplicationsStatsByCompanyId(req, res) {
  const { company_id } = req.user;
  try {
    const rows = await runDBCommand(
      `
        SELECT 
            st.application_status_name AS status,
            COUNT(a.application_id) AS total_applications
        FROM application_status st
        LEFT JOIN application a 
            ON a.application_status_id = st.application_status_id
        LEFT JOIN vacancy v
            ON v.vacancy_id = a.vacancy_id
        LEFT JOIN company_user cu
            ON cu.company_user_id = v.company_user_id
        LEFT JOIN company c
            ON c.company_id = cu.company_id
        WHERE c.company_id = ?
        GROUP BY st.application_status_id, st.application_status_name
        ORDER BY total_applications DESC;
      `, [company_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Помилка отримання очікувань кандидитів по зарплаті", err);
    res.status(500).json({ message: "Помилка сервера при зарплатних очікувань кандидатів" });
  }
}

export async function getUsersStatsByCompanyId(req, res) {
  const { company_id } = req.user;

  try {
    const rows = await runDBCommand(
      `
      SELECT 
          cu.company_user_id,
          cu.name,
          cu.surname,
          COUNT(DISTINCT v.vacancy_id) AS vacancies_created,
          COUNT(a.application_id) AS applications_received
      FROM company_user cu
      LEFT JOIN vacancy v
          ON v.company_user_id = cu.company_user_id
      LEFT JOIN application a
          ON a.vacancy_id = v.vacancy_id
      WHERE cu.company_id = ?
      GROUP BY 
          cu.company_user_id,
          cu.name,
          cu.surname
      ORDER BY vacancies_created DESC, applications_received DESC;
      `,
      [company_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Помилка отримання статистики HR:", err);
    res.status(500).json({ message: "Помилка сервера при отриманні статистики HR" });
  }
}
