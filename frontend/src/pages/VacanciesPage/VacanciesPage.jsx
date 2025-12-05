import { useState, useEffect } from "react";
import { useAuth } from "../../AuthProvider";
import { useNavigate } from "react-router";
import VacancyCard from "../../components/VacancyCard/VacancyCard";
import Navbar from "../../components/Navbar/Navbar";

function VacanciesPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [adminStatus, setAdminStatus] = useState(false);
  const [companyUserId, setCompanyUserID] = useState(null);

  const [vacancies, setVacancies] = useState([]);
  const [filteredVacancies, setFilteredVacancies] = useState([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedEmployment, setSelectedEmployment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");


  const defaultFromDate = "1900-01-01";
  const todayStr = new Date().toISOString().slice(0, 10);

  const [createdFrom, setCreatedFrom] = useState(defaultFromDate);
  const [createdTo, setCreatedTo] = useState(todayStr);

  const [sortOption, setSortOption] = useState("");

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};


  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const isAdmin = await getAdminStatus();
        let currentUserId = null;

        if (!isAdmin) {
          currentUserId = await fetchUserId();
        }

        await loadVacancies(isAdmin, currentUserId);
        setLoading(false);
      } catch (err) {
          console.error(err);
          setError(err.message);
          setLoading(false);
      }
    })();
  }, [token]);

  async function getAdminStatus() {
    try {
      const response = await fetch("http://localhost:3000/users/is-admin", {
        method: "GET",
        headers: authHeaders,
      });

      const data = await response.json();

      if (response.status === 401) {
        return false;
      }

      if (!response.ok) {
        throw new Error(data.message || "Не вдалося визначити адмін-статус");
      }

      setAdminStatus(data.isAdmin);
      return data.isAdmin;
    } catch (err) {
        console.log(err);
        setAdminStatus(false);
      return false;
    }
  }

  async function fetchUserId() {
    try {
      const res = await fetch("http://localhost:3000/users/me", {
        headers: authHeaders,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || "Не вдалося отримати інформацію про користувача"
        );
      }

      setCompanyUserID(data.company_user_id);
      return data.company_user_id;
    } catch (err) {
      console.error(err);
      setError(err.message);
      throw err;
    }
  }

  async function loadVacancies(isAdmin, currentUserId) {
    try {
      const url = isAdmin
        ? "http://localhost:3000/vacancies"
        : "http://localhost:3000/vacancies/user";

      const headers = {
        ...authHeaders,
      };

      if (!isAdmin && currentUserId) {
        headers["X-Company-User-Id"] = String(currentUserId);
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (response.status === 401) {
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Не вдалося завантажити вакансії");
      }

      setVacancies(data);
      setFilteredVacancies(data);
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  }

  async function handleDeleteUser(id) {
    const confirmed = window.confirm("Видалити цю вакансію?");
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:3000/vacancies/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || "Не вдалося видалити вакансію");
      }

      setVacancies((prev) => prev.filter((v) => v.vacancy_id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || "Сталася помилка при видаленні");
    }
  }

  const uniqueCities = [...new Set(vacancies.map((v) => v.city_name).filter(Boolean))];
  const uniqueEmployment = [
    ...new Set(
      vacancies.map((v) => v.employment_type_name).filter(Boolean)
    ),
  ];
  const uniqueStatuses = [
    ...new Set(
      vacancies.map((v) => v.vacancy_status_name).filter(Boolean)
    ),
  ];

  const getSalaryValue = (v) => {
    const min = Number(v.salary_min || 0);
    const max = Number(v.salary_max || 0);
    if (min && max) {
      return (min + max) / 2
    };
    if (min) {
      return min
    };
    if (max) {
      return max
    };
    return 0;
  };

  const getCreatedDate = (v) => {
    if (!v.created_at) return null;               
    const d = new Date(v.created_at);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const getCreatedTime = (v) => {
    const d = getCreatedDate(v);
    return d ? d.getTime() : 0;
  };

  useEffect(() => {
    let list = [...vacancies];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((v) =>
        ((v.title || "") + " " + (v.description || "")).toLowerCase().includes(q)
      );
    }

    if (selectedCity) {
      list = list.filter((v) => v.city_name === selectedCity);
    }

    if (selectedEmployment) {
      list = list.filter(
        (v) => v.employment_type_name === selectedEmployment
      );
    }

    if (selectedStatus) {
      list = list.filter(
        (v) => v.vacancy_status_name === selectedStatus
      );
    }

    // фільтр зарплати
    const fromValue = salaryFrom !== "" ? Number(salaryFrom) : null;
    const toValue = salaryTo !== "" ? Number(salaryTo) : null;

    if (fromValue !== null && !Number.isNaN(fromValue)) {
      list = list.filter((v) => getSalaryValue(v) >= fromValue);
    }

    if (toValue !== null && !Number.isNaN(toValue)) {
      list = list.filter((v) => getSalaryValue(v) <= toValue);
    }

    // фільтр дати створення
    const fromDate = createdFrom ? new Date(createdFrom) : null;
    const toDate = createdTo ? new Date(createdTo) : null;

    if (fromDate && !Number.isNaN(fromDate.getTime())) {
      list = list.filter((v) => {
        const d = getCreatedDate(v);
        return !d || d >= fromDate;
      });
    }

    if (toDate && !Number.isNaN(toDate.getTime())) {
      list = list.filter((v) => {
        const d = getCreatedDate(v);
        return !d || d <= toDate;
      });
    }

    switch (sortOption) {
      case "salary_asc":
        list.sort((a, b) => getSalaryValue(a) - getSalaryValue(b));
        break;
      case "salary_desc":
        list.sort((a, b) => getSalaryValue(b) - getSalaryValue(a));
        break;
      case "date_new":
        list.sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
        break;
      case "date_old":
        list.sort((a, b) => getCreatedTime(a) - getCreatedTime(b));
        break;
    }

    setFilteredVacancies(list);
  }, [
    vacancies,
    search,
    selectedCity,
    selectedEmployment,
    selectedStatus,
    salaryFrom,
    salaryTo,
    createdFrom,
    createdTo,
    sortOption,
  ]);

  function handleResetFilters() {
    setSearch("");
    setSelectedCity("");
    setSelectedEmployment("");
    setSelectedStatus("");
    setSalaryFrom("");
    setSalaryTo("");
    setCreatedFrom(defaultFromDate);
    setCreatedTo(todayStr);
    setSortOption("");
  }

  return (
    <>
      <Navbar />
      <section className="max-w-6xl mx-auto mt-8 px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Вакансії</h2>
          <button
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-md"
            onClick={() => navigate("/create_vacancy")}
          >
            + Створити вакансію
          </button>
        </div>

      <div className="flex gap-1 mb-3">
          <input
            type="text"
            placeholder="Пошук вакансій..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="w-full sm:w-1/3 border rounded-lg px-3 py-2"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="">📶 Без сортування</option>
            <option value="salary_asc">⬆️Зарплата: спочатку найменша</option>
            <option value="salary_desc">⬇️Зарплата: спочатку найбільша</option>
            <option value="date_new">🔽Дата: спочатку нові</option>
            <option value="date_old">🔼Дата: спочатку старі</option>
          </select>

      </div>

        <div className="flex gap-6">
          <aside className="w-72 bg-white shadow-sm rounded-xl border border-gray-200 p-4 h-fit">
            <div className="flex gap-3">
              <h3 className="text-lg font-semibold mb-3">Фільтри</h3>

              <button className="text-sm text-blue-600 underline mb-3" onClick={handleResetFilters}>
                Скинути фільтри
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">
                Місто
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">Всі</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">
                Тип зайнятості
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={selectedEmployment}
                onChange={(e) =>
                  setSelectedEmployment(e.target.value)
                }
              >
                <option value="">Всі</option>
                {uniqueEmployment.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Статус вакансії */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">
                Статус
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Всі</option>
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Зарплата */}
            <div className="mb-4">
              <span className="block text-sm text-gray-700 mb-1">
                Зарплата, грн
              </span>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  className="w-1/2 border rounded-lg px-3 py-2 text-sm"
                  placeholder="від"
                  value={salaryFrom}
                  onChange={(e) => setSalaryFrom(e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  className="w-1/2 border rounded-lg px-3 py-2 text-sm"
                  placeholder="до"
                  value={salaryTo}
                  onChange={(e) => setSalaryTo(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <span className="block text-sm text-gray-700 mb-1">
                Дата створення
              </span>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="w-1/2 border rounded-lg px-3 py-2 text-sm"
                  value={createdFrom}
                  onChange={(e) => setCreatedFrom(e.target.value)}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      setCreatedFrom(defaultFromDate);
                    }
                  }}
                />
                <input
                  type="date"
                  className="w-1/2 border rounded-lg px-3 py-2 text-sm"
                  value={createdTo}
                  onChange={(e) => setCreatedTo(e.target.value)}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      setCreatedTo(todayStr);
                    }
                  }}
                />
              </div>
            </div>

          </aside>

          <div className="flex-1 flex flex-col gap-4">
            {error && (
              <p className="text-sm text-red-600 mb-2">Помилка: {error}</p>
            )}

            {loading ? (
              <p className="text-sm text-gray-500 mb-4">
                Завантаження вакансій...
              </p>
            ) : filteredVacancies.length === 0 ? (
              <h2 className="text-sm text-gray-500">
                Немає вакансій за цими параметрами.
              </h2>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-2">
                  Знайдено {filteredVacancies.length} вакансій (усього{" "}
                  {vacancies.length})
                </p>
                {filteredVacancies.map((vacancy) => (
                  <VacancyCard
                    key={vacancy.vacancy_id}
                    vacancy={vacancy}
                    onDelete={() =>
                      handleDeleteUser(vacancy.vacancy_id)
                    }
                    onClick={() =>
                      navigate(`/vacancies/${vacancy.vacancy_id}`)
                    }
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default VacanciesPage;
