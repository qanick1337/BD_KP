import { runDBCommand } from "../database/connection.js";

export async function createVacancy(req, res) {
  const {
    company_user_id,
    title,
    city_id,
    employment_type_id,
    vacancy_status_id,
    salary_min = 0,
    salary_max = 0,
    salary_comment = null,
    description,
    category_ids = [],
    skill_ids = [],
    new_skills = [],
  } = req.body || {};

  if (!company_user_id) {
    return res.status(401).json({ message: "Missing user info " });
  }
  if (!title?.trim() || !city_id || !description?.trim()) {
    return res
      .status(400)
      .json({ message: "Required fields: title, city_id, description" });
  }
  if (!Array.isArray(category_ids) || category_ids.length === 0) {
    return res
      .status(400)
      .json({ message: "Select at least one category" });
  }

  try {
    const createdSkillIds = [];
    const normalizedNewSkills = Array.isArray(new_skills)
      ? new_skills
          .map((name) => (typeof name === "string" ? name.trim() : ""))
          .filter(Boolean)
      : [];

    for (const skillName of normalizedNewSkills) {
      const existing = await runDBCommand(
        "SELECT skill_id FROM skill WHERE LOWER(skill_name) = LOWER(?) LIMIT 1",
        [skillName]
      );

      if (existing.length) {
        createdSkillIds.push(existing[0].skill_id);
        continue;
      }

      const result = await runDBCommand(
        "INSERT INTO skill (skill_name) VALUES (?)",
        [skillName]
      );
      createdSkillIds.push(result.insertId);
    }

    const allSkillIds = Array.from(
      new Set([...(Array.isArray(skill_ids) ? skill_ids : []), ...createdSkillIds])
    );

    const insertResult = await runDBCommand(
      `INSERT INTO vacancy 
        (company_user_id, title, city_id, employment_type_id, vacancy_status_id, salary_min, salary_max, salary_comment, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_user_id,
        title.trim(),
        Number(city_id),
        Number(employment_type_id),
        Number(vacancy_status_id),
        Number(salary_min) || 0,
        Number(salary_max) || 0,
        salary_comment || null,
        description.trim(),
      ]
    );

    const vacancyId = insertResult.insertId;

    for (const categoryId of category_ids) {
      await runDBCommand(
        "INSERT INTO vacancy_category (vacancy_id, category_id) VALUES (?, ?)",
        [vacancyId, Number(categoryId)]
      );
    }

    for (const skillId of allSkillIds) {
      await runDBCommand(
        "INSERT INTO vacancy_skill (vacancy_id, skill_id) VALUES (?, ?)",
        [vacancyId, Number(skillId)]
      );
    }

    res.status(201).json({
      message: "Vacancy created",
      vacancy_id: vacancyId,
      skill_ids: allSkillIds,
    });
  } catch (err) {
    console.error("Error while creating vacancy:", err);
    res.status(500).json({ message: "Failed to create vacancy" });
  }
}

export async function getCompanyVacancies(req, res) {
  const { company_id } = req.user || {};

  if (!company_id) {
    return res.status(401).json({ message: "Missing company in token" });
  }

  try {
    const rows = await runDBCommand(
      `SELECT 
         v.vacancy_id,
         v.title,
         v.city_id,
         v.employment_type_id,
         v.vacancy_status_id,
         v.salary_min,
         v.salary_max,
         v.salary_comment,
         v.description,
         c.city_name,
         ctry.country_name,
         et.employment_type_name,
         vs.vacancy_status_name
       FROM vacancy v
       JOIN city c ON v.city_id = c.city_id
       JOIN country ctry ON c.country_id = ctry.country_id
       JOIN employment_type et ON v.employment_type_id = et.employment_type_id
       JOIN vacancy_status vs ON v.vacancy_status_id = vs.vacancy_status_id
       WHERE v.company_id = ?
       ORDER BY v.vacancy_id DESC`,
      [company_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Помилка під час отримання вакансій:", err);
    res.status(500).json({ message: "Примлка при завантажені вакансій" });
  }
}
