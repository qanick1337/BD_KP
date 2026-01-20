import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";
import Navbar from "../../components/Navbar/Navbar";

function CompanyStatsPage() {
  const { token } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [adminError, setAdminError] = useState(null);

  // 1) Статистика подань компанії (по статусах)
  const [statusStats, setStatusStats] = useState([]);
  const [loadingStatusStats, setLoadingStatusStats] = useState(false);
  const [statusStatsError, setStatusStatsError] = useState(null);

  // 2) Статистика по користувачах компанії (HR)
  const [userStats, setUserStats] = useState([]);
  const [loadingUserStats, setLoadingUserStats] = useState(false);
  const [userStatsError, setUserStatsError] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Перевірка, що користувач — адмін
  useEffect(() => {
    if (!token) {
      setCheckingAdmin(false);
      setIsAdmin(false);
      return;
    }

    (async () => {
      try {
        setCheckingAdmin(true);
        setAdminError(null);

        const res = await fetch("http://localhost:3000/users/is-admin", {
          method: "GET",
          headers: authHeaders,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Не вдалося визначити адмін-статус");
        }

        setIsAdmin(Boolean(data.isAdmin));
        setCheckingAdmin(false);
      } catch (err) {
        console.error(err);
        setAdminError(err.message);
        setIsAdmin(false);
        setCheckingAdmin(false);
      }
    })();
  }, [token]);

  // Статистика компанії (подання по статусах)
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoadingStatusStats(true);
        setStatusStatsError(null);

        const res = await fetch("http://localhost:3000/stats/company", {
          headers: authHeaders,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.message || "Не вдалося завантажити статистику компанії"
          );
        }

        setStatusStats(Array.isArray(data) ? data : []);
        setLoadingStatusStats(false);
      } catch (err) {
        console.error(err);
        setStatusStatsError(err.message);
        setLoadingStatusStats(false);
      }
    })();
  }, [token]);

  // Статистика по користувачах (HR)
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoadingUserStats(true);
        setUserStatsError(null);

        const res = await fetch("http://localhost:3000/stats/user_stats", {
          headers: authHeaders,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.message || "Не вдалося завантажити статистику HR-користувачів"
          );
        }

        setUserStats(Array.isArray(data) ? data : []);
        setLoadingUserStats(false);
      } catch (err) {
        console.error(err);
        setUserStatsError(err.message);
        setLoadingUserStats(false);
      }
    })();
  }, [token]);

  // Підсумки для статусів
  const totalApplicationsByStatus = statusStats.reduce(
    (sum, item) => sum + Number(item.total_applications || 0),
    0
  );

  // Підсумки для користувачів
  const totalVacancies = userStats.reduce(
    (sum, u) => sum + Number(u.vacancies_created || 0),
    0
  );
  const totalApplicationsByUsers = userStats.reduce(
    (sum, u) => sum + Number(u.applications_received || 0),
    0
  );

  const handleDownloadReport = async () => {
    if (!token || reportLoading) return;

    try {
      setReportLoading(true);
      setReportError(null);

      const res = await fetch(
        "http://localhost:3000/report/active_vacancies/pdf",
        {
          method: "GET",
          headers: authHeaders,
        }
      );

      if (!res.ok) {
        let message = "Failed to download report";
        try {
          const data = await res.json();
          message = data?.message || message;
        } catch {
          // ignore JSON parse errors for non-JSON responses
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "active_vacancies_report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setReportError(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="max-w-6xl mx-auto mt-8 px-4 pb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Статистика вашої компанії
        </h1>

        {/* Адмін-статус */}
        {checkingAdmin ? (
          <p className="text-sm text-gray-500 mb-4">
            Перевірка прав доступу...
          </p>
        ) : !isAdmin ? (
          <p className="text-sm text-red-600 mb-4">
            У вас немає прав для перегляду цієї сторінки.
          </p>
        ) : adminError ? (
          <p className="text-sm text-red-600 mb-4">
            Помилка перевірки доступу: {adminError}
          </p>
        ) : null}

        {/* Якщо не адмін — не показуємо статистику */}
        {!checkingAdmin && !isAdmin ? null : (
          <div className="flex flex-col gap-8">
            <section>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  disabled={reportLoading}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {reportLoading
                    ? "Створення звіту..."
                    : "Завантажити звіт з активних вакансій"}
                </button>
                {reportError && (
                  <span className="text-sm text-red-600">{reportError}</span>
                )}
              </div>
            </section>
            {/* Блок 1: Статистика подань за статусами */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Подання за статусами
              </h2>

              {statusStatsError && (
                <p className="text-sm text-red-600 mb-2">
                  Помилка: {statusStatsError}
                </p>
              )}

              {loadingStatusStats ? (
                <p className="text-sm text-gray-500">
                  Завантаження статистики подань...
                </p>
              ) : statusStats.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Статистика подань відсутня.
                </p>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-3">
                    Усього подань:{" "}
                    <span className="font-semibold text-gray-900">
                      {totalApplicationsByStatus}
                    </span>
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Статус
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Кількість подань
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Частка
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {statusStats.map((row) => {
                          const count = Number(row.total_applications || 0);
                          const percentage =
                            totalApplicationsByStatus > 0
                              ? Math.round(
                                  (count / totalApplicationsByStatus) * 100
                                )
                              : 0;

                          return (
                            <tr
                              key={row.status}
                              className="border-b border-gray-100 last:border-b-0"
                            >
                              <td className="px-4 py-2 text-gray-900">
                                {row.status}
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {count}
                              </td>
                              <td className="px-4 py-2 text-gray-700">
                                {percentage}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {/* Блок 2: Статистика по HR-користувачах */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Статистика HR-користувачів
              </h2>

              {userStatsError && (
                <p className="text-sm text-red-600 mb-2">
                  Помилка: {userStatsError}
                </p>
              )}

              {loadingUserStats ? (
                <p className="text-sm text-gray-500">
                  Завантаження статистики HR...
                </p>
              ) : userStats.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Статистика HR-користувачів відсутня.
                </p>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-3">
                    Загалом вакансій створено:{" "}
                    <span className="font-semibold text-gray-900">
                      {totalVacancies}
                    </span>
                    <br />
                    Загалом отримано подань:{" "}
                    <span className="font-semibold text-gray-900">
                      {totalApplicationsByUsers}
                    </span>
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            HR (користувач)
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Вакансій створено
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Подань отримано
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Частка від усіх подань
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {userStats.map((row) => {
                          const vc = Number(row.vacancies_created || 0);
                          const ac = Number(row.applications_received || 0);

                          const applicationsShare =
                            totalApplicationsByUsers > 0
                              ? Math.round(
                                  (ac / totalApplicationsByUsers) * 100
                                )
                              : 0;

                          return (
                            <tr
                              key={row.company_user_id}
                              className="border-b border-gray-100 last:border-b-0"
                            >
                              <td className="px-4 py-2 text-gray-900">
                                {row.name} {row.surname}
                              </td>
                              <td className="px-4 py-2 text-gray-800">{vc}</td>
                              <td className="px-4 py-2 text-gray-800">{ac}</td>
                              <td className="px-4 py-2 text-gray-700">
                                {applicationsShare}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </>
  );
}

export default CompanyStatsPage;
