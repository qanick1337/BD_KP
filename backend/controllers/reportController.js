import PDFDocument from "pdfkit";
import { runDBCommand } from "../database/connection.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function downloadCandidatePdf(req, res) {
  const { candidate_id } = req.params;

    function formatMonthYear(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    const month = d.toLocaleString("uk-UA", { month: "2-digit" });
    const year = d.getFullYear();
    return `${month}.${year}`;
  }
  try {
    // 1. Основна інформація про кандидата
    const candidateRows = await runDBCommand(
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
      `,
      [candidate_id]
    );

    if (!candidateRows.length) {
      return res.status(404).json({ message: "Кандидата не знайдено" });
    }

    const candidate = candidateRows[0];

    // 2. Досвіди
    const experiences = await runDBCommand(
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
      `,
      [candidate_id]
    );

    // 3. Навички
    const skills = await runDBCommand(
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

    // 4. Налаштовуємо заголовки відповіді
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="candidate_${candidate_id}.pdf"`
    );

    // 5. Створюємо PDF-документ
    const doc = new PDFDocument({
      margin: 50,
    });

    // Пайпимо PDF одразу в відповідь
    doc.pipe(res);

    // 6. Підключаємо шрифт з кирилицею
    // Поклади, наприклад, DejaVuSans.ttf у /fonts і вкажи шлях:
    const fontPath = path.join(__dirname, "..", "fonts", "DejaVuSans.ttf");
    doc.font(fontPath);

    // 7. Заголовок
    doc
      .fontSize(20)
      .text(`Кандидат: ${candidate.surname} ${candidate.name} ${candidate.patronymic || ""}`, {
        align: "left",
      })
      .moveDown();

    // 8. Основна інформація
    doc.fontSize(12);
    doc.text(`Позиція: ${candidate.position}`);
    doc.text(`Місто: ${candidate.city_name}`);
    doc.text(`Тип зайнятості: ${candidate.employment_type_name}`);
    doc.text(`Стать: ${candidate?.sex?.toLowerCase() === "male"
      ? "Чоловік"
      : candidate?.sex?.toLowerCase() === "female"
      ? "Жінка"
      :  "—"}`);
    doc.text(`E-mail: ${candidate.candidate_email}`);
    doc.text(`Телефон: ${candidate.phone_number || "—"}`);
    doc.text(
      `Очікувана зарплата: ${
        candidate.expected_salary ? candidate.expected_salary + " ГРН" : "Не вказано"
      }`
    );

    doc.moveDown();

    // 9. Навички
    doc.fontSize(14).text("Навички", { underline: true });
    doc.moveDown(0.5);

    if (skills.length) {
      const skillsList = skills.map((s) => s.skill_name).join(", ");
      doc.fontSize(12).text(skillsList);
    } else {
      doc.fontSize(12).text("Навички не вказано");
    }

    doc.moveDown();

    // 10. Досвід роботи
    doc.fontSize(14).text("Досвід роботи", { underline: true });
    doc.moveDown(0.5);

    if (experiences.length) {
      experiences.forEach((exp, index) => {
        doc
          .fontSize(12)
          .text(
            `${index + 1}. ${exp.position} — ${exp.company_name || "Компанія не вказана"}`,
            { continued: false }
          );
        doc
          .fontSize(10)
          .text(
            `Період: ${formatMonthYear(exp.start_date) || "?"} — ${formatMonthYear(exp.end_date) || "нині"}`
          );
        if (exp.description) {
          doc.fontSize(10).text(`Опис: ${exp.description}`);
        }
        doc.moveDown();
      });
    } else {
      doc.fontSize(12).text("Досвіди не знайдено");
    }

    // 11. Дата створення звіту
    doc.fontSize(14).text("Звіт створено", { underline: true });
    doc.moveDown(0.5);
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0];

    doc.fontSize(12).text(formattedDate);

    // 12. Завершуємо документ
    doc.end();
  } catch (err) {
    console.error("Помилка формування PDF кандидата:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Помилка сервера при формуванні PDF" });
    }
  }
}

export async function downloadActiveVacanciesReport(req, res) {
  const { company_id } = req.user || {};

  if (!company_id) {
    return res.status(401).json({ message: "Missing company in token" });
  }

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  try {
    const rows = await runDBCommand(
      `
      SELECT
          v.vacancy_id,
          v.title,
          v.created_at,
          v.description,
          CONCAT(cu.name, ' ', cu.surname) AS created_by,
          GROUP_CONCAT(DISTINCT s.skill_name ORDER BY s.skill_name SEPARATOR ', ') AS skills,
          GROUP_CONCAT(DISTINCT c.category_name ORDER BY c.category_name SEPARATOR ', ') AS categories
      FROM vacancy v
      JOIN company_user cu ON v.company_user_id = cu.company_user_id
      JOIN vacancy_status vs ON v.vacancy_status_id = vs.vacancy_status_id
      LEFT JOIN vacancy_skill vsk ON vsk.vacancy_id = v.vacancy_id
      LEFT JOIN skill s ON s.skill_id = vsk.skill_id
      LEFT JOIN vacancy_category vc ON vc.vacancy_id = v.vacancy_id
      LEFT JOIN category c ON c.category_id = vc.category_id
      WHERE cu.company_id = ?
        AND (
          vs.vacancy_status_name LIKE 'Active%' OR
          vs.vacancy_status_name LIKE 'Актив%'
        )
      GROUP BY v.vacancy_id, v.title, v.created_at, v.description, created_by
      ORDER BY v.created_at DESC;
      `,
      [company_id]
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="active_vacancies_report.pdf"'
    );

    const doc = new PDFDocument({
      margin: 50,
    });

    doc.pipe(res);

    const fontPath = path.join(__dirname, "..", "fonts", "DejaVuSans.ttf");
    doc.font(fontPath);

    doc.fontSize(20).text("Звіт активних вакансій компанії", { align: "left" });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(`Згенеровано: ${formatDate(new Date()) || ""}`);
    doc.moveDown();

    if (!rows.length) {
      doc.fontSize(12).text("Не знайдено активних вакансій.");
      doc.end();
      return;
    }

    rows.forEach((row, index) => {
      doc.fontSize(14).text(`${index + 1}. ${row.title || ""}`);
      doc.fontSize(11).text(`Створено користувачем: ${row.created_by || ""}`);
      doc.fontSize(11).text(`Створено: ${formatDate(row.created_at)}`);
      doc.moveDown(0.2);
      doc.fontSize(11).text(`Опис: ${row.description || ""}`);
      doc.moveDown(0.2);
      doc.fontSize(11).text(`Навички: ${row.skills || ""}`);
      doc.fontSize(11).text(`Категорії: ${row.categories || ""}`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error(
      "Error generating active vacancies report for company:",
      err
    );
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  }
}
