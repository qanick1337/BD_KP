import { useState } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { useAuth } from "../../AuthProvider";

import "./RegisterPage.css";

function RegisterPage() {
    const [step, setStep] = useState(1);

    const [companyName, setCompanyName] = useState("");
    const [numberOfEmployees, setNumberOfEmployees] = useState("");
    const [companySite, setCompanySite] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [companyDescription, setCompanyDescription] = useState("");

    const [login_email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useNavigate();

    const { login } = useAuth();

    const handleNextStep = (e) => {
        e.preventDefault();

        // Проста валідація для 1-го кроку
        if (!companyName.trim()) {
            alert("Введіть назву компанії");
            return;
        }

        setStep(2);
    };

    const handlePrevStep = (e) => {
        e.preventDefault();
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Паролі не співпадають");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/register/register", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    company_name: companyName,
                    number_of_employees: numberOfEmployees
                        ? Number(numberOfEmployees)
                        : 0,
                    company_site: companySite || null,
                    phone_number: phoneNumber || null,
                    company_description: companyDescription || null,

                    login_email,
                    password,
                }),
            });

            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                throw new Error(data?.message || "Registration failed");
            }

            if (data?.token) {
                login(data.token,data.login_email);
            }

            alert("Компанію успішно зареєстровано");
            navigate("/"); 
        } catch (error) {
            alert(error.message || error);
        }
    };

    // Вибираємо, що робить form onSubmit залежно від кроку
    const handleFormSubmit = (e) => {
        if (step === 1) {
            handleNextStep(e);
        } else {
            handleSubmit(e);
        }
    };

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleFormSubmit}>
                <h2>Реєстрація компанії</h2>

                {step === 1 && (
                    <>
                        <h3>Загальна інформація</h3>

                        <label>Назва компанії <span className="red-text">*</span></label>
                        <input
                            type="text"
                            value={companyName}
                            placeholder="Назва компанії"
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                        />

                        <label>Кількість працівників</label>
                        <input
                            type="number"
                            min="0"
                            value={numberOfEmployees}
                            placeholder="Наприклад: 50"
                            onChange={(e) => setNumberOfEmployees(e.target.value)}
                        />

                        <label>Сайт компанії</label>
                        <input
                            type="url"
                            value={companySite}
                            placeholder="https://example.com"
                            onChange={(e) => setCompanySite(e.target.value)}
                        />

                        <label>Номер телефону</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            placeholder="+380..."
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />

                        <label>Опис компанії</label>
                        <textarea
                            value={companyDescription}
                            placeholder="Коротко опишіть компанію"
                            onChange={(e) => setCompanyDescription(e.target.value)}
                        />

                        <button type="submit">Далі</button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h3>Дані для входу</h3>

                        <label>Email для входу <span className="red-text">*</span></label>
                        <input
                            type="email"
                            value={login_email}
                            placeholder="example@gmail.com"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label>Пароль <span className="red-text">*</span></label>
                        <input
                            type="password"
                            value={password}
                            placeholder="Введіть пароль"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <label>Підтвердження пароля <span className="red-text">*</span></label>
                        <input
                            type="password"
                            value={confirmPassword}
                            placeholder="Повторіть пароль"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <div className="register-buttons">
                            <button type="button" onClick={handlePrevStep}>
                                ‹ Назад
                            </button>
                            <button type="submit">
                                Зареєструватися
                            </button>
                        </div>
                    </>
                )}

                <div className="register-login-block">
                    <p className="register-login-text">Вже з нами?</p>
                    <Link to="/login" className="register-login-link">
                        Увійти як роботодавець&nbsp;›
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default RegisterPage;
