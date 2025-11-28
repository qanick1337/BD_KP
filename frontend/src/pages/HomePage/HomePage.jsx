import { useState } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import Navbar from "../../components/Navbar/Navbar";

import "./HomePage.css";

function HomePage(){
    
    return(
        <>
            <Navbar/>
            <main className="bg-gray-100 min-h-[calc(100vh-64px)] ">
            {/* HERO */}
                <section className="bg-gradient-to-r from-cyan-400 to-indigo-400 text-white py-10 sm:py-14 ">
                    <div className="max-w-4xl mx-auto px-4">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                            Знаходьте співробітників
                        </h1>
                        <p className="text-base sm:text-lg mb-6">
                            Створюйте вакансії, отримуйте відгуки та керуйте наймом в одному місці.
                        </p>

                        {/* Блок пошуку*/}
                        <div className="bg-white rounded-xl p-2 flex flex-col sm:flex-row gap-2  shadow-md md:rounded-full">
                            <input
                                type="text"
                                placeholder="Посада"
                                className="flex-1 rounded-full px-4 py-2 text-gray-700 outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Місто"
                                defaultValue="Київ"
                                className="flex-1 rounded-full px-4 py-2 text-gray-700 outline-none"
                            />
                            <button className="bg-blue-700 hover:bg-pink-600 transition text-white font-semibold px-6 py-2 rounded-full">
                                Знайти кандидатів
                            </button>
                        </div>
                    </div>
                </section>

                {/* Блок з містами */}
                <section className="max-w-4xl mx-auto mt-8 px-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Кандидати за містами
                    </h2>

                <div className="flex flex-wrap gap-4">
                    {["Київ", "Львів", "Харків", "Одеса"].map((city) => (
                    <div
                        key={city}
                        className="bg-white px-6 py-4 rounded-xl shadow-sm min-w-[130px] text-center text-gray-800 font-medium"
                    >
                        {city}
                    </div>
                    ))}
                </div>
                </section>

                {/* Блок з категоріями     */}
                <section className="max-w-4xl mx-auto mt-8 px-4 pb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Кандидати за категоріями
                    </h2>

                    <div className="flex flex-wrap gap-4">
                        {["IT, комп'ютери, інтернет", "Дизайн, творчість", "Медицина, фармацевтика"].map((city) => (
                        <div
                            key={city}
                            className="bg-white px-6 py-4 rounded-xl shadow-sm min-w-[130px] text-center text-gray-800 font-medium"
                        >
                            {city}
                        </div>
                        ))}
                    </div>
                </section>
        </main>
        <footer className="bg-white py-6">
            <div className="max-w-6xl mx-auto px-4 text-center">
                <p className="text-gray-600 text-sm">
                    © 2025 <span className="font-semibold text-blue-700">Work-like</span>. Усі права захищено.
                </p>
            </div>
        </footer>
        </>
    )
}

export default HomePage;