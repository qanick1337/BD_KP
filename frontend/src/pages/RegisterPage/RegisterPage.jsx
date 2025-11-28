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
        <main className="bg-gray-100 min-h-[calc(100vh-64px)] flex justify-center items-start py-10 px-4">
            <form
                onSubmit={handleFormSubmit}
                className="w-full max-w-md bg-white rounded-xl shadow-md px-6 py-7 flex flex-col"
            >   
                <div className="text-center m-10">
                    <Link
                        to="/"
                        className="font-extrabold text-xl sm:text-2xl text-blue-700"
                        >
                        Work-like
                    </Link>
                </div>
                <h2 className="text-xl font-bold text-center mb-2">
                    Реєстрація компанії
                </h2>

                {step === 1 && (
                <>
                    
                    <h3 className="text-base font-semibold text-center text-gray-700 mb-5">
                        Загальна інформація
                    </h3>

                    <label className="mb-1 text-sm font-medium text-gray-700">
                        Назва компанії <span className="text-red-500">*</span>
                    </label>

                    <input
                    type="text"
                    value={companyName}
                    placeholder="Назва компанії"
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <label className="mb-1 text-sm font-medium text-gray-700">
                        Кількість працівників
                    </label>
                    <input
                    type="number"
                    min="0"
                    value={numberOfEmployees}
                    placeholder="Наприклад: 50"
                    onChange={(e) => setNumberOfEmployees(e.target.value)}
                    className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <label className="mb-1 text-sm font-medium text-gray-700">
                        Сайт компанії
                    </label>

                    <input
                    type="url"
                    value={companySite}
                    placeholder="https://example.com"
                    onChange={(e) => setCompanySite(e.target.value)}
                    className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <label className="mb-1 text-sm font-medium text-gray-700">
                        Номер телефону
                    </label>

                    <input
                    type="tel"
                    value={phoneNumber}
                    placeholder="+380..."
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <label className="mb-1 text-sm font-medium text-gray-700">
                        Опис компанії
                    </label>

                    <textarea
                    value={companyDescription}
                    placeholder="Коротко опишіть компанію"
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <button
                    type="submit"
                    className="mt-1 w-full rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                    >
                        Далі
                    </button>
                </>
                )}

                {step === 2 && (
                <>
                    <h3 className="text-base font-semibold text-center text-gray-700 mb-5">
                        Дані для входу
                    </h3>

                    <label className="mb-1 text-sm font-medium text-gray-700">
                        Email для входу <span className="text-red-500">*</span>
                    </label>

                    <input
                    type="email"
                    value={login_email}
                    placeholder="example@gmail.com"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <label className="mb-1 text-sm font-medium text-gray-700">
                        Пароль <span className="text-red-500">*</span>
                    </label>

                    <input
                    type="password"
                    value={password}
                    placeholder="Введіть пароль"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <label className="mb-1 text-sm font-medium text-gray-700">
                        Підтвердження пароля <span className="text-red-500">*</span>
                    </label>
                    
                    <input
                    type="password"
                    value={confirmPassword}
                    placeholder="Повторіть пароль"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <div className="flex gap-3 mt-1">
                    <button
                        type="button"
                        onClick={handlePrevStep}
                        className="w-1/2 rounded-md bg-gray-200 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-300 transition"
                    >
                        ‹ Назад
                    </button>

                    <button
                        type="submit"
                        className="w-1/2 rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                    >
                        Зареєструватися
                    </button>
                    </div>
                </>
                )}

                <div className="mt-5 text-center">
                <p className="text-xs text-gray-600 mb-1">Вже з нами?</p>
                <Link
                    to="/login"
                    className="text-sm font-medium text-blue-600 hover:underline"
                >
                    Увійти як роботодавець&nbsp;›
                </Link>
                </div>
            </form>
        </main>
    );
}

export default RegisterPage;
