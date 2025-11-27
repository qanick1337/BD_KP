import { Link, useNavigate } from "react-router";
import { useAuth } from "../../AuthProvider";
import "./Navbar.css";

function Navbar() {
  const { isAuthenticated, logout, email } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };


  return (
    <header className="nav">
      <div className="nav-left">
        <Link to="/" className="nav-logo">Work-like</Link>
        <nav className="nav-links">
          <Link to="">Знайти кандидатів</Link>
          <Link to="">Створити вакансію</Link>
        </nav>
      </div>

      <div className="nav-right">
        {isAuthenticated ? (
          <>
            <Link to="" className="nav-btn-outline">{email}</Link>
            <button className="nav-btn" onClick={handleLogout}>
              Вийти
            </button>
          </>
        ) : (
          <>
            <Link to="/register" className="nav-btn-outline">
              Для роботодавців
            </Link>
            <Link to="/login" className="nav-btn">
              Увійти
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
