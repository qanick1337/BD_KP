import { runDBCommand } from "../database/connection.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const TOKEN_TTL = "1d";

export async function loginCompany(req, res) {
  const { login_email, password } = req.body;

  console.log("BODY:", req.body);
  console.log("email:", login_email);
  try {
    const rows = await runDBCommand("SELECT company_id, password FROM company_auth WHERE login_email = ?", [login_email]);
    console.log(rows[0]);

    if (!rows.length) {
      return res.status(401).json({ message: "Даних з таким e-mail не знайдено!" });
    }
    console.log(password, rows[0].password)

    // Порівнюємо паролі   
    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) {
      return res.status(401).json({ message: "Введено не правильний пароль" });
    }

    const token = jwt.sign(
      { company_id: rows[0].company_id },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_TTL }
    );

    res.json({ token, login_email, company_id: rows[0].company_id});

  } catch (err) {
    console.error("Помилка авторизації", err);
    res.status(500).json({ message: "Авторизація не виконана" });
  }
}