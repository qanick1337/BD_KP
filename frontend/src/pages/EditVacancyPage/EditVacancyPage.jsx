import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Navbar from "../../components/Navbar/Navbar";
import { useAuth } from "../../AuthProvider";

function EditVacancyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState({
    title: "",
    country_id: "",
    city_id: "",
    employment_type_id: "",
    vacancy_status_id: "",
    salary_min: "",
    salary_max: "",
    salary_comment: "",
    description: "",
  });

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [vacancyStatuses, setVacancyStatuses] = useState([]);

  // 🔹 довідники для категорій та навичок
  const [categories, setCategories] = useState([]);
  const [allSkills, setAllSkills] = useState([]);

  // 🔹 вибрані категорії та навички
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]); // {id?, name, isNew?}
  const [skillQuery, setSkillQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!token) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    loadPageData();
  }, [token, id]);

  async function loadPageData() {
    try {
      setLoading(true);
      setError(null);

      const [
        countriesRes,
        citiesRes,
        employmentRes,
        statusesRes,
        categoriesRes,
        skillsRes,
        vacancyDetailRes,
      ] = await Promise.all([
        fetch("http://localhost:3000/dict/countries", { headers: authHeaders }),
        fetch("http://localhost:3000/dict/cities", { headers: authHeaders }),
        fetch("http://localhost:3000/dict/employment-types", {
          headers: authHeaders,
        }),
        fetch("http://localhost:3000/dict/vacancy-statuses", {
          headers: authHeaders,
        }),
        fetch("http://localhost:3000/dict/categories", { headers: authHeaders }),
        fetch("http://localhost:3000/dict/skills", { headers: authHeaders }),
        fetch(`http://localhost:3000/vacancies/${id}`, { headers: authHeaders }),
      ]);

      if (
        [
          countriesRes,
          citiesRes,
          employmentRes,
          statusesRes,
          categoriesRes,
          skillsRes,
          vacancyDetailRes,
        ].some((r) => r.status === 401)
      ) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const [
        countriesData,
        citiesData,
        employmentData,
        statusesData,
        categoriesData,
        skillsData,
        vacancyData,
      ] = await Promise.all([
        countriesRes.json(),
        citiesRes.json(),
        employmentRes.json(),
        statusesRes.json(),
        categoriesRes.json(),
        skillsRes.json(),
        vacancyDetailRes.json(),
      ]);

      if (!countriesRes.ok)
        throw new Error(countriesData?.message || "Failed to load countries");
      if (!citiesRes.ok)
        throw new Error(citiesData?.message || "Failed to load cities");
      if (!employmentRes.ok)
        throw new Error(
          employmentData?.message || "Failed to load employment types"
        );
      if (!statusesRes.ok)
        throw new Error(
          statusesData?.message || "Failed to load vacancy statuses"
        );
      if (!categoriesRes.ok)
        throw new Error(
          categoriesData?.message || "Failed to load categories"
        );
      if (!skillsRes.ok)
        throw new Error(skillsData?.message || "Failed to load skills");
      if (!vacancyDetailRes.ok)
        throw new Error(vacancyData?.message || "Failed to load vacancy info");

      const mappedCountries = countriesData.map((c) => ({
        id: c.country_id,
        name: c.country_name,
      }));
      const mappedCities = citiesData.map((c) => ({
        id: c.city_id,
        name: c.city_name,
        country_id: c.country_id,
      }));
      const mappedEmployment = employmentData.map((e) => ({
        id: e.employment_type_id,
        name: e.employment_type_name,
      }));
      const mappedStatuses = statusesData.map((s) => ({
        id: s.vacancy_status_id,
        name: s.vacancy_status_name,
      }));
      const mappedCategories = categoriesData.map((cat) => ({
        id: cat.category_id,
        name: cat.category_name,
      }));
      const mappedSkills = skillsData.map((skill) => ({
        id: skill.skill_id,
        name: skill.skill_name,
      }));

      const vacancy = vacancyData;

      const cityForVacancy = mappedCities.find(
        (c) => String(c.id) === String(vacancy.city_id)
      );
      const countryId =
        cityForVacancy?.country_id || mappedCountries[0]?.id || "";
      const citiesForCountry = mappedCities.filter(
        (c) => String(c.country_id) === String(countryId)
      );

      setCountries(mappedCountries);
      setCities(mappedCities);
      setFilteredCities(citiesForCountry);
      setEmploymentTypes(mappedEmployment);
      setVacancyStatuses(mappedStatuses);
      setCategories(mappedCategories);
      setAllSkills(mappedSkills);

      // 🟡 1) ініціалізація вибраних категорій (якщо бекенд їх передає з вакансією)
      // очікуємо щось на кшталт vacancy.categories = [{category_id, category_name}, ...]
      const initialCategoryIds = Array.isArray(vacancy.category_ids)
        ? vacancy.category_ids.map((c) => Number(c))
        : [];
      setSelectedCategoryIds(initialCategoryIds);

      const initialSkills = Array.isArray(vacancy.skills)
        ? vacancy.skills.map((s) => ({
            id: s.skill_id ?? s.id ?? null,
            name: s.skill_name ?? s.name ?? "",
          }))
        : [];
      setSelectedSkills(initialSkills);

      setForm({
        title: vacancy.title || "",
        country_id: countryId,
        city_id: cityForVacancy?.id || citiesForCountry[0]?.id || "",
        employment_type_id: vacancy.employment_type_id || "",
        vacancy_status_id: vacancy.vacancy_status_id || "",
        salary_min:
          vacancy.salary_min === null || vacancy.salary_min === undefined
            ? ""
            : vacancy.salary_min,
        salary_max:
          vacancy.salary_max === null || vacancy.salary_max === undefined
            ? ""
            : vacancy.salary_max,
        salary_comment: vacancy.salary_comment || "",
        description: vacancy.description || "",
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "country_id") {
      const citiesForCountry = cities.filter(
        (c) => String(c.country_id) === String(value)
      );
      setFilteredCities(citiesForCountry);
      setForm((prev) => ({
        ...prev,
        country_id: value,
        city_id: citiesForCountry[0]?.id || "",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // 🔹 категорії
  function toggleCategory(id) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  }

  // 🔹 фільтрація навичок
  const filteredSkills =
    skillQuery.trim().length === 0
      ? []
      : allSkills.filter((s) =>
          s.name.toLowerCase().includes(skillQuery.trim().toLowerCase())
        );

  function addExistingSkill(skill) {
    if (selectedSkills.some((s) => s.id === skill.id)) return;
    setSelectedSkills((prev) => [...prev, { id: skill.id, name: skill.name }]);
    setSkillQuery("");
  }

  function addNewSkillFromQuery() {
    const name = skillQuery.trim();
    if (!name) return;

    // якщо вже є така назва серед вибраних
    if (
      selectedSkills.some(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      setSkillQuery("");
      return;
    }

    // якщо є у словнику — додаємо як існуючий
    const existing = allSkills.find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      addExistingSkill(existing);
      return;
    }

    // інакше — новий skill
    setSelectedSkills((prev) => [
      ...prev,
      { id: null, name, isNew: true },
    ]);
    setSkillQuery("");
  }

  function removeSkill(nameOrId) {
    setSelectedSkills((prev) =>
      prev.filter((s) => s.id !== nameOrId && s.name !== nameOrId)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title.trim() || !form.city_id || !form.description.trim()) {
      setError("Назва вакансії, місто та опис є обов'язковими полями!");
      return;
    }

    if (selectedCategoryIds.length === 0) {
      setError("Оберіть хоча б одну категорію!");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const existingSkillIds = selectedSkills
        .filter((s) => s.id)
        .map((s) => s.id);
      const newSkillNames = selectedSkills
        .filter((s) => !s.id && s.isNew)
        .map((s) => s.name);

      const res = await fetch(`http://localhost:3000/vacancies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          city_id: Number(form.city_id),
          employment_type_id: Number(form.employment_type_id) || null,
          vacancy_status_id: Number(form.vacancy_status_id) || null,
          salary_min: form.salary_min ? Number(form.salary_min) : 0,
          salary_max: form.salary_max ? Number(form.salary_max) : 0,
          salary_comment: form.salary_comment || null,
          description: form.description.trim(),

          // 🔹 ВАЖЛИВО: те, що очікує бекенд
          category_ids: selectedCategoryIds,
          skill_ids: existingSkillIds,
          new_skills: newSkillNames,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setAccessDenied(true);
        setSaving(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Помилка при оновленні вакансії");
      }

      alert("Вакансію оновлено!");
      setSaving(false);
      navigate("/vacancies");
    } catch (err) {
      console.error(err);
      setError(err.message);
      setSaving(false);
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
          <p className="text-gray-600 text-lg">Завантаження вакансії...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-100 min-h-[calc(100vh-64px)]">
        <section className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Редагування вакансії
          </h1>

          {error && (
            <p className="mb-3 text-sm text-red-600">Помилка: {error}</p>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex flex-col gap-4"
          >
            <label className="text-sm font-medium text-gray-700">
              Назва вакансії <span className="text-red-500">*</span>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm font-medium text-gray-700">
                Країна
                <select
                  name="country_id"
                  value={form.country_id}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-gray-700">
                Місто <span className="text-red-500">*</span>
                <select
                  name="city_id"
                  value={form.city_id}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                >
                  {filteredCities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm font-medium text-gray-700">
                Тип зайнятості
                <select
                  name="employment_type_id"
                  value={form.employment_type_id}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {employmentTypes.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-gray-700">
                Статус вакансії
                <select
                  name="vacancy_status_id"
                  value={form.vacancy_status_id}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {vacancyStatuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm font-medium text-gray-700">
                Заробітня плата від
                <input
                  type="number"
                  name="salary_min"
                  min="0"
                  value={form.salary_min}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Заробітня плата до
                <input
                  type="number"
                  name="salary_max"
                  min="0"
                  value={form.salary_max}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="text-sm font-medium text-gray-700">
              Коментар до зарплати
              <input
                type="text"
                name="salary_comment"
                value={form.salary_comment}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </label>

            {/* Категорії */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Категорії <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-800">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-start gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="mt-1"
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Навички */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Необхідні навички
              </p>
              <p className="text-xs text-gray-500 mb-2">
                Оберіть існуючі навички зі списку або додайте нову, натиснувши
                Enter.
              </p>

              <div className="border border-blue-300 rounded-xl px-3 py-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedSkills.map((s, idx) => (
                    <span
                      key={`${s.id ?? "new"}-${idx}`}
                      className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-xs"
                    >
                      {s.name}
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => removeSkill(s.id ?? s.name)}
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>

                <input
                  type="text"
                  value={skillQuery}
                  onChange={(e) => setSkillQuery(e.target.value)}
                  placeholder="Введіть назву навички"
                  className="w-full outline-none border-none text-sm py-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addNewSkillFromQuery();
                    }
                  }}
                />

                {skillQuery.trim().length > 0 && filteredSkills.length > 0 && (
                  <div className="mt-2 border-t border-gray-200 pt-2">
                    <p className="text-xs text-gray-500 mb-1">
                      Доступні навички:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {filteredSkills.map((skill) => (
                        <button
                          key={skill.id}
                          type="button"
                          className="px-2 py-1 rounded-full border text-xs hover:bg-gray-100"
                          onClick={() => addExistingSkill(skill)}
                        >
                          {skill.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <label className="text-sm font-medium text-gray-700">
              Опис <span className="text-red-500">*</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-vertical"
                required
              />
            </label>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700"
                onClick={() => navigate("/vacancies")}
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Збереження..." : "Зберегти"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

export default EditVacancyPage;
