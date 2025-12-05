import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useAuth } from "../../AuthProvider";
import Navbar from "../../components/Navbar/Navbar";

function CandidatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const [candidate, setCandidate] = useState(null);
  const [experience, setExperience] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = location.state?.filters || null;
  const employmentLabel = filters?.selectedEmployment
    ? `для ${filters.selectedEmployment.toLowerCase()} роботи`
    : null;

  const positionLabel = filters?.search || null;

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // тягнемо кандидата, досвід і навички паралельно
        const [candRes, expRes, skillsRes] = await Promise.all([
          fetch(`http://localhost:3000/candidates/${id}`, {
            headers: authHeaders,
          }),
          fetch(`http://localhost:3000/candidates/experience/${id}`, {
            headers: authHeaders,
          }),
          fetch(`http://localhost:3000/candidates/skills/${id}`, {
            headers: authHeaders,
          }),
        ]);

        const candData = await candRes.json();
        const expData = await expRes.json();
        const skillsData = await skillsRes.json();

        if (!candRes.ok) {
          throw new Error(
            candData?.message || "Не вдалося завантажити дані кандидата"
          );
        }

        setCandidate(candData);

        if (expRes.ok && Array.isArray(expData)) {
          setExperience(expData);
        } else {
          setExperience([]);
        }

        if (skillsRes.ok && Array.isArray(skillsData)) {
          setSkills(skillsData);
        } else {
          setSkills([]);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    })();
  }, [id, token]);

  const fullName = candidate
    ? [candidate.surname, candidate.name, candidate.patronymic]
        .filter(Boolean)
        .join(" ")
    : "";

  const salaryText =
    candidate && candidate.expected_salary && Number(candidate.expected_salary) > 0
      ? `${Number(candidate.expected_salary).toLocaleString("uk-UA")} грн`
      : "за домовленістю";

  const sexLabel =
    candidate?.sex?.toLowerCase() === "male"
      ? "Чоловік"
      : candidate?.sex?.toLowerCase() === "female"
      ? "Жінка"
      : null;

  function getSexBadgeClass() {
    if (!candidate?.sex) return "bg-gray-200 text-gray-800";
    const s = candidate.sex.toLowerCase();
    if (s === "male") return "bg-blue-400 text-white";
    if (s === "female") return "bg-pink-400 text-white";
    return "bg-gray-200 text-gray-800";
  }

  function getEmploymentBadgeColor(type) {
    if (!type) return "bg-gray-400";

    const t = type.toLowerCase();
    if (t.includes("full")) return "bg-green-400";
    if (t.includes("part")) return "bg-yellow-400";
    if (t.includes("remote") || t.includes("віддал")) return "bg-blue-400";
    if (t.includes("intern")) return "bg-purple-400";
    if (t.includes("contract")) return "bg-orange-400";
    return "bg-gray-400";
  }

  function formatMonthYear(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    const month = d.toLocaleString("uk-UA", { month: "2-digit" });
    const year = d.getFullYear();
    return `${month}.${year}`;
  }

  function formatDuration(startStr, endStr) {
    if (!startStr) return null;
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : new Date();

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

    let months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    if (months < 0) return null;

    const years = Math.floor(months / 12);
    const restMonths = months % 12;

    const parts = [];
    if (years > 0) {
      const y =
        years === 1 ? "рік" : years >= 2 && years <= 4 ? "роки" : "років";
      parts.push(`${years} ${y}`);
    }

    if (restMonths > 0) {
      const m =
        restMonths === 1
          ? "місяць"
          : restMonths >= 2 && restMonths <= 4
          ? "місяці"
          : "місяців";
      parts.push(`${restMonths} ${m}`);
    }

    if (!parts.length) return null;
    return parts.join(" ");
  }

  const handleBackToList = () => {
    if (filters) {
      navigate("/candidates", { state: { filters } });
    } else {
      navigate("/candidates");
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto mt-4 px-4 pb-8">
        <nav className="text-sm text-gray-600 mb-4 flex flex-wrap items-center gap-1">
          <button
            className="text-blue-600 hover:underline"
            onClick={handleBackToList}
          >
            До результатів пошуку
          </button>

          {filters && (
            <>
              <span className="mx-1 text-gray-400">|</span>
              <button
                className="text-blue-600 hover:underline"
                onClick={handleBackToList}
              >
                Кандидати
              </button>

              {employmentLabel && (
                <>
                  <span className="text-gray-400 mx-1">›</span>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={handleBackToList}
                  >
                    {employmentLabel}
                  </button>
                </>
              )}

              {positionLabel && (
                <>
                  <span className="text-gray-400 mx-1">›</span>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={handleBackToList}
                  >
                    {positionLabel}
                  </button>
                </>
              )}
            </>
          )}
        </nav>

        {loading && (
          <p className="text-sm text-gray-500">
            Завантаження даних кандидата...
          </p>
        )}

        {error && !loading && (
          <p className="text-sm text-red-600">Помилка: {error}</p>
        )}

        {!loading && !error && candidate && (
          <> 
            <article className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {fullName || "Кандидат"}
                  </h1>
                  {candidate.position && (
                    <p className="mt-1 text-sm text-gray-700">
                      {candidate.position}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2">
                  {sexLabel && (
                    <span
                      className={
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium " +
                        getSexBadgeClass()
                      }
                    >
                      {sexLabel}
                    </span>
                  )}

                  {candidate.employment_type_name && (
                    <span
                      className={
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white " +
                        getEmploymentBadgeColor(candidate.employment_type_name)
                      }
                    >
                      {candidate.employment_type_name}
                    </span>
                  )}

                  <p className="text-sm text-gray-800">
                    Очікувана зарплата:{" "}
                    <span className="font-semibold">{salaryText}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-700 border-t border-gray-100 pt-3">
                {candidate.city_name && (
                  <span className="inline-flex items-center gap-1">
                    <span>📍</span>
                    <span>{candidate.city_name}</span>
                  </span>
                )}
                {candidate.sex && (
                  <span className="inline-flex items-center gap-1">
                    <span>🧬</span>
                    <span>{sexLabel || candidate.sex}</span>
                  </span>
                )}
              </div>

              <div className="mt-3 border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Навички
                </h3>
                {skills.length === 0 ? (
                  <p className="text-gray-600 text-sm">
                    Навички ще не додані.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill.skill_id}
                        className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800"
                      >
                        {skill.skill_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 border-t border-gray-100 pt-4">
                <div className="flex flex-col gap-1 text-sm text-gray-800">
                  <h2 className="font-semibold text-gray-900 mb-1">
                    Контактна інформація
                  </h2>

                  <div>
                    <span className="text-gray-600">📧 Email: </span>
                    <a
                      href={`mailto:${candidate.candidate_email}`}
                      className="text-blue-700 hover:underline break-all"
                    >
                      {candidate.candidate_email}
                    </a>
                  </div>

                  {candidate.phone_number && (
                    <div>
                      <span className="text-gray-600">📞 Телефон: </span>
                      <a
                        href={`tel:${candidate.phone_number}`}
                        className="text-blue-700 hover:underline"
                      >
                        {candidate.phone_number}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 text-sm text-gray-800">
                  <h2 className="font-semibold text-gray-900">
                    Досвід роботи
                  </h2>

                  {experience.length === 0 ? (
                    <p className="text-gray-600 text-sm">
                      Кандидат ще не додав досвід роботи.
                    </p>
                  ) : (
                    experience.map((exp, idx) => {
                      const startLabel = formatMonthYear(exp.start_date);
                      const endLabel = exp.end_date
                        ? formatMonthYear(exp.end_date)
                        : "нині";
                      const duration = formatDuration(
                        exp.start_date,
                        exp.end_date
                      );

                      return (
                        <div
                          key={idx}
                          className="border-l-2 border-yellow-300 pl-3"
                        >
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 inline-block bg-yellow-100 px-1">
                            {exp.position}
                          </h3>

                          <p className="mt-1 text-xs text-gray-600">
                            з {startLabel} по{" "}
                            {exp.end_date ? endLabel : "нині"}
                            {duration && ` (${duration})`}
                          </p>

                          {exp.company_name && (
                            <p className="mt-1 text-sm text-gray-800">
                              {exp.company_name}
                            </p>
                          )}

                          {exp.description && (
                            <p className="mt-1 text-sm text-gray-700 leading-snug">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </article>
            <button
              className="content-center bg-cyan-400 hover:bg-cyan-600 text-white text-sm font-semibold px-4 py-2 rounded-md mt-1 w-280"
              onClick={() =>
                navigate(`/application/${candidate.candidate_id}`, {
                  state: {
                    candidate,       
                  },
                })
              }
            >
              Закріпити до вакансії
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default CandidatePage;
