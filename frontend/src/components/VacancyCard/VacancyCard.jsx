function VacancyCard({vacancy,onClick, onDelete}) {
  return (
    <article
      className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex flex-col gap-3"
      onClick={onClick}
    >
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Створено користувачем {vacancy.name} {vacancy.surname} </span>
        <span>{new Date(vacancy.created_at).toLocaleDateString("uk-UA")}</span>        
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {vacancy.title}
          </h3>

          <p className="text-sm text-gray-800 mt-1">
            <span className="font-semibold">
              {vacancy.salary_min}–
              {vacancy.salary_max} грн
            </span>
            {vacancy.salaryComment && (
              <span className="text-gray-500">
                , {vacancy.salaryComment}
              </span>
            )}
          </p>

          <p className="text-sm text-gray-600 mt-1">
            {vacancy.city_name}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {vacancy.vacancy_status_name}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-xs text-gray-500">кандидатів</p>
            <p className="text-xl font-semibold text-gray-800">
              {vacancy.candidatesCount}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="bg-red-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-md mt-2 sm:mt-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            >
              Видалити
            </button>

          </div>
        </div>
      </div>
    </article>
  );
}

export default VacancyCard;
