import { useState } from "react";
import {Outlet, Link} from "react-router"
import { useNavigate } from "react-router";
import { useAuth } from "../../AuthProvider";
import "./AuthPage.css";

function AuthPage() {
    const [login_email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const { login } = useAuth();

    const token = localStorage.getItem("authToken");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/login/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    login_email: login_email,
                    password,
                }),
            });

            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                throw new Error(data?.message || "Login failed");
            }

            if (data?.token) {
                login(data.token,data.login_email);
            }

            navigate("/");
        } catch (error) {
           alert(error);
        }
    };

    return (
        <main className="bg-gray-100 min-h-[calc(100vh-64px)] flex justify-center items-start py-10 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white rounded-xl shadow-md px-6 py-7 flex flex-col"
            >
                <div className="text-center mb-6">
                <Link
                    to="/"
                    className="font-extrabold text-xl sm:text-2xl text-blue-700"
                >
                    Work-like
                </Link>
                </div>

                <h2 className="text-xl font-bold text-center mb-5">
                    Вхід до компанії
                </h2>

                <label className="mb-1 text-sm font-medium text-gray-700">
                    Email
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
                    Пароль
                </label>
                <input
                    type="password"
                    value={password}
                    placeholder="Введіть пароль"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <button
                type="submit"
                className="mt-1 w-full rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                    Увійти
                </button>

                <div className="mt-5 text-center">
                <p className="text-xs text-gray-600 mb-1">Ще не з нами?</p>
                <Link
                    to="/register"
                    className="text-sm font-medium text-blue-600 hover:underline"
                >
                    Зареєструватися як роботодавець&nbsp;›
                </Link>
                </div>
            </form>
        </main>
    );
}

export default AuthPage;
