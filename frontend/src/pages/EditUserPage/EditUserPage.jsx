import { useParams, useNavigate } from "react-router";
import { useAuth } from "../../AuthProvider";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";

function EditUserPage() {
  const { id } = useParams(); // company_user_id
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    surname: "",
    patronymic: "",
    user_email: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!token) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }
    fetchUser();
  }, [token, id]);

  async function fetchUser() {
    try {
      setLoading(true);

      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || "Не вдалося завантажити користувача");
      }

      setForm({
        name: data.name || "",
        surname: data.surname || "",
        patronymic: data.patronymic || "",
        user_email: data.user_email || "",
        phone_number: data.phone_number || "",
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);

      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Не вдалося зберегти зміни");
      }

      setSaving(false);
      alert('Дані успішно оновлено!')
      navigate("/users"); 
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
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center bg-gray-100">
          <p className="text-gray-600 text-lg">Завантаження користувача...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-100 min-h-[calc(100vh-64px)]">
        <section className="max-w-xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Редагування користувача
          </h1>

          {error && (
            <p className="mb-3 text-sm text-red-600">Помилка: {error}</p>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex flex-col gap-3"
          >
            <label className="text-sm font-medium text-gray-700">
              Імʼя
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Прізвище
              <input
                type="text"
                name="surname"
                value={form.surname}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              По батькові
              <input
                type="text"
                name="patronymic"
                value={form.patronymic}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Email
              <input
                type="email"
                name="user_email"
                value={form.user_email}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                disabled
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Номер телефону
              <input
                type="tel"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </label>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700"
                onClick={() => navigate("/users")}
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Збереження..." : "Зберегти"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

export default EditUserPage;
