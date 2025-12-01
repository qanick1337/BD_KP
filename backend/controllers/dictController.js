import { runDBCommand } from "../database/connection.js";

// 1) Країни
export async function getCountries(req, res) {
  try {
    const rows = await runDBCommand(
      "SELECT country_id, country_name FROM country ORDER BY country_name"
    );
    res.json(rows);
  } catch (err) {
    console.error("Помилка при отриманні списку країн:", err);
    res.status(500).json({ message: "Помилка при отриманні списку країн" });
  }
}

// 2) Міста (опційно з фільтром по country_id: /cities?country_id=1)
export async function getCities(req, res) {
  const { country_id } = req.query;

  try {
    let rows;
    if (country_id) {
      rows = await runDBCommand(
        "SELECT city_id, city_name, country_id FROM city WHERE country_id = ? ORDER BY city_name",
        [country_id]
      );
    } else {
      rows = await runDBCommand(
        "SELECT city_id, city_name, country_id FROM city ORDER BY city_name"
      );
    }

    res.json(rows);
  } catch (err) {
    console.error("Помилка при отриманні списку міст:", err);
    res.status(500).json({ message: "Помилка при отриманні списку міст" });
  }
}

// 3) Типи зайнятості
export async function getEmploymentTypes(req, res) {
  try {
    const rows = await runDBCommand(
      "SELECT employment_type_id, employment_type_name FROM employment_type ORDER BY employment_type_name"
    );
    res.json(rows);
  } catch (err) {
    console.error("Помилка при отриманні типів зайнятості:", err);
    res.status(500).json({ message: "Помилка при отриманні типів зайнятості" });
  }
}

// 4) Категорії
export async function getCategories(req, res) {
  try {
    const rows = await runDBCommand(
      "SELECT category_id, category_name FROM category ORDER BY category_name"
    );
    res.json(rows);
  } catch (err) {
    console.error("Помилка при отриманні категорій:", err);
    res.status(500).json({ message: "Помилка при отриманні категорій" });
  }
}

// 5) Скіли
export async function getSkills(req, res) {
  try {
    const rows = await runDBCommand(
      "SELECT skill_id, skill_name FROM skill ORDER BY skill_name"
    );
    res.json(rows);
  } catch (err) {
    console.error("Помилка при отриманні навичок (skills):", err);
    res.status(500).json({ message: "Помилка при отриманні навичок" });
  }
}

export async function createSkill(req, res) {
  const { skill_name } = req.body;

  if (!skill_name || !skill_name.trim()) {
    return res.status(400).json({ message: "Назва навички обов'язкова" });
  }

  try {
    // Перевіряємо, чи така навичка вже існує
    const exists = await runDBCommand(
      "SELECT skill_id FROM skill WHERE skill_name = ?",
      [skill_name.trim()]
    );

    if (exists.length) {
      return res
        .status(400)
        .json({ message: "Така навичка вже існує" });
    }

    // Додаємо нову навичку
    const result = await runDBCommand(
      "INSERT INTO skill (skill_name) VALUES (?)",
      [skill_name.trim()]
    );

    res.status(201).json({
      message: "Навичку успішно додано",
      skill_id: result.insertId,
      skill_name: skill_name.trim(),
    });
  } catch (err) {
    // ловимо дубль ще й на рівні БД, про всяк випадок
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ message: "Така навичка вже існує" });
    }

    console.error("Помилка при створенні навички:", err);
    res.status(500).json({ message: "Помилка при створенні навички" });
  }
}

// 6) Статуси вакансій
export async function getVacancyStatuses(req, res) {
  try {
    const rows = await runDBCommand(
      "SELECT vacancy_status_id, vacancy_status_name FROM vacancy_status ORDER BY vacancy_status_name"
    );
    res.json(rows);
  } catch (err) {
    console.error("Помилка при отриманні статусів вакансій:", err);
    res.status(500).json({ message: "Помилка при отриманні статусів вакансій" });
  }
}

// 7) Статуси заявок (application)
export async function getApplicationStatuses(req, res) {
  try {
    const rows = await runDBCommand(
      "SELECT application_status_id, application_status_name FROM application_status ORDER BY application_status_name"
    );
    res.json(rows);
  } catch (err) {
    console.error("Помилка при отриманні статусів заявок:", err);
    res.status(500).json({ message: "Помилка при отриманні статусів заявок" });
  }
}
