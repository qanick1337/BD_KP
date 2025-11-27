import {Outlet, Link} from "react-router"
import "./Layout.css";

function Layout() {
  return (
    <div className="layout-container">
      <Outlet />   {/* Показує ту сторінку, що відповідає маршруту */}
    </div>
  );
}

export default Layout;
