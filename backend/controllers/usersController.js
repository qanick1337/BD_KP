import { runDBCommand } from "../database/connection.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export async function getCompanyUsers(req, res) {
  const { company_id } = req.user;

  try {
    const rows = await runDBCommand(
      `SELECT 
         company_user_id,
         user_email,
         name,
         surname,
         patronymic,
         phone_number
       FROM company_user
       WHERE company_id = ?`,
      [company_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Помилка отримання користувачів компанії", err);
    res.status(500).json({ message: "Не вдалося отримати користувачів компанії" });
  }
};

export async function getAdminStatus(req, res) {
  const { email } = req.user;

  try {
    const rows = await runDBCommand(
      "SELECT company_id FROM company_auth WHERE login_email = ?",
      [email]
    );

    if (rows.length) {
      return res.json({ isAdmin: true });
    }


    return res.json({ isAdmin: false });

  } catch (err) {
    console.error("Помилка перевірки прав адміністратора", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

export async function getUserByEmail(req, res) {  
  const { email, company_id } = req.user
  try {
    const rows = await runDBCommand(
      `SELECT company_user_id, user_email, name, surname, patronymic, phone_number
       FROM company_user
       WHERE user_email = ? AND company_id = ?`,
      [email, company_id] 
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error("Помилка отримання користувача", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

export async function getUserById(req, res) {
  const { id } = req.params;

  try {
    const rows = await runDBCommand(
      "SELECT * FROM company_user WHERE company_user_id = ?",
      [id]
    );

    if (rows.length) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Користувача не знайдено' });
    }

  } catch (err) {
    console.error("Помилка отримання користувача", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

export async function updateUserById(req,res) {
  const { id } = req.params;

  const data = req.body;

  try {
    const rows = await runDBCommand(
      `
      UPDATE company_user
      SET 
        name = ?,
        surname = ?,
        patronymic = ?,
        user_email = ?,
        phone_number = ?
      WHERE 
        company_user_id = ?
      `,
      [
        data.name,
        data.surname,
        data.patronymic,
        data.user_email,
        data.phone_number,
        id
      ]
    );
     
                
  } catch(err) {
    console.error(`Помилка при оновленні користувача ${req.params.id}:`, err);
        res.status(500).json({ message: "Помилка на сервері" });
  }
  res.status(200).json({ message: `Дані користувача ${data.name} успішно оновлено`});
};

export async function deleteUserById(req, res) {
  const { id } = req.params;

  try {
    const user = await runDBCommand(
      "SELECT company_user_id FROM company_user WHERE company_user_id = ?",
      [id]
    );

    if (!user.length) {
      return res
        .status(404)
        .json({ message: "Користувача з таким ID не знайдено" });
    }

    await runDBCommand(
      "DELETE FROM company_user WHERE company_user_id = ?",
      [id]
    );

    res.status(200).json({
      message: `Користувача з ID ${id} успішно видалено`,
    });

  } catch (err) {
    console.error(`Помилка при видаленні користувача ${id}:`, err);
    res.status(500).json({ message: "Помилка на сервері" });
  }
};

export async function createCompanyUser(req, res) {
  const { company_id } = req.user;

  const {
    user_email,
    password,
    name,
    surname,
    patronymic,
    phone_number
  } = req.body;

  try {
    const owner = await runDBCommand(
      "SELECT login_email FROM company_auth WHERE login_email = ?",
      [user_email]
    );

    if (owner.length) {
      return res.status(400).json({
        message: "Цей email вже використовується як логін власника компанії"
      });
    }

    const exists = await runDBCommand(
      "SELECT user_email FROM company_user WHERE user_email = ?",
      [user_email]
    );

    if (exists.length) {
      return res.status(400).json({
        message: "Користувач з таким email вже існує"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await runDBCommand(
      `INSERT INTO company_user 
       (company_id, user_email, password, name, surname, patronymic, phone_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id,
        user_email,
        hashed,
        name,
        surname,
        patronymic || null,
        phone_number
      ]
    );

    res.status(201).json({
      message: "Користувача успішно додано",
      company_user_id: result.insertId,
      user_email,
      name,
      surname
    });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ message: "Email вже використовується" });
    }

    console.error("Помилка при створенні користувача компанії:", err);
    res.status(500).json({ message: "Помилка при створенні користувача" });
  }
}



