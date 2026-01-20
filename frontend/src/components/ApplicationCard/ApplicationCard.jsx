function ApplicationCard({ application, onClick, onEdit }) {
  const fullName = [application.candidate_surname, application.candidate_name]
    .filter(Boolean)
    .join(" ");

  const recruiterName = [application.recruiter_name, application.recruiter_surname]
    .filter(Boolean)
    .join(" ");

  const createdLabel = application.created_at
    ? new Date(application.created_at).toLocaleDateString("uk-UA")
    : "—";

  const salaryText = (() => {
    const min = Number(application.salary_min || 0);
    const max = Number(application.salary_max || 0);
    if (min && max) return `${min} - ${max}`;
    if (min) return `${min}+`;
    if (max) return `до ${max}`;
    return "не вказано";
  })();

  return (
    <article
      className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex flex-col gap-3"
      onClick={onClick}
    >
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{createdLabel}</span>
        <div className="flex items-center gap-3">
          {recruiterName && <span>Recruiter: {recruiterName}</span>}
          {onEdit && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 bg-zinc-100 hover:bg-sky-200 hover:text-sky-700 text-sky-400 text-xs font-semibold px-4 py-2 rounded-md border border-zinc-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(application);
              }}
            >
              Редагувати ✏️
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {fullName || "Кандидат"}
          </h3>
          {application.candidate_position && (
            <p className="text-sm text-gray-700 mt-1">
              {application.candidate_position}
            </p>
          )}
          <p className="text-sm text-gray-600 mt-1">
            Вакансія: <span className="font-semibold">{application.vacancy_title}</span>
          </p>
          {application.city_name && (
            <p className="text-xs text-gray-500 mt-1">{application.city_name}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap gap-2 justify-end">
            {application.application_status_name && (
              <span className="inline-flex items-center rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 px-3 py-1 text-xs font-semibold">
                {application.application_status_name}
              </span>
            )}
            {application.vacancy_status_name && (
              <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1 text-xs font-semibold">
                {application.vacancy_status_name}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-600">Зарплата: {salaryText}</p>
        </div>
      </div>

      {application.comment && (
        <p className="text-sm text-gray-700 leading-snug border-t border-gray-100 pt-2">
          Коментар: {application.comment}
        </p>
      )}
    </article>
  );
}

export default ApplicationCard;
