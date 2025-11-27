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
            alert("Успішно зареєстровано");
        } catch (error) {
           alert(error);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Вхід до компанії</h2>

                <label>Email</label>
                <input
                    type="email"
                    value={login_email}
                    placeholder="example@gmail.com"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label>Пароль</label>
                <input
                    type="password"
                    value={password}
                    placeholder="Введіть пароль"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Увійти</button>

                <div className="auth-register-block">
                    <p className="auth-register-text">Ще не з нами?</p>

                    <Link to="/register" className="auth-register-link">
                        Зареєструватися як роботодавець&nbsp;›
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default AuthPage;
