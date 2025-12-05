import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../../components/Navbar/Navbar";
import { useAuth } from "../../AuthProvider";

function CreateVacancyPage() {
  const { token, email } = useAuth();
  const navigate = useNavigate();

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
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vacancyStatuses, setVacancyStatuses] = useState([]);
  const [allSkills, setAllSkills] = useState([]);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillQuery, setSkillQuery] = useState("");

  const [loadingDicts, setLoadingDicts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const [companyUserId, setCompanyUserID] = useState(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!token) {
      setAccessDenied(true);
      setLoadingDicts(false);
      return;
    }
    fetchAllDicts();
    fetchUserId();
  }, [token]);

  async function fetchAllDicts() {
    try {
      setLoadingDicts(true);

      const [
        countriesRes,
        employmentRes,
        categoriesRes,
        skillsRes,
        vacancyStatusesRes,
      ] = await Promise.all([
        fetch("http://localhost:3000/dict/countries", { headers: authHeaders }),
        fetch("http://localhost:3000/dict/employment-types", { headers: authHeaders }),
        fetch("http://localhost:3000/dict/categories", { headers: authHeaders }),
        fetch("http://localhost:3000/dict/skills", { headers: authHeaders }),
        fetch("http://localhost:3000/dict/vacancy-statuses", { headers: authHeaders }),
      ]);

      const [
        countriesData,
        employmentData,
        categoriesData,
        skillsData,
        vacancyStatusesData,
      ] = await Promise.all([
        countriesRes.json(),
        employmentRes.json(),
        categoriesRes.json(),
        skillsRes.json(),
        vacancyStatusesRes.json(),
      ]);

      if (!countriesRes.ok) throw new Error(countriesData?.message || "Failed to load countries");
      if (!employmentRes.ok) throw new Error(employmentData?.message || "Failed to load employment types");
      if (!categoriesRes.ok) throw new Error(categoriesData?.message || "Failed to load categories");
      if (!skillsRes.ok) throw new Error(skillsData?.message || "Failed to load skills");
      if (!vacancyStatusesRes.ok) throw new Error(vacancyStatusesData?.message || "Failed to load vacancy statuses");

      const mappedCountries = countriesData.map((country) => ({
        id: country.country_id,
        name: country.country_name,
      }));
      const mappedEmploymentTypes = employmentData.map((employment) => ({
        id: employment.employment_type_id,
        name: employment.employment_type_name,
      }));
      const mappedCategories = categoriesData.map((category) => ({
        id: category.category_id,
        name: category.category_name,
      }));
      const mappedSkills = skillsData.map((skill) => ({
        id: skill.skill_id,
        name: skill.skill_name,
      }));
      const mappedVacancyStatuses = vacancyStatusesData.map((status) => ({
        id: status.vacancy_status_id,
        name: status.vacancy_status_name,
      }));

      setCountries(mappedCountries);
      setEmploymentTypes(mappedEmploymentTypes);
      setCategories(mappedCategories);
      setAllSkills(mappedSkills);
      setVacancyStatuses(mappedVacancyStatuses);

      setForm((prev) => ({
        ...prev,
        country_id: mappedCountries[0]?.id || "",
        employment_type_id: mappedEmploymentTypes[0]?.id || "",
        vacancy_status_id: mappedVacancyStatuses[0]?.id || "",
      }));

      if (mappedCountries[0]?.id) {
        fetchCities(mappedCountries[0].id);
      }

      setLoadingDicts(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoadingDicts(false);
    }
  }

  async function fetchCities(countryId) {
    try {
      const res = await fetch(
        `http://localhost:3000/dict/cities?country_id=${countryId}`,
        { headers: authHeaders }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load cities");

      const mappedCities = data.map((city) => ({
        id: city.city_id,
        name: city.city_name,
      }));
      setCities(mappedCities);
      setForm((prev) => ({
        ...prev,
        city_id: mappedCities[0]?.id || "",
      }));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

    async function fetchUserId() {
      try {
          const res = await fetch("http://localhost:3000/users/me", {
          headers: authHeaders,
          });

          const data = await res.json();

          if (!res.ok) {
              throw new Error(data?.message || "Failed to load user info");
          }

          setCompanyUserID(data.company_user_id);
      } catch (err) {
          console.error(err);
          setError(err.message);
      }
    }


  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "country_id") {
      fetchCities(value);
    }
  }

  function toggleCategory(id) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  }

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

    if (
        selectedSkills.some(
        (s) => s.name.toLowerCase() === name.toLowerCase()
        )
    ) {
        setSkillQuery("");
        return;
    }

    const existing = allSkills.find(
        (s) => s.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
        addExistingSkill(existing);
        return;
    }

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
      setError("Необхідні поля: назва вакансії, місто, опис.");
      return;
    }
    if (selectedCategoryIds.length === 0) {
      setError("Виберіть хоча б одну категорію.");
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

      const res = await fetch("http://localhost:3000/vacancies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          company_user_id: companyUserId,
          title: form.title,
          city_id: Number(form.city_id),
          employment_type_id: Number(form.employment_type_id),
          vacancy_status_id: Number(form.vacancy_status_id),
          salary_min: form.salary_min ? Number(form.salary_min) : 0,
          salary_max: form.salary_max ? Number(form.salary_max) : 0,
          salary_comment: form.salary_comment || null,
          description: form.description,
          category_ids: selectedCategoryIds,
          skill_ids: existingSkillIds,
          new_skills: newSkillNames,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create vacancy");
      }

      alert("Вакансія успішно додана!");
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
            <p className="text-gray-700 text-sm">
              Доступ заборонено
            </p>
          </div>
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
            Створення нової вакансії
          </h1>

          {error && (
            <p className="mb-3 text-sm text-red-600">Помилка: {error}</p>
          )}

          {loadingDicts ? (
            <p className="text-gray-600 text-sm">Завантаження довідників...</p>
          ) : (
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
                  placeholder="наприклад Middle Frontend Developer"
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Країна <span className="text-red-500">*</span>
                  <select
                    name="country_id"
                    value={form.country_id}
                    onChange={handleChange}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
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
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Тип зайнятості <span className="text-red-500">*</span>
                  <select
                    name="employment_type_id"
                    value={form.employment_type_id}
                    onChange={handleChange}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
                  >
                    {employmentTypes.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Статус вакансії <span className="text-red-500">*</span>
                  <select
                    name="vacancy_status_id"
                    value={form.vacancy_status_id}
                    onChange={handleChange}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
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
                    required
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
                    required
                  />
                </label>
              </div>

              <label className="text-sm font-medium text-gray-700">
                Коментар до заробітньої плати
                <input
                  type="text"
                  name="salary_comment"
                  value={form.salary_comment}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </label>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Категорії <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-800">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-start gap-2 cursor-pointer">
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

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Необхідні навички
                </p>
                <p className="text-xs text-gray-500 mb-2">
                   Оберіть існуючі навички зі списку або додайте нову натиснувши Enter.
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
                      <p className="text-xs text-gray-500 mb-1">Введіть назву навички</p>
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
                  placeholder="Коротко опишіть, що буде очікуватися від кандидата"
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
                  {saving ? "Зберігаємо..." : "Створити вакансію"}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </>
  );
}

export default CreateVacancyPage;
