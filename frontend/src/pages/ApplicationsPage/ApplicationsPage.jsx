import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";
import Navbar from "../../components/Navbar/Navbar";
import ApplicationCard from "../../components/ApplicationCard/ApplicationCard";

function ApplicationsPage() {
  const { token } = useAuth();

  const [adminStatus, setAdminStatus] = useState(false);
  const [companyUserId, setCompanyUserId] = useState(null);

  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);

  const [submissionStatuses, setSubmissionStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);

  const [editingApplication, setEditingApplication] = useState(null);
  const [editStatusId, setEditStatusId] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editError, setEditError] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const isAdmin = await getAdminStatus();
        let currentUserId = null;

        if (!isAdmin) {
          currentUserId = await fetchUserId();
        }

        await loadApplications(isAdmin, currentUserId);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setStatusesLoading(true);
        const res = await fetch(
          "http://localhost:3000/dict/application-statuses",
          { headers: authHeaders }
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load application statuses");
        }

        const mappedStatuses = data.map((st) => ({
          id: st.application_status_id,
          name: st.application_status_name,
        }));

        setSubmissionStatuses(mappedStatuses);
        setStatusesLoading(false);
      } catch (err) {
        console.error(err);
        setStatusesLoading(false);
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
        throw new Error(data.message || "Не вдалося отримати статус користувача");
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

      setCompanyUserId(data.company_user_id);
      return data.company_user_id;
    } catch (err) {
      console.error(err);
      setError(err.message);
      throw err;
    }
  }

  async function loadApplications(isAdmin, currentUserId) {
    try {
      const url = isAdmin
        ? "http://localhost:3000/application"
        : "http://localhost:3000/application/user";

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
        throw new Error(data.message || "Не вдалося завантажити подання");
      }

      setApplications(data);
      setFilteredApplications(data);
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  }

  function openEdit(application) {
    setEditingApplication(application);
    setEditStatusId(application?.application_status_id ? String(application.application_status_id) : "");
    setEditComment(application?.comment || "");
    setEditError(null);
  }

  function closeEdit() {
    setEditingApplication(null);
    setEditStatusId("");
    setEditComment("");
    setEditError(null);
  }

  async function handleEditSubmit(e) {
    e.preventDefault();

    if (!editingApplication || !editStatusId) return;

    try {
      setSavingEdit(true);
      setEditError(null);

      const res = await fetch(
        `http://localhost:3000/application/${editingApplication.application_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            status_id: Number(editStatusId),
            comment: editComment.trim() ? editComment.trim() : null,
          }),
        }
      );

      const data = await res.json();

      if (res.status === 401) {
        setSavingEdit(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Не вдалось оновити подання");
      }

      const statusName =
        submissionStatuses.find((s) => String(s.id) === String(editStatusId))
          ?.name || editingApplication.application_status_name;

      const updatedApplication = {
        ...editingApplication,
        application_status_id: Number(editStatusId),
        application_status_name: statusName,
        comment: editComment.trim() ? editComment.trim() : null,
      };

      setApplications((prev) =>
        prev.map((app) =>
          app.application_id === editingApplication.application_id
            ? updatedApplication
            : app
        )
      );

      closeEdit();
    } catch (err) {
      console.error(err);
      setEditError(err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  const uniqueStatuses = [
    ...new Set(applications.map((a) => a.application_status_name).filter(Boolean)),
  ];

  const getCreatedTime = (app) => {
    if (!app.created_at) return 0;
    const d = new Date(app.created_at);
    return Number.isNaN(d.getTime()) ? 0 : d.getTime();
  };

  useEffect(() => {
    let list = [...applications];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        (
          (a.candidate_name || "") +
          " " +
          (a.candidate_surname || "") +
          " " +
          (a.candidate_position || "") +
          " " +
          (a.vacancy_title || "") +
          " " +
          (a.comment || "")
        )
          .toLowerCase()
          .includes(q)
      );
    }

    if (selectedStatus) {
      list = list.filter(
        (a) => a.application_status_name === selectedStatus
      );
    }

    switch (sortOption) {
      case "oldest":
        list.sort((a, b) => getCreatedTime(a) - getCreatedTime(b));
        break;
      default:
        list.sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
        break;
    }

    setFilteredApplications(list);
  }, [applications, search, selectedStatus, sortOption]);

  function handleResetFilters() {
    setSearch("");
    setSelectedStatus("");
    setSortOption("newest");
  }

  return (
    <>
      <Navbar />
      <section className="max-w-6xl mx-auto mt-8 px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Подання</h2>
          <div className="text-sm text-gray-600">
            {adminStatus ? "Адміністратор" : "Користувач"}{" "}
            {companyUserId ? `(ID: ${companyUserId})` : ""}
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-4 sm:flex-row">
          <input
            type="text"
            placeholder="Пошук за кандидатом, вакансією чи коментарем..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="w-full sm:w-64 border rounded-lg px-3 py-2"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Усі статуси</option>
            {uniqueStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="w-full sm:w-48 border rounded-lg px-3 py-2"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="newest">Найновіші спочатку</option>
            <option value="oldest">Найстаріші спочатку</option>
          </select>

          <button
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
            onClick={handleResetFilters}
          >
            Скинути
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-600 mb-2">Помилка: {error}</p>
          )}

          {loading ? (
            <p className="text-sm text-gray-500 mb-4">
              Завантаження подань...
            </p>
          ) : filteredApplications.length === 0 ? (
            <h2 className="text-sm text-gray-500">
              Подань за вашими фільтрами немає.
            </h2>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-2">
                Показано {filteredApplications.length} (усього {applications.length})
              </p>
              {filteredApplications.map((app) => (
                <ApplicationCard key={app.application_id} application={app} onEdit={openEdit} />
              ))}
            </>
          )}
        </div>
      {editingApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Редагувати подання</h3>
                <p className="text-sm text-gray-500">
                  {(editingApplication.candidate_name || "") + " " +
                    (editingApplication.candidate_surname || "")}
                  {" - "}
                  {editingApplication.vacancy_title}
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={closeEdit}
              >
                Закрити
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-700">
                Статус <span className="text-red-500">*</span>
                <select
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={editStatusId}
                  onChange={(e) => setEditStatusId(e.target.value)}
                  disabled={statusesLoading}
                  required
                >
                  <option value="">Оберіть статус</option>
                  {submissionStatuses.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-gray-700">
                Коментар
                <textarea
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[90px]"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="Додайте коментар"
                />
              </label>

              {editError && (
                <p className="text-sm text-red-600">{editError}</p>
              )}

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700"
                  onClick={closeEdit}
                >
                  Назад
                </button>
                <button
                  type="submit"
                  disabled={!editStatusId || savingEdit}
                  className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingEdit ? "Збереження..." : "Зберегти"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </section>
    </>
  );
}

export default ApplicationsPage;
