import { runDBCommand } from "../database/connection.js"; 

export async function getCompanyName(req, res) {
     const { email } = req.user;
     
     try { 
        let rows = await runDBCommand("SELECT course_project.company.company_name FROM course_project.company LEFT JOIN course_project.company_auth ON course_project.company_auth.company_id = course_project.company.company_id WHERE course_project.company_auth.login_email = ?", [email]);
        
        if (!rows.length) { 
            rows = await runDBCommand("SELECT course_project.company.company_name FROM course_project.company LEFT JOIN course_project.company_user ON course_project.company_user.company_id = course_project.company.company_id WHERE course_project.company_user.user_email = ?", [email]); 
        } if (!rows.length) { 
            return res.status(404).json({ message: "Company not found" }); 
        }
        res.json({ company_name: rows[0].company_name }); 
    } catch (err) { 
        console.error("Помилка отримання назви компанії", err); 
        res .status(500) .json({ message: "Помилка отримання назви компанії" });
    } 
}

