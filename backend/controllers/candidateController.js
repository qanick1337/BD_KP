import { runDBCommand } from "../database/connection.js"; 

export async function getAllCandidates(req, res) {

  try {
    const rows = await runDBCommand(
      `
      SELECT 
        cand.candidate_id,
        cand.name,
        cand.surname,
        cand.patronymic,
        cand.sex,
        cand.candidate_email,
        cand.phone_number,
        cand.expected_salary,
        cand.position,
        city.city_name,
        et.employment_type_name
      FROM candidate cand
      JOIN city ON cand.city_id = city.city_id
      JOIN employment_type et ON cand.employment_type_id = et.employment_type_id
      GROUP BY cand.candidate_id
      ORDER BY cand.candidate_id DESC
      `
    );

    res.json(rows);
  } catch (err) {
    console.error("Помилка отримання кандидатів:", err);
    res.status(500).json({ message: "Помилка сервера при отриманні кандидатів" });
  }
}
export async function getCandidateById(req,res) {
  const {candidate_id} = req.params;

  try {
    const rows = await runDBCommand(
      `
      SELECT  
        cand.candidate_id,
        cand.name,
        cand.surname,
        cand.patronymic,
        cand.sex,
        cand.candidate_email,
        cand.phone_number,
        cand.expected_salary,
        cand.position,
        city.city_name,
        et.employment_type_name
      FROM candidate cand
      JOIN city ON cand.city_id = city.city_id
      JOIN employment_type et ON cand.employment_type_id = et.employment_type_id
      WHERE cand.candidate_id = ?;
      `,[candidate_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Кандидата не знайдено" });
    }

    res.json(rows[0]);

  } catch(err) {
    console.error("Помилка отримання кандидата:", err);
    res.status(500).json({ message: "Помилка сервера при отриманні кандидата" });
  }
}
export async function getCandidateExpiriences(req,res) {
  try {
    const rows = await runDBCommand(
      `
      
      `
    );

    res.json(rows);
  } catch (err) {
    console.error("Помилка отримання досвідів кандидатів:", err);
    res.status(500).json({ message: "Помилка сервера при отриманні досвідів кандидата" });
  }
}

export async function getExpiriencesByCandidateId(req,res) {
  const {candidate_id} = req.params;

  try {
    const rows = await runDBCommand(
      `
      SELECT
        exp.position,
          cmp.company_name,
          exp.start_date,
          exp.end_date,
          exp.description
      FROM experience AS exp
      LEFT JOIN company AS cmp ON cmp.company_id = exp.company_id
      WHERE exp.candidate_id = ?;
      `,[candidate_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Досвіди не знайдено" });
    }

    res.json(rows);

  } catch(err) {
    console.error("Помилка отримання досвідів роботи кандидата:", err);
    res.status(500).json({ message: "Помилка сервера при отриманні досвідів роботи кандидата" });
  }
}

export async function getSkillsByCandidateId(req, res) {
  const { candidate_id } = req.params;

  if (!candidate_id) {
    return res.status(400).json({ message: "Не передано candidate_id" });
  }

  try {
    const rows = await runDBCommand(
      `
      SELECT
        skl.skill_id,
        skl.skill_name
      FROM candidate_skill AS cnd_skl 
      LEFT JOIN skill AS skl ON cnd_skl.skill_id = skl.skill_id
      WHERE cnd_skl.candidate_id = ?
      `,
      [candidate_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Помилка при отриманні навичок кандидата:", err);
    res.status(500).json({ message: "Помилка сервера при отриманні навичок" });
  }
}

