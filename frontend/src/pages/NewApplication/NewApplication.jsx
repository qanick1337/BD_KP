import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useAuth } from "../../AuthProvider";
import Navbar from "../../components/Navbar/Navbar";
import CandidateDetailedCard from "../../components/CandidateCard/CandidateDetailedCard";
import VacancyDetailedCard from "../../components/VacancyCard/VacancyDetailedCard";

function NewApplicationForm() {
  const { candidate_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const [candidate, setCandidate] = useState(location.state?.candidate || null);

  const [adminStatus, setAdminStatus] = useState(false);
  const [companyUserId, setCompanyUserID] = useState(null);
  const [vacancies, setVacancies] = useState([]);
  const [vacanciesLoading, setVacanciesLoading] = useState(false);
  const [vacanciesError, setVacanciesError] = useState(null);

  const [submissionStatuses, setSubmissionStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);

  const [selectedVacancyId, setSelectedVacancyId] = useState(null);
  const [selectedStatusId, setSelectedStatusId] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (candidate || !candidate_id) return;

    (async () => {
      try {
        const res = await fetch(`http://localhost:3000/candidates/${candidate_id}`, {
          headers: authHeaders,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Не вдалося завантажити кандидата");
        }
        setCandidate(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [candidate_id, candidate, token]);

  // 2) Визначаємо, чи адмін, тягнемо userId (як у VacanciesPage) і вантажимо вакансії
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setVacanciesLoading(true);
        setVacanciesError(null);

        const isAdmin = await getAdminStatus();
        let currentUserId = null;

        if (!isAdmin) {
          currentUserId = await fetchUserId();
        }

        await loadVacancies(isAdmin, currentUserId);
        setVacanciesLoading(false);
      } catch (err) {
        console.error(err);
        setVacanciesError(err.message);
        setVacanciesLoading(false);
      }
    })();
  }, [token]);

  async function getAdminStatus() {
    try {
      const response = await fetch("http://localhost:3000/users/is-admin", {
        method: "GET",
        headers: authHeaders,
      });

      const data = await response.json();

      if (response.status === 401) {
        return false;
      }

      if (!response.ok) {
        throw new Error(data.message || "Не вдалося визначити адмін-статус");
      }

      setAdminStatus(data.isAdmin);
      return data.isAdmin;
    } catch (err) {
      console.log(err);
      setAdminStatus(false);
      return false;
    }
  }

  async function fetchUserId() {
    try {
      const res = await fetch("http://localhost:3000/users/me", {
        headers: authHeaders,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || "Не вдалося отримати інформацію про користувача"
        );
      }

      setCompanyUserID(data.company_user_id);
      return data.company_user_id;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function loadVacancies(isAdmin, currentUserId) {
    try {
      const url = isAdmin
        ? "http://localhost:3000/vacancies"
        : "http://localhost:3000/vacancies/user";

      const headers = {
        ...authHeaders,
      };

      if (!isAdmin && currentUserId) {
        headers["X-Company-User-Id"] = String(currentUserId);
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (response.status === 401) {
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Не вдалося завантажити вакансії");
      }

      setVacancies(data);
    } catch (err) {
      console.log(err);
      setVacanciesError(err.message);
    }
  }

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setStatusesLoading(true);
        const res = await fetch(
          "http://localhost:3000/dict/application-statuses",
          {
            headers: authHeaders,
          }
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Не вдалося завантажити статуси");
        }

        const mappedStatuses = data.map((st) => ({
          status_id: st.application_status_id,
          status_name: st.application_status_name,
        }));

        setSubmissionStatuses(mappedStatuses);
        setStatusesLoading(false);
      } catch (err) {
            console.error(err);
            setStatusesLoading(false);
      }
    })();
  }, [token]);

  const handleSelectVacancy = (vacancyId) => {
    setSelectedVacancyId(vacancyId);
    setSubmitSuccess(null);
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVacancyId || !candidate_id || !selectedStatusId) return;

    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      const res = await fetch("http://localhost:3000/application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          candidate_id: Number(candidate_id),
          vacancy_id: selectedVacancyId,
          status_id: selectedStatusId,
          comment: comment || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Не вдалося створити подання");
      }

      setSubmitSuccess("Подання успішно створено");
      setComment("");
      navigate("/applications")
    } catch (err) {
      console.error(err);
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="max-w-6xl mx-auto mt-6 px-4 pb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Закріпити кандидата до вакансії
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            {candidate ? (
              <CandidateDetailedCard candidate={candidate} />
            ) : (
              <p className="text-sm text-gray-500">
                Завантаження даних кандидата...
              </p>
            )}

            <button
              className="mt-3 text-sm text-blue-600 hover:underline"
              onClick={() => navigate(-1)}
            >
              ← Назад до кандидата
            </button>
          </div>

          <div className="md:col-span-2 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Оберіть вакансію
              </h2>

              {vacanciesError && (
                <p className="text-sm text-red-600 mb-2">
                  Помилка: {vacanciesError}
                </p>
              )}

              {vacanciesLoading ? (
                <p className="text-sm text-gray-500">
                  Завантаження вакансій...
                </p>
              ) : vacancies.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Немає доступних вакансій.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {vacancies.map((vacancy) => {
                    const isSelected =
                      selectedVacancyId === vacancy.vacancy_id;
                    return (
                      <div
                        key={vacancy.vacancy_id}
                        className={
                          "rounded-2xl border-2 transition-colors cursor-pointer " +
                          (isSelected
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-transparent hover:border-cyan-200")
                        }
                        onClick={() =>
                          handleSelectVacancy(vacancy.vacancy_id)
                        }
                      >
                        <VacancyDetailedCard
                          vacancy={vacancy}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {selectedVacancyId && (
              <form
                onSubmit={handleSubmit}
                className="mt-4 border-t border-gray-200 pt-4 flex flex-col gap-3"
              >
                <h3 className="text-md font-semibold text-gray-900">
                  Параметри подання
                </h3>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Статус подання <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={selectedStatusId}
                    onChange={(e) => setSelectedStatusId(e.target.value)}
                    disabled={statusesLoading}
                    required
                  >
                    <option value="">Оберіть статус</option>
                    {submissionStatuses.map((st) => (
                      <option key={st.status_id} value={st.status_id}>
                        {st.status_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Коментар (необов'язково)
                  </label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px]"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Наприклад: пройшов перший етап інтерв'ю..."
                  />
                </div>

                {submitError && (
                  <p className="text-sm text-red-600">{submitError}</p>
                )}
                {submitSuccess && (
                  <p className="text-sm text-green-600">
                    {submitSuccess}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!selectedStatusId || submitting}
                    className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-md"
                  >
                    {submitting ? "Збереження..." : "Створити подання"}
                  </button>

                  <button
                    type="button"
                    className="text-sm text-gray-600 hover:underline"
                    onClick={() => {
                      setSelectedVacancyId(null);
                      setSelectedStatusId("");
                      setComment("");
                      setSubmitError(null);
                      setSubmitSuccess(null);
                    }}
                  >
                    Скасувати вибір вакансії
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default NewApplicationForm;
