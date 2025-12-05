import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";

function VacancyDetailedCard({ vacancy, onClick, onDelete }) {
  const { token } = useAuth();
  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!vacancy?.vacancy_id) return;

    (async () => {
      try {
        setSkillsLoading(true);
        setSkillsError(null);

        const res = await fetch(
          `http://localhost:3000/vacancies/${vacancy.vacancy_id}/skills`,
          {
            headers: authHeaders,
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Не вдалося завантажити навички");
        }

        setSkills(Array.isArray(data) ? data : []);
        setSkillsLoading(false);
      } catch (err) {
        console.error(err);
        setSkillsError(err.message);
        setSkills([]);
        setSkillsLoading(false);
      }
    })();
  }, [vacancy?.vacancy_id, token]);

  const createdDate = vacancy?.created_at
    ? new Date(vacancy.created_at).toLocaleDateString("uk-UA")
    : "";

  const salaryMin = vacancy?.salary_min
    ? Number(vacancy.salary_min).toLocaleString("uk-UA")
    : null;

  const salaryMax = vacancy?.salary_max
    ? Number(vacancy.salary_max).toLocaleString("uk-UA")
    : null;

  return (
    <article
      className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      {/* Верхня строка: автор + дата */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
        <span>
          Створено користувачем{" "}
          <span className="font-medium">
            {vacancy.name} {vacancy.surname}
          </span>
        </span>
        {createdDate && <span>{createdDate}</span>}
      </div>

      {/* Основна інформація */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {vacancy.title}
          </h3>

          {/* Статус вакансії */}
          {vacancy.vacancy_status_name && (
            <p className="mt-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
              {vacancy.vacancy_status_name}
            </p>
          )}

          {/* Зарплата */}
          {(salaryMin || salaryMax) && (
            <p className="text-sm text-gray-800 mt-2">
              <span className="font-semibold">
                {salaryMin && salaryMax
                  ? `${salaryMin}–${salaryMax} грн`
                  : salaryMin
                  ? `${salaryMin} грн`
                  : `${salaryMax} грн`}
              </span>
              {vacancy.salaryComment && (
                <span className="text-gray-500">, {vacancy.salaryComment}</span>
              )}
            </p>
          )}

          {/* Місто + тип зайнятості, якщо є */}
          <p className="text-sm text-gray-600 mt-1">
            {vacancy.city_name}
            {vacancy.employment_type_name && (
              <span className="text-gray-500">
                {" • "}
                {vacancy.employment_type_name}
              </span>
            )}
          </p>

          {/* Опис вакансії (коротко) */}
          {vacancy.description && (
            <p className="mt-3 text-sm text-gray-700 leading-snug line-clamp-4">
              {vacancy.description}
            </p>
          )}

          {/* Навички */}
          <div className="mt-3">
            <h4 className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">
              Навички
            </h4>

            {skillsLoading ? (
              <p className="text-xs text-gray-500">Завантаження навичок…</p>
            ) : skillsError ? (
              <p className="text-xs text-red-500">
                Не вдалося завантажити навички
              </p>
            ) : skills.length === 0 ? (
              <p className="text-xs text-gray-500">Навички не вказані.</p>
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

        {/* Правий блок: статистика + кнопки */}
        <div className="flex flex-col items-end gap-2 min-w-[120px]">
          <div className="text-right">
            <p className="text-xs text-gray-500">кандидатів</p>
            <p className="text-xl font-semibold text-gray-800">
              {vacancy.candidatesCount ?? 0}
            </p>
          </div>

          {/* <button
            className="bg-red-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-md mt-2 sm:mt-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            Видалити
          </button> */}
        </div>
      </div>
    </article>
  );
}

export default VacancyDetailedCard;
