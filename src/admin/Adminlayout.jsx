
import { useEffect, useState } from "react";
import {
  Navigate,
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import {
  Code2,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Headset,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    async function verifyAdmin() {
      const token = sessionStorage.getItem("codeseed_admin_token");

      if (!token) {
        if (active) setStatus("unauthorized");
        return;
      }

      try {
        await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (active) setStatus("authorized");
      } catch {
        sessionStorage.removeItem("codeseed_admin_token");

        if (active) setStatus("unauthorized");
      }
    }

    verifyAdmin();

    return () => {
      active = false;
    };
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("codeseed_admin_token");
    navigate("/admin", { replace: true });
  }

  if (status === "checking") {
    return (
      <div className="admin-loading">
        Checking admin access...
      </div>
    );
  }

  if (status === "unauthorized") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/" className="admin-brand">
          <Code2 size={25} />
          <span>CodeSeed</span>
        </a>

        <span className="admin-side-label">
          WORKSPACE
        </span>

        <nav className="admin-side-nav">
          {/* Dashboard */}
          <NavLink
            to="/admin/dashboard"
            end
            className={({ isActive }) =>
              `admin-side-link${isActive ? " active" : ""}`
            }
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          {/* Orders */}
          <NavLink
            to="/admin/dashboard/orders"
            className={({ isActive }) =>
              `admin-side-link${isActive ? " active" : ""}`
            }
          >
            <ShoppingBag size={18} />
            <span>Orders</span>
          </NavLink>

          {/* Support Tickets */}
          <NavLink
            to="/admin/dashboard/support"
            className={({ isActive }) =>
              `admin-side-link${isActive ? " active" : ""}`
            }
          >
            <Headset size={18} />
            <span>Support Tickets</span>
          </NavLink>
        </nav>

        {/* Logout */}
        <button
          type="button"
          className="admin-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <span>Admin workspace</span>

          <span className="admin-status-dot">
            Admin access
          </span>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
