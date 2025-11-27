import { runDBCommand } from "../database/connection.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const TOKEN_TTL = "1d";

export async function registerCompany(req, res) {
   const { 
    company_name, 
    number_of_employees = 0, 
    company_site, 
    phone_number, 
    company_description, 
    login_email, 
    password 
  } = req.body;

  try {
    //Хешуємо пароль
    const hashed = await bcrypt.hash(password, 10);

    //Створюємо компанію
    const companyResult = await runDBCommand(
      "INSERT INTO company (company_name, number_of_employees, company_site, phone_number, company_description) VALUES (?, ?, ?, ?, ?)",
      [company_name, number_of_employees, company_site, phone_number, company_description]
    );

    //Додаємо дані для логіну
    await runDBCommand(
      "INSERT INTO company_auth (company_id, login_email, password) VALUES (?, ?, ?)",
      [companyResult.insertId, login_email, hashed]
    );

    const token = jwt.sign(
        { company_id: companyResult.insertId },
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_TTL }
    );

    res.status(201).json({ 
      message: "Registered",
      token,
      login_email,
    });
    
  } catch (err) {
    console.error("Register error", err);
    res.status(400).json({ message: "Register failed" });
  }
};