import { useState, useEffect } from "react";
import { useAuth } from "../../AuthProvider";
import { useNavigate, useLocation } from "react-router";
import CandidateCard from "../../components/CandidateCard/CandidateCard";
import Navbar from "../../components/Navbar/Navbar";

function CandidatesPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedEmployment, setSelectedEmployment] = useState("");
  const [sortSalary, setSortSalary] = useState("");

  const [genderMale, setGenderMale] = useState(false);
  const [genderFemale, setGenderFemale] = useState(false);

  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    const restored = location.state?.filters;
    if (restored) {
      setSearch(restored.search ?? "");
      setSelectedCity(restored.selectedCity ?? "");
      setSelectedEmployment(restored.selectedEmployment ?? "");
      setSortSalary(restored.sortSalary ?? "");
      setGenderMale(restored.genderMale ?? false);
      setGenderFemale(restored.genderFemale ?? false);
      setSalaryFrom(restored.salaryFrom ?? "");
      setSalaryTo(restored.salaryTo ?? "");
    }
  }, []);

  async function fetchCandidates() {
    try {
      const res = await fetch("http://localhost:3000/candidates", {
        headers: authHeaders,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || "Не вдалося отримати інформацію про кандидатів"
        );
      }

      setCandidates(data);
      setFilteredCandidates(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  }

  useEffect(() => {
    let list = [...candidates];

    // пошук по імені / прізвищу / позиції
    if (search.trim()) {
      list = list.filter((c) =>
        (c.name + " " + c.surname + " " + (c.position || ""))
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // фільтр міста
    if (selectedCity) {
      list = list.filter((c) => c.city_name === selectedCity);
    }

    // фільтр типу зайнятості
    if (selectedEmployment) {
      list = list.filter(
        (c) => c.employment_type_name === selectedEmployment
      );
    }

    // фільтр статі
    const activeGenders = [];
    if (genderMale) activeGenders.push("male");
    if (genderFemale) activeGenders.push("female");

    if (activeGenders.length > 0) {
      list = list.filter(
        (c) =>
          c.sex &&
          activeGenders.includes(String(c.sex).toLowerCase())
      );
    }

    // фільтр зарплати
    const fromValue =
      salaryFrom !== "" ? Number(salaryFrom) : null;
    const toValue = salaryTo !== "" ? Number(salaryTo) : null;

    if (fromValue !== null && !Number.isNaN(fromValue)) {
      list = list.filter(
        (c) => Number(c.expected_salary || 0) >= fromValue
      );
    }

    if (toValue !== null && !Number.isNaN(toValue)) {
      list = list.filter(
        (c) => Number(c.expected_salary || 0) <= toValue
      );
    }

    // сортування по зарплаті
    if (sortSalary === "asc") {
      list.sort(
        (a, b) =>
          Number(a.expected_salary || 0) -
          Number(b.expected_salary || 0)
      );
    } else if (sortSalary === "desc") {
      list.sort(
        (a, b) =>
          Number(b.expected_salary || 0) -
          Number(a.expected_salary || 0)
      );
    }

    setFilteredCandidates(list);
  }, [
    search,
    selectedCity,
    selectedEmployment,
    sortSalary,
    genderMale,
    genderFemale,
    salaryFrom,
    salaryTo,
    candidates,
  ]);

  const uniqueCities = [...new Set(candidates.map((c) => c.city_name).filter(Boolean))];
  const uniqueEmployment = [
    ...new Set(
      candidates.map((c) => c.employment_type_name).filter(Boolean)
    ),
  ];

  function handleResetFilters() {
    setSelectedCity("");
    setSelectedEmployment("");
    setSortSalary("");
    setSearch("");
    setGenderMale(false);
    setGenderFemale(false);
    setSalaryFrom("");
    setSalaryTo("");
  }

  const filters = {
    search,
    selectedCity,
    selectedEmployment,
    sortSalary,
    genderMale,
    genderFemale,
    salaryFrom,
    salaryTo,
  };

  return (
    <>
      <Navbar />

      <section className="max-w-6xl mx-auto mt-8 px-4 pb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Кандидати
        </h2>

        <div className="mb-6 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Пошук кандидата..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="w-full sm:w-1/3 border rounded-lg px-3 py-2"
            value={sortSalary}
            onChange={(e) => setSortSalary(e.target.value)}
          >
            <option value="">📶 Без сортування</option>
            <option value="asc">⬆️Зарплата: спочатку найменша </option>
            <option value="desc">⬇️Зарплата: спочатку найбільша</option>
          </select>
        </div>

        <div className="flex gap-6">
          <aside className="w-72 bg-white shadow-sm rounded-xl border border-gray-200 p-4 h-fit">
            <div className="flex gap-3">
              <h3 className="text-lg font-semibold mb-3">Фільтри</h3>
              <button
                className="text-sm text-blue-600 underline mb-3"
                onClick={handleResetFilters}
              >
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

            <div className="mb-4">
              <span className="block text-sm text-gray-700 mb-1">
                Стать
              </span>
              <label className="flex items-center gap-2 text-sm mb-1">
                <input
                  type="checkbox"
                  checked={genderMale}
                  onChange={(e) =>
                    setGenderMale(e.target.checked)
                  }
                />
                <span>Чоловік</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={genderFemale}
                  onChange={(e) =>
                    setGenderFemale(e.target.checked)
                  }
                />
                <span>Жінка</span>
              </label>
            </div>

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
                  onChange={(e) =>
                    setSalaryFrom(e.target.value)
                  }
                />
                <input
                  type="number"
                  min="0"
                  className="w-1/2 border rounded-lg px-3 py-2 text-sm"
                  placeholder="до"
                  value={salaryTo}
                  onChange={(e) =>
                    setSalaryTo(e.target.value)
                  }
                />
              </div>
            </div>


          </aside>

          <div className="flex-1 flex flex-col gap-4">
            {error && (
              <p className="text-xl text-red-600 mb-2">
                Помилка: {error}
              </p>
            )}

            {loading ? (
              <p className="text-sm text-gray-500 mb-4">
                Завантаження...
              </p>
            ) : filteredCandidates.length === 0 ? (
              <p className="text-sm text-gray-500">
                Немає кандидатів за цими параметрами.
              </p>
            ) : (
              filteredCandidates.map((cand) => (
                <CandidateCard
                  key={cand.candidate_id}
                  candidate={cand}
                  onClick={() =>
                    navigate(`/candidates/${cand.candidate_id}`, {
                      state: {
                        filters: {
                          search,
                          selectedCity,
                          selectedEmployment,
                          sortSalary,
                          genderMale,
                          genderFemale,
                          salaryFrom,
                          salaryTo,
                        },
                      },
                    })
                  }
                />
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default CandidatesPage;
