import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";

function CandidateDetailedCard({ candidate, onClick }) {
  const { token } = useAuth();
  const [experience, setExperience] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loadingExtra, setLoadingExtra] = useState(false);
  const [extraError, setExtraError] = useState(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const {
    candidate_id,
    name,
    surname,
    patronymic,
    position,
    city_name,
    employment_type_name,
    expected_salary,
    sex,
  } = candidate || {};

  const fullName = [surname, name, patronymic].filter(Boolean).join(" ");
  const salaryText =
    expected_salary && Number(expected_salary) > 0
      ? `${Number(expected_salary).toLocaleString("uk-UA")} грн`
      : "за домовленістю";

  const sexLabel =
    sex?.toLowerCase() === "male"
      ? "Чоловік"
      : sex?.toLowerCase() === "female"
      ? "Жінка"
      : null;

  function getSexBadgeClass() {
    if (!sex) return "bg-gray-200 text-gray-800";
    const s = sex.toLowerCase();
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

  useEffect(() => {
    if (!candidate_id) return;

    (async () => {
      try {
        setLoadingExtra(true);
        setExtraError(null);

        const [expRes, skillsRes] = await Promise.all([
          fetch(`http://localhost:3000/candidates/experience/${candidate_id}`, {
            headers: authHeaders,
          }),
          fetch(`http://localhost:3000/candidates/skills/${candidate_id}`, {
            headers: authHeaders,
          }),
        ]);

        const expData = await expRes.json();
        const skillsData = await skillsRes.json();

        if (!expRes.ok) {
          throw new Error(
            expData?.message || "Не вдалося завантажити досвід роботи"
          );
        }

        if (!skillsRes.ok) {
          throw new Error(
            skillsData?.message || "Не вдалося завантажити навички"
          );
        }

        setExperience(Array.isArray(expData) ? expData : []);
        setSkills(Array.isArray(skillsData) ? skillsData : []);
        setLoadingExtra(false);
      } catch (err) {
        console.error(err);
        setExtraError(err.message);
        setLoadingExtra(false);
        setExperience([]);
        setSkills([]);
      }
    })();
  }, [candidate_id, token]);

  if (!candidate) return null;

  return (
    <article
      className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      {/* Верхній блок: імʼя, позиція, бейджі */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {position || "Позиція не вказана"}
          </h3>
          {fullName && (
            <p className="text-sm text-gray-700">{fullName}</p>
          )}
          {city_name && (
            <p className="mt-1 text-xs text-gray-600">📍 {city_name}</p>
          )}
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1">
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

          {employment_type_name && (
            <span
              className={
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white " +
                getEmploymentBadgeColor(employment_type_name)
              }
            >
              {employment_type_name}
            </span>
          )}

          <p className="text-sm text-gray-800">
            Очікувана зарплата:{" "}
            <span className="font-semibold">{salaryText}</span>
          </p>
        </div>
      </div>

      {/* Досвід + навички */}
      <div className="border-t border-gray-100 pt-3 text-sm text-gray-800 flex flex-col gap-3">
        {loadingExtra && (
          <p className="text-xs text-gray-500">Завантаження досвіду та навичок…</p>
        )}

        {extraError && (
          <p className="text-xs text-red-500">
            Не вдалося завантажити деталі кандидата.
          </p>
        )}

        {/* Досвід роботи */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">
            Досвід роботи
          </h4>

          {experience.length === 0 ? (
            <p className="text-xs text-gray-600">
              Досвід роботи не вказаний.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {experience.map((exp, idx) => {
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
                    <h5 className="font-semibold text-sm text-gray-900 inline-block bg-yellow-100 px-1">
                      {exp.position}
                    </h5>

                    <p className="mt-1 text-xs text-gray-600">
                      з {startLabel} по{" "}
                      {exp.end_date ? endLabel : "нині"}
                      {duration && ` (${duration})`}
                    </p>

                    {exp.company_name && (
                      <p className="mt-1 text-xs text-gray-700">
                        {exp.company_name}
                      </p>
                    )}

                    {exp.description && (
                      <p className="mt-1 text-xs text-gray-700 leading-snug">
                        {exp.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Навички */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">
            Навички
          </h4>

          {skills.length === 0 ? (
            <p className="text-xs text-gray-600">
              Навички не вказані.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-1">
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
      </div>
    </article>
  );
}

export default CandidateDetailedCard;
