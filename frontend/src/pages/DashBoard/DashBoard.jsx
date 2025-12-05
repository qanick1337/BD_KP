import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { useAuth } from "../../AuthProvider";

import "./DashBoard.css";
import { Link } from "react-router";

function DashBoard() {
    const { token, email } = useAuth();
    const [company_name, setCompanyName] = useState("");
    const [adminStatus, setAdminStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        if (!token) {
        setAccessDenied(true);    
        setLoading(false);
        return;
        }
        
        getCompanyName();
        getAdminStatus();
    }, [email, token]);

    async function getCompanyName() {
        try {
        const response = await fetch("http://localhost:3000/dashboard", {
            method: "GET",
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.status === 401) {
            setAccessDenied(true);
            setLoading(false);
            return;
        }

        if (!response.ok) {
            throw new Error(data.message);
        }

        setCompanyName(data.company_name);
        setLoading(false);
        } catch (err) {
        console.log(err);
        setAccessDenied(true);
        setLoading(false);
        }
    }

    async function getAdminStatus() {
        try {
        const response = await fetch("http://localhost:3000/users/is-admin", {
            method: "GET",
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.status === 401) {
            setLoading(false);
            return;
        }

        if (!response.ok) {
            throw new Error(data.message);
        }

        setAdminStatus(data.isAdmin)
        setLoading(false);
        } catch (err) {
        console.log(err);
        }
    }
    if (accessDenied) {
        return (
        <>
            <Navbar />
            <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
                <h2 className="text-2xl font-bold text-red-600 mb-3">
                Доступ заборонено
                </h2>
                <p className="text-gray-700 mb-4">
                Вам потрібно увійти в систему, щоб переглядати цю сторінку.
                </p>
                <a
                href="/login"
                className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
                >
                Увійти
                </a>
            </div>
            </div>
        </>
        );
    }

    if (loading) {
        return (
        <>
            <Navbar />
            <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center bg-gray-100">
            <p className="text-gray-600 text-lg">Завантаження...</p>
            </div>
        </>
        );
    }

    return (
        <>
        <Navbar />
        <main className="bg-gray-100 min-h-[calc(100vh-64px)] ">
            <section className="bg-gradient-to-r from-amber-400 to-purple-600 text-white py-10 sm:py-14 ">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Раді знову Вас бачити
                {company_name ? `, ${company_name}` : ""}!
                </h1>
                <p className="text-base sm:text-lg mb-6">
                Створюйте вакансії, отримуйте відгуки та керуйте наймом в одному
                місці.
                </p>
            </div>
            </section>

            <section className="max-w-4xl mx-auto mt-8 px-4 pb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Система управління вакансіями
            </h2>

            <div className="flex flex-wrap gap-4">
                <Link
                    to="/vacancies"
                >
                    <div>
                        <p className="bg-white px-6 py-4 rounded-xl shadow-sm min-w-[130px] text-center text-gray-800 font-medium" >Вакансії</p>
                    </div>
                </Link>

                 <Link
                    to="/candidates"
                >
                    <div>
                        <p className="bg-white px-6 py-4 rounded-xl shadow-sm min-w-[130px] text-center text-gray-800 font-medium" >Кандидати</p>
                    </div>
                </Link>

                {adminStatus && (
                    <Link to="/users">
                        <div>
                        <p className="bg-white px-6 py-4 rounded-xl shadow-sm min-w-[130px] text-center text-gray-800 font-medium">
                            Користувачі
                        </p>
                        </div>
                    </Link>
                )}

                {adminStatus && (
                    <Link to="/company_stats">
                        <div>
                        <p className="bg-white px-6 py-4 rounded-xl shadow-sm min-w-[130px] text-center text-gray-800 font-medium">
                            Статистика компанії
                        </p>
                        </div>
                    </Link>
                )}
            </div>
            </section>
        </main>

        <footer className="bg-white py-6">
            <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-gray-600 text-sm">
                © 2025 <span className="font-semibold text-blue-700">Work-like</span>.
                Усі права захищено.
            </p>
            </div>
        </footer>
        </>
    );
}

export default DashBoard;
