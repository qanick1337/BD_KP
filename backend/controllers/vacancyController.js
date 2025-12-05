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

export async function getVacancyById(req, res) {
  const { vacancy_id } = req.params;
  const { company_id } = req.user || {};

  if (!company_id) {
    return res.status(401).json({ message: "Missing company in token" });
  }

  try {
    const vacancyRows = await runDBCommand(
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
         c.country_id
       FROM vacancy v
       JOIN company_user cu ON v.company_user_id = cu.company_user_id
       JOIN city c ON v.city_id = c.city_id
       WHERE v.vacancy_id = ? AND cu.company_id = ?`,
      [vacancy_id, company_id]
    );

    if (!vacancyRows.length) {
      return res.status(404).json({ message: "Vacancy not found" });
    }

    const categories = await runDBCommand(
      "SELECT category_id FROM vacancy_category WHERE vacancy_id = ?",
      [vacancy_id]
    );

    const skills = await runDBCommand(
      `SELECT vs.skill_id, s.skill_name
       FROM vacancy_skill vs
       JOIN skill s ON vs.skill_id = s.skill_id
       WHERE vs.vacancy_id = ?`,
      [vacancy_id]
    );

    res.json({
      ...vacancyRows[0],
      category_ids: categories.map((c) => Number(c.category_id)),
      skills: skills.map((s) => ({
        skill_id: Number(s.skill_id),
        skill_name: s.skill_name,
      })),
    });
  } catch (err) {
    console.error(`Error fetching vacancy ${vacancy_id}:`, err);
    res.status(500).json({ message: "Failed to load vacancy" });
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
         v.created_at,
         c.city_name,
         ctry.country_name,
         et.employment_type_name,
         vs.vacancy_status_name,
         cu.name,
         cu.surname
       FROM vacancy v
       JOIN company_user cu ON v.company_user_id = cu.company_user_id
       JOIN city c ON v.city_id = c.city_id
       JOIN country ctry ON c.country_id = ctry.country_id
       JOIN employment_type et ON v.employment_type_id = et.employment_type_id
       JOIN vacancy_status vs ON v.vacancy_status_id = vs.vacancy_status_id
       WHERE cu.company_id = ?
       ORDER BY v.vacancy_id DESC`,
      [company_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Помилка під час отримання вакансій компанії:", err);
    res.status(500).json({ message: "Помилка завантаження вакансій" });
  }
}

export async function getUserVacancies(req, res) {
  const companyUserIdHeader = req.headers["x-company-user-id"];

  if (!companyUserIdHeader) {
    return res.status(400).json({ message: "Не передано company_user_id в заголовку" });
  }

  const company_user_id = Number(companyUserIdHeader);
  if (Number.isNaN(company_user_id)) {
    return res.status(400).json({ message: "company_user_id має бути числом" });
  }

  try {
    const rows = await runDBCommand(
      `SELECT 
         v.vacancy_id,
         v.title,
         et.employment_type_name,
         vs.vacancy_status_name,
         v.salary_min,
         v.salary_max,
         v.salary_comment,
         v.description,
         v.created_at,
         c.city_name,
         ctry.country_name,
         cu.name,
         cu.surname
       FROM vacancy v
       JOIN city c ON v.city_id = c.city_id
       JOIN country ctry ON c.country_id = ctry.country_id
       JOIN employment_type et ON v.employment_type_id = et.employment_type_id
       JOIN vacancy_status vs ON v.vacancy_status_id = vs.vacancy_status_id
       JOIN company_user cu ON v.company_user_id = cu.company_user_id
       WHERE
        v.company_user_id = ?
       ORDER BY v.vacancy_id DESC`,
      [company_user_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Помилка під час отримання вакансій:", err);
    res.status(500).json({ message: "Помилка при завантаженні вакансій" });
  }
}

export async function deleteVacancy(req, res) {
  const { vacancy_id } = req.params;
  const { company_id } = req.user; 

  if (!company_id) {
    return res.status(401).json({ message: "Missing company in token" });
  }

  try {
    const vacancy = await runDBCommand(
      `SELECT v.vacancy_id
       FROM vacancy v
       JOIN company_user cu ON v.company_user_id = cu.company_user_id
       WHERE v.vacancy_id = ? AND cu.company_id = ?`,
      [vacancy_id, company_id]
    );

    if (!vacancy.length) {
      return res.status(404).json({
        message: "Вакансію не знайдено або у вас немає прав на її видалення",
      });
    }

    await runDBCommand(
      "DELETE FROM vacancy WHERE vacancy_id = ?",
      [vacancy_id]
    );

    res.status(200).json({
      message: `Вакансію ${vacancy_id} успішно видалено`,
    });

  } catch (err) {
    console.error("Помилка при видаленні вакансії:", err);
    res.status(500).json({ message: "Помилка сервера при видаленні вакансії" });
  }
}

export async function updateVacancyById(req, res) {
  const { vacancy_id } = req.params;
  const { company_id } = req.user || {};

  if (!company_id) {
    return res.status(401).json({ message: "Missing company in token" });
  }

  const {
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

  if (!Array.isArray(category_ids) || category_ids.length === 0) {
    return res
      .status(400)
      .json({ message: "Оберіть принаймні одну категорію" });
  }

  try {
    const vacancyOwner = await runDBCommand(
      `SELECT v.vacancy_id
       FROM vacancy v
       JOIN company_user cu ON v.company_user_id = cu.company_user_id
       WHERE cu.company_id = ?`,
      [ company_id]
    );

    if (!vacancyOwner.length) {
      return res.status(404).json({
        message: "Вакансію не знайдено або у вас немає прав на її редагування",
      });
    }

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

    await runDBCommand(
      `UPDATE vacancy
       SET 
         title = ?,
         city_id = ?,
         employment_type_id = ?,
         vacancy_status_id = ?,
         salary_min = ?,
         salary_max = ?,
         salary_comment = ?,
         description = ?
       WHERE vacancy_id = ?`,
      [
        title.trim(),
        Number(city_id),
        Number(employment_type_id),
        Number(vacancy_status_id),
        Number(salary_min) || 0,
        Number(salary_max) || 0,
        salary_comment || null,
        description.trim(),
        Number(vacancy_id),
      ]
    );


    await runDBCommand(
      "DELETE FROM vacancy_category WHERE vacancy_id = ?",
      [vacancy_id]
    );
    await runDBCommand(
      "DELETE FROM vacancy_skill WHERE vacancy_id = ?",
      [vacancy_id]
    );

    for (const categoryId of category_ids) {
      await runDBCommand(
        "INSERT INTO vacancy_category (vacancy_id, category_id) VALUES (?, ?)",
        [Number(vacancy_id), Number(categoryId)]
      );
    }

    for (const skillId of allSkillIds) {
      await runDBCommand(
        "INSERT INTO vacancy_skill (vacancy_id, skill_id) VALUES (?, ?)",
        [Number(vacancy_id), Number(skillId)]
      );
    }

    res.status(200).json({
      message: "Вакансію успішно оновлено",
      vacancy_id: Number(vacancy_id),
      skill_ids: allSkillIds,
      category_ids,
    });
  } catch (err) {
      console.error(`Помилка при оновленні вакансії ${req.params.vacancy_id}:`, err);
      res.status(500).json({ message: "Помилка на сервері при оновленні вакансії" });
  }
}

export async function getSkillsByVacancyId(req, res) {
  const { vacancy_id } = req.params;

  if (!vacancy_id) {
    return res.status(400).json({ message: "Не передано vacancy_id" });
  }

  try {
    const rows = await runDBCommand(
      `
      SELECT 
        skl.skill_id,
        skl.skill_name
      FROM vacancy_skill AS v_skl
      LEFT JOIN skill AS skl ON v_skl.skill_id = skl.skill_id
      WHERE v_skl.vacancy_id = ?
      `,
      [vacancy_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Помилка при отриманні навичок вакансії:", err);
    res.status(500).json({ message: "Помилка сервера при отриманні навичок вакансії" });
  }
}
