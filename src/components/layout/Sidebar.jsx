import { NavLink } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import LanguageSelector from "../ui/LanguageSelector";
import ThemeToggle from "../ui/ThemeToggle";

const navItems = [
  { to: "/", key: "home", icon: "🏠", labelKey: "nav.home" },
  { to: "/workout", key: "workout", icon: "💪", labelKey: "nav.workout" },
  {
    to: "/exercises",
    key: "exercises",
    icon: "📋",
    labelKey: "exercises.title",
  },
  { to: "/history", key: "history", icon: "📜", labelKey: "nav.history" },
  { to: "/progress", key: "progress", icon: "📈", labelKey: "nav.progress" },
];

export default function Sidebar() {
  const { t } = useLanguage();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-btn text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-accent/10 text-accent"
        : "text-secondary hover:text-accent hover:bg-accent/5"
    }`;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-app px-4 py-6">
      <div className="flex items-center gap-2 px-3 mb-8">
        <img
          src="/logo-simple.png"
          alt="Forge your Body"
          className="w-10 h-10 object-contain"
        />
        <span className="font-extrabold text-primary tracking-tight">
          {t("common.appName")}
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            className={linkClass}
            end={item.to === "/"}
          >
            <span>{item.icon}</span>
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="h-px bg-app my-4" />

      <nav className="flex flex-col gap-1">
        <NavLink to="/profile" className={linkClass}>
          <span>👤</span>
          <span>{t("nav.profile")}</span>
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          <span>⚙️</span>
          <span>{t("nav.settings")}</span>
        </NavLink>
      </nav>

      <div className="mt-auto flex items-center gap-2 pt-4">
        <LanguageSelector compact />
        <ThemeToggle compact />
      </div>
    </aside>
  );
}
