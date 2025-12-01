import Navbar from "../../components/Navbar/Navbar";
import { useAuth } from "../../AuthProvider";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";

import UserCard from "../../components/UserCard/UserCard";


function UsersPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false); 
    const [accessDenied, setAccessDenied] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setAccessDenied(true);    
            setLoading(false);
            return;
        }
        
        getCompanyUsers();
    }, [token]);

  async function getCompanyUsers() {
    try {

        setLoading(true);

        const response = await fetch("http://localhost:3000/users", {
            method: "GET",
            headers: {
            Authorization: `Bearer ${token}`,
            },
        })

        const data = await response.json();

        if (response.status === 401) {
            setAccessDenied(true);
            setLoading(false);
            return;
        }
        if (!response.ok) {
            throw new Error(data?.message || "Не вдалося завантажити користувачів");
        }

        setUsers(data);
        setLoading(false);

    } catch(err) {
        console.error(err);
        setLoading(false);
    }
  }

  async function handleDeleteUser(id) {
    const confirmed = window.confirm("Видалити цього користувача?");
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        setAccessDenied(true);
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || "Не вдалося видалити користувача");
      }

      // При успішному видаленні – прибираємо з стану
      setUsers((prev) => prev.filter((u) => u.company_user_id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || "Сталася помилка при видаленні");
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

  return (
    <>
      <Navbar />
      <main className="bg-gray-100 min-h-[calc(100vh-64px)]">
        <section className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Управління користувачами
          </h1>

          <p className="text-sm text-gray-500 mb-4">
            Додавайте рекрутерів та керуйте доступами.
          </p>


          <Link
            to = "/users/new"
            className="flex items-center gap-4 mb-6"
          >
            <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-md">
              Додати користувача
            </button>
          </Link>

          {loading ? (
            <p className="text-gray-600 text-sm">Завантаження користувачів...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-600 text-sm">
              У вашій компанії ще немає додаткових користувачів.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {users.map((user) => (
                <UserCard
                  key={user.company_user_id}
                  user={user}
                  onClick={() =>
                    navigate(`/users/${user.company_user_id}`)
                  }
                  onClickBtn={() => handleDeleteUser(user.company_user_id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default UsersPage;
