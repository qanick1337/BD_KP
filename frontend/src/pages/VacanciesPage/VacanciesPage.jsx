import { useState } from "react";

function VacanciesPage({ vacancies }) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="max-w-4xl mx-auto mt-8 px-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Вакансії</h2>
        <button className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-md">
          + Створити вакансію
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {vacancies.length === 0
          ? "У вас ще немає вакансій."
          : `${vacancies.length} вакансій`}
      </p>

      <div className="flex flex-col gap-4">
        {vacancies.map((vacancy) => (
          <article
            key={vacancy.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex flex-col gap-3"
          >
            {/* Верхня лінія: імʼя / три крапки */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{vacancy.ownerName}</span>
              <button
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={() => toggleMenu(vacancy.id)}
              >
                ⋮
              </button>
            </div>

            {/* Основна частина: назва, з/п, локація */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {vacancy.title}
                </h3>

                <p className="text-sm text-gray-800 mt-1">
                  <span className="font-semibold">
                    {vacancy.salaryFrom.toLocaleString("uk-UA")}–{vacancy.salaryTo.toLocaleString("uk-UA")} грн
                  </span>
                  {vacancy.salaryComment && (
                    <span className="text-gray-500">
                      , {vacancy.salaryComment}
                    </span>
                  )}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  {vacancy.location}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {vacancy.statusText}
                </p>
              </div>

              {/* Правий блок: кількість кандидатів + кнопки */}
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-xs text-gray-500">кандидатів</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {vacancy.candidatesCount}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-md">
                    Розмістити
                  </button>

                  <div className="relative">
                    <button
                      className="bg-gray-100 hover:bg-gray-200 text-sm font-semibold px-3 py-2 rounded-md"
                      onClick={() => toggleMenu(vacancy.id)}
                    >
                      Ще
                    </button>

                    {openMenuId === vacancy.id && (
                      <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                          Підібрати кандидатів
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                          Редагувати
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                          Опис від ChatGPT
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                          Скопіювати
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          Видалити
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default VacanciesPage;
