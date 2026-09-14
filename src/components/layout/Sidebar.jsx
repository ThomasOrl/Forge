import { NavLink } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import LanguageSelector from "../ui/LanguageSelector";
import ThemeToggle from "../ui/ThemeToggle";

const navItems = [
  {
    to: "/",
    labelKey: "nav.home",
    icon: "/home.png",
  },
  {
    to: "/workout",
    labelKey: "nav.workout",
    icon: "/workout.png",
  },
  {
    to: "/exercises",
    labelKey: "nav.exercises",
    icon: "/add.png",
  },
  {
    to: "/history",
    labelKey: "nav.history",
    icon: "/history.png",
  },
  {
    to: "/progress",
    labelKey: "nav.progress",
    icon: "/progress.png",
  },
];

const secondaryNavItems = [
  {
    to: "/profile",
    labelKey: "nav.profile",
    icon: "/profile.png",
  },
  {
    to: "/settings",
    labelKey: "nav.settings",
    icon: "/settings.png",
  },
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
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 mb-8">
        <img
          src="/logo-simple.png"
          alt="Forge"
          className="w-10 h-10 object-contain"
        />

        <span className="font-extrabold text-primary tracking-tight">
          {t("common.appName")}
        </span>
      </div>

      {/* Navigation principale */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={linkClass}
            end={item.to === "/"}
          >
            <img
              src={item.icon}
              alt=""
              className="w-6 h-6 object-contain flex-shrink-0"
            />

            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      {/* Séparateur */}
      <div className="h-px bg-app my-4" />

      {/* Navigation secondaire */}
      <nav className="flex flex-col gap-1">
        {secondaryNavItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            <img
              src={item.icon}
              alt=""
              className="w-6 h-6 object-contain flex-shrink-0"
            />

            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      {/* Langue + thème */}
      <div className="mt-auto flex items-center gap-2 pt-4">
        <LanguageSelector compact />
        <ThemeToggle compact />
      </div>
    </aside>
  );
}
