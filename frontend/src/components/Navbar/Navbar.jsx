import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../AuthProvider";

function Navbar() {
  const { isAuthenticated, logout, email } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  const handleNavClick = () => {
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-20 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="font-extrabold text-xl sm:text-2xl text-blue-700"
            onClick={handleNavClick}
          >
              Work-like
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-gray-700 font-medium">
            <Link
              to=""
              className="hover:text-blue-700 transition"
              onClick={handleNavClick}
            >
              Знайти кандидатів
            </Link>
            <Link
              to=""
              className="hover:text-blue-700 transition"
              onClick={handleNavClick}
            >
              Створити вакансію
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
              >
                <span className="px-4 py-2 rounded-full border border-blue-600 text-blue-700 font-semibold max-w-[220px] truncate">
                  {email}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-blue-700 text-white font-semibold hover:bg-blue-800 transition"
              >
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full border border-blue-600 text-blue-700 font-semibold hover:bg-blue-50 transition"
              >
                Зареєструватися
              </Link>

              <Link
                to="/login"
                className="px-4 py-2 rounded-full bg-blue-700 text-white font-semibold hover:bg-blue-800 transition"
              >
                Увійти
              </Link>
            </>
          )}
        </div>



        {/* Мобільне меню */}

        <button
          className="flex flex-col items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="block w-6 h-0.5 bg-current mb-1"></span>
          <span className="block w-6 h-0.5 bg-current mb-1"></span>
          <span className="block w-6 h-0.5 bg-current"></span>
        </button>


        
      </div>

      {open && (
        <div className="md:hidden bg-white">
          <nav className="flex flex-col gap-2 px-4 py-3 text-gray-700 font-medium">
            <Link
              to=""
              className="py-1 hover:text-blue-700 transition"
              onClick={handleNavClick}
            >
              Знайти кандидатів
            </Link>
            <Link
              to=""
              className="py-1 hover:text-blue-700 transition"
              onClick={handleNavClick}
            >
              Створити вакансію
            </Link>
          </nav>

          <div className="flex flex-col gap-2  px-4 py-3">
            {isAuthenticated ? (
              <>
                <span className="px-4 py-2 rounded-full border border-blue-600 text-blue-700 font-semibold text-sm">
                  {email}
                </span>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full bg-blue-700 text-white font-semibold hover:bg-blue-800 transition text-sm"
                >
                  Вийти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full border border-blue-600 text-blue-700 font-semibold hover:bg-blue-50 transition text-sm text-center"
                  onClick={handleNavClick}
                >
                  Зареєструватися
                </Link>

                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full bg-blue-700 text-white font-semibold hover:bg-blue-800 transition text-sm text-center"
                  onClick={handleNavClick}
                >
                  Увійти
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
