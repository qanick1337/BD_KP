import { useNavigate } from "react-router";
import { useAuth } from "../../AuthProvider";
import { useState, useEffect } from "react";

function NewUserPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    surname: "",
    patronymic: "",
    user_email: "",
    phone_number: "",
    password: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!token) {
      setAccessDenied(true);
    }
  }, [token]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Не вдалося створити користувача");
      }

      setSaving(false);
      alert("Користувача успішно додано!");
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

  return (
    <>
      <main className="bg-gray-100 min-h-[calc(100vh-64px)]">
        <section className="max-w-xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Додавання нового користувача
          </h1>

          {error && (
            <p className="mb-3 text-sm text-red-600">Помилка: {error}</p>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex flex-col gap-3"
          >
            <label className="text-sm font-medium text-gray-700">
              Імʼя <span className="text-red-500">*</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Прізвище <span className="text-red-500">*</span>
              <input
                type="text"
                name="surname"
                value={form.surname}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
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
              Email <span className="text-red-500">*</span>
              <input
                type="email"
                name="user_email"
                value={form.user_email}
                onChange={handleChange}
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
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

            <label className="text-sm font-medium text-gray-700">
              Пароль <span className="text-red-500">*</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
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
                {saving ? "Збереження..." : "Створити"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

export default NewUserPage;
