import { useState } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import Navbar from "../../components/Navbar/Navbar";

import "./HomePage.css";

function HomePage(){
    


    return(
        <>
            <Navbar/>
            <main className="home">
                <section className="home-hero">
                    <div className="home-hero-inner">
                        <h1>Знаходьте співробітників</h1>
                        <p>Створюйте вакансії, отримуйте відгуки та керуйте наймом в одному місці.</p>
                        <div className="home-search">
                        <input type="text" placeholder="Посада" />
                        <input type="text" placeholder="Місто" defaultValue="Київ" />
                        <button>Знайти кандидатів</button>
                        </div>
                    </div>
                </section>

                <section className="home-block">
                    <h2>Кандидати за містами</h2>
                    <div className="home-cities">
                        <div className="home-city-card">Київ</div>
                        <div className="home-city-card">Львів</div>
                        <div className="home-city-card">Харків</div>
                        <div className="home-city-card">Одеса</div>
                    </div>
                </section>
            </main>
        </>
    )
}

export default HomePage;