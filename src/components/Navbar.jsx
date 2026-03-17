import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Icon from "./Icon";

import "../styles/navbar.css";

function Navbar() {
  const { user } = useAuth();
  const navItems = [
    { to: "/", label: "Home", icon: "home" },
    { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
    {
      to: "/payments?action=add-money",
      label: "Payments",
      icon: "wallet",
      className: "nav-add-money-link",
    },
    { to: "/payments?action=send-money", label: "Send", icon: "send" },
    { to: "/qr", label: "QR Pay", icon: "qr" },
    {
      to: "/payments?action=recharge",
      label: "Recharge",
      icon: "recharge",
    },
    { to: "/transactions", label: "Transactions", icon: "history" },
    { to: "/profile", label: "Profile", icon: "profile" },
  ];

  return (
    <div className="navbar">
      <h2 className="logo">PayIndia</h2>

      <div className="menu">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} className={item.className}>
            <span className="nav-link-content">
              <Icon name={item.icon} className="nav-link-icon" />
              <span>{item.label}</span>
            </span>
          </Link>
        ))}
        {user?.id === "guest" && (
          <span className="nav-guest-badge">
            <Icon name="profile" className="nav-link-icon" />
            <span>Guest Mode</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default Navbar;
