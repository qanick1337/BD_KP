import { runDBCommand } from "../database/connection.js";

export async function createApplication(req, res) {
  const { company_id } = req.user;

  const { candidate_id, vacancy_id, status_id, comment = null } = req.body || {};

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
        message:
          "Вакансія не належить вашій компанії, неможливо додати подання",
      });
    }

    const candidateRows = await runDBCommand(
      "SELECT candidate_id FROM candidate WHERE candidate_id = ?",
      [candidate_id]
    );

    if (!candidateRows.length) {
      return res.status(404).json({
        message: "Кандидата з вказаним ID не знайдено",
      });
    }

    await runDBCommand(
      `
      INSERT INTO application 
        (candidate_id, vacancy_id, application_status_id, comment)
      VALUES (?, ?, ?, ?)
      `,
      [candidate_id, vacancy_id, status_id, comment || null]
    );

    res.status(201).json({ message: "Подання успішно створено" });
  } catch (err) {
    console.error("Error while creating application:", err);
    res.status(500).json({ message: "Failed to create application" });
  }
}

export async function getApplications(req, res) {
  const { company_id } = req.user || {};

  if (!company_id) {
    return res.status(401).json({ message: "Missing company in token" });
  }

  try {
    const rows = await runDBCommand(
      `
      SELECT
        a.application_id,
        a.candidate_id,
        a.vacancy_id,
        a.application_status_id,
        a.comment,
        cand.name AS candidate_name,
        cand.surname AS candidate_surname,
        cand.position AS candidate_position,
        cand.candidate_email,
        cand.phone_number,
        cand.expected_salary,
        city.city_name,
        v.title AS vacancy_title,
        v.vacancy_status_id,
        v.salary_min,
        v.salary_max,
        v.salary_comment,
        vs.vacancy_status_name,
        app_status.application_status_name,
        cu.company_user_id,
        cu.name AS recruiter_name,
        cu.surname AS recruiter_surname
      FROM application a
      JOIN vacancy v ON a.vacancy_id = v.vacancy_id
      JOIN company_user cu ON v.company_user_id = cu.company_user_id
      JOIN candidate cand ON a.candidate_id = cand.candidate_id
      LEFT JOIN city ON cand.city_id = city.city_id
      LEFT JOIN vacancy_status vs ON v.vacancy_status_id = vs.vacancy_status_id
      LEFT JOIN application_status app_status ON a.application_status_id = app_status.application_status_id
      WHERE cu.company_id = ?
      ORDER BY a.application_id DESC
      `,
      [company_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error while loading applications:", err);
    res.status(500).json({ message: "Failed to load applications" });
  }
}

export async function getUserApplications(req, res) {
  const { company_id } = req.user || {};
  const companyUserIdHeader = req.headers["x-company-user-id"];

  if (!company_id) {
    return res.status(401).json({ message: "Missing company in token" });
  }

  if (!companyUserIdHeader) {
    return res.status(400).json({ message: "Missing X-Company-User-Id header" });
  }

  const company_user_id = Number(companyUserIdHeader);
  if (Number.isNaN(company_user_id)) {
    return res.status(400).json({ message: "Invalid company_user_id" });
  }

  try {
    const rows = await runDBCommand(
      `
      SELECT
        a.application_id,
        a.candidate_id,
        a.vacancy_id,
        a.application_status_id,
        a.comment,
        cand.name AS candidate_name,
        cand.surname AS candidate_surname,
        cand.position AS candidate_position,
        cand.candidate_email,
        cand.phone_number,
        cand.expected_salary,
        city.city_name,
        v.title AS vacancy_title,
        v.vacancy_status_id,
        v.salary_min,
        v.salary_max,
        v.salary_comment,
        vs.vacancy_status_name,
        app_status.application_status_name,
        cu.company_user_id,
        cu.name AS recruiter_name,
        cu.surname AS recruiter_surname
      FROM application a
      JOIN vacancy v ON a.vacancy_id = v.vacancy_id
      JOIN company_user cu ON v.company_user_id = cu.company_user_id
      JOIN candidate cand ON a.candidate_id = cand.candidate_id
      LEFT JOIN city ON cand.city_id = city.city_id
      LEFT JOIN vacancy_status vs ON v.vacancy_status_id = vs.vacancy_status_id
      LEFT JOIN application_status app_status ON a.application_status_id = app_status.application_status_id
      WHERE cu.company_id = ? AND cu.company_user_id = ?
      ORDER BY a.application_id DESC
      `,
      [company_id, company_user_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error while loading user applications:", err);
    res.status(500).json({ message: "Failed to load applications" });
  }
}

export async function updateApplication(req, res) {
  const { application_id } = req.params;
  const { company_id } = req.user || {};
  const { status_id, comment = null } = req.body || {};

  if (!company_id) {
    return res.status(401).json({ message: "Missing company in token" });
  }

  const statusIdNum = Number(status_id);
  if (!status_id || Number.isNaN(statusIdNum)) {
    return res.status(400).json({ message: "Invalid status_id" });
  }

  try {
    const rows = await runDBCommand(
      `
      SELECT a.application_id
      FROM application a
      JOIN vacancy v ON a.vacancy_id = v.vacancy_id
      JOIN company_user cu ON v.company_user_id = cu.company_user_id
      WHERE a.application_id = ? AND cu.company_id = ?
      `,
      [application_id, company_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Application not found" });
    }

    const normalizedComment =
      typeof comment === "string" && comment.trim() ? comment.trim() : null;

    await runDBCommand(
      `
      UPDATE application
      SET application_status_id = ?, comment = ?
      WHERE application_id = ?
      `,
      [statusIdNum, normalizedComment, Number(application_id)]
    );

    res.status(200).json({ message: "Application updated" });
  } catch (err) {
    console.error("Error while updating application:", err);
    res.status(500).json({ message: "Failed to update application" });
  }
}
