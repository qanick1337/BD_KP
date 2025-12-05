import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./HomePage.css";

function HomePage() {
  // ===========================
  // Популярні міста (к-сть кандидатів)
  // ===========================
  const [popularCities, setPopularCities] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState(null);
  const [showAllCities, setShowAllCities] = useState(false);

  // ===========================
  // Статистика зарплат
  // ===========================
  const [salaryStats, setSalaryStats] = useState([]);
  const [allSalaryStats, setAllSalaryStats] = useState([]);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryError, setSalaryError] = useState(null);
  const [showAllSalary, setShowAllSalary] = useState(false);

  // ===========================
  // Завантаження популярних міст
  // ===========================
  useEffect(() => {
    fetchPopularCities();
  }, []);

  async function fetchPopularCities() {
    try {
      setCitiesLoading(true);
      setCitiesError(null);

      const res = await fetch("http://localhost:3000/stats/popularcities");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Не вдалося завантажити статистику по містах");
      }

      // Зберігаємо увесь список
      setAllCities(data);

      // Сортуємо та беремо топ-5
      const sortedTop5 = [...data]
        .sort((a, b) => b.candidate_count - a.candidate_count)
        .slice(0, 5);

      setPopularCities(sortedTop5);
      setCitiesLoading(false);
    } catch (err) {
      console.error(err);
      setCitiesError(err.message);
      setCitiesLoading(false);
    }
  }

  // ===========================
  // Завантаження статистики зарплат
  // ===========================
  useEffect(() => {
    fetchSalaryStats();
  }, []);

  async function fetchSalaryStats() {
    try {
      setSalaryLoading(true);
      setSalaryError(null);

      const res = await fetch("http://localhost:3000/stats/salaryExpectations");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Не вдалося завантажити статистику зарплат");
      }

      // зберігаємо весь список
      setAllSalaryStats(data);

      // топ-5 за спаданням ЗП
      const top5 = [...data]
        .sort((a, b) => b.avg_salary - a.avg_salary)
        .slice(0, 5);

      setSalaryStats(top5);
      setSalaryLoading(false);
    } catch (err) {
      console.error(err);
      setSalaryError(err.message);
      setSalaryLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="bg-gray-100 min-h-[calc(100vh-64px)] ">
        {/* HERO */}
        <section className="bg-gradient-to-r from-cyan-400 to-indigo-400 text-white py-10 sm:py-14">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Знаходьте співробітників
            </h1>
            <p className="text-base sm:text-lg mb-6">
              Створюйте вакансії, отримуйте відгуки та керуйте наймом в одному місці.
            </p>
          </div>
        </section>

        {/* Популярні міста */}
        <section className="max-w-4xl mx-auto mt-8 px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Кандидати за містами
          </h2>

          {citiesError && (
            <p className="text-sm text-red-600 mb-2">
              Помилка: {citiesError}
            </p>
          )}

          {citiesLoading ? (
            <p className="text-sm text-gray-500">Завантаження статистики...</p>
          ) : popularCities.length === 0 ? (
            <p className="text-sm text-gray-500">Дані про популярні міста відсутні.</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {popularCities.map((city) => (
                <div
                  key={city.city_name}
                  className="bg-white px-6 py-4 rounded-xl shadow-sm min-w-[150px] text-center text-gray-800"
                >
                  <p className="font-semibold text-base">{city.city_name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {city.candidate_count} кандидатів
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Показати всі / приховати */}
          {allCities.length > 5 && (
            <button
              className="mt-3 text-sm text-blue-600 hover:underline"
              onClick={() => setShowAllCities((prev) => !prev)}
            >
              {showAllCities ? "Приховати" : "Показати всі міста"}
            </button>
          )}

          {/* FULL LIST — accordion */}
          {showAllCities && (
            <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Всі міста
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allCities.map((city) => (
                  <div
                    key={city.city_name}
                    className="bg-gray-50 rounded-lg px-4 py-3 shadow-sm border border-gray-100 text-gray-800"
                  >
                    <p className="font-medium">{city.city_name}</p>
                    <p className="text-sm text-gray-600">
                      {city.candidate_count} кандидатів
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Зарплатні очікування */}
        <section className="max-w-4xl mx-auto mt-10 px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Очікування зарплат за містами
          </h2>

          {salaryError && (
            <p className="text-sm text-red-600 mb-2">
              Помилка: {salaryError}
            </p>
          )}

          {salaryLoading ? (
            <p className="text-sm text-gray-500">Завантаження статистики...</p>
          ) : salaryStats.length === 0 ? (
            <p className="text-sm text-gray-500">
              Дані про очікування зарплат відсутні.
            </p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {salaryStats.map((city) => (
                <div
                  key={city.city_name}
                  className="bg-white px-6 py-4 rounded-xl shadow-sm min-w-[150px] text-center text-gray-800"
                >
                  <p className="font-semibold text-base">{city.city_name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {Math.round(city.avg_salary).toLocaleString("uk-UA")} грн
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Кнопка показати всі зарплати */}
          {allSalaryStats.length > 5 && (
            <button
              className="mt-3 text-sm text-blue-600 hover:underline"
              onClick={() => setShowAllSalary((prev) => !prev)}
            >
              {showAllSalary ? "Приховати" : "Показати всі міста"}
            </button>
          )}

          {/* Accordion всіх зарплат */}
          {showAllSalary && (
            <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Всі міста (очікування зарплат)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allSalaryStats.map((city) => (
                  <div
                    key={city.city_name}
                    className="bg-gray-50 rounded-lg px-4 py-3 shadow-sm border border-gray-100 text-gray-800"
                  >
                    <p className="font-medium">{city.city_name}</p>
                    <p className="text-sm text-gray-600">
                      {Math.round(city.avg_salary).toLocaleString("uk-UA")} грн
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="bg-white py-6 mt-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">
            © 2025 <span className="font-semibold text-blue-700">Work-like</span>. Усі права захищено.
          </p>
        </div>
      </footer>
    </>
  );
}

export default HomePage;
