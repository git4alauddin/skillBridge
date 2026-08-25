import { LogOut } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../state/useAuth";

const navItemsByRole = {
  admin: [
    { label: "Dashboard", to: "/" },
    { label: "Approvals", to: "/opportunities" },
    { label: "Users", to: "/users" },
  ],
  mentor: [
    { label: "Dashboard", to: "/" },
    { label: "My Listings", to: "/opportunities" },
    { label: "Applications", to: "/applications" },
  ],
  student: [
    { label: "Dashboard", to: "/" },
    { label: "Browse", to: "/browse" },
    { label: "Applications", to: "/applications" },
  ],
};

export const Shell = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const navItems = navItemsByRole[user.role];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h1>SkillBridge</h1>
          <p>{user.role}</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <div>
            <p>Signed in as</p>
            <strong>{user.fullName}</strong>
          </div>

          <button type="button" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </header>

        <Outlet />
      </div>
    </div>
  );
};