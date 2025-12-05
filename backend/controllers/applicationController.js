import { runDBCommand } from "../database/connection.js";

export async function createApplication(req, res) {
  const { company_id } = req.user;

  const {
    candidate_id,
    vacancy_id,
    status_id,
    comment = null,
  } = req.body || {};

  try {
    const vacancyRows = await runDBCommand(
      `
      SELECT v.vacancy_id
      FROM vacancy v
      JOIN company_user cu ON v.company_user_id = cu.company_user_id
      WHERE v.vacancy_id = ? AND cu.company_id = ?
      `,
      [vacancy_id, company_id]
    );

    if (!vacancyRows.length) {
      return res.status(403).json({
        message: "Вакансію не знайдено або вона не належить вашій компанії",
      });
    }

    const candidateRows = await runDBCommand(
      "SELECT candidate_id FROM candidate WHERE candidate_id = ?",
      [candidate_id]
    );

    if (!candidateRows.length) {
      return res.status(404).json({
        message: "Кандидата з таким ID не знайдено",
      });
    }

    // Створюємо нову заявку
    const result = await runDBCommand(
      `
      INSERT INTO application 
        (candidate_id, vacancy_id, application_status_id, comment)
      VALUES (?, ?, ?, ?)
      `,
      [
        candidate_id,
        vacancy_id,
        status_id,
        comment || null,
      ]
    );

    res.status(201).json({message: "Заявку успішно створено"});
  } catch (err) {
    console.error("Помилка при створенні подання:", err);
    res.status(500).json({ message: "Помилка сервера при створенні подання" });
  }
}
