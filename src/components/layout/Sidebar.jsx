import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import LanguageSelector from "../ui/LanguageSelector";
import ThemeToggle from "../ui/ThemeToggle";

const navItems = [
  {
    to: "/",
    labelKey: "nav.home",
    icon: "/ForgeIcons/Home.png",
  },
  {
    to: "/workout",
    labelKey: "nav.workout",
    icon: "/ForgeIcons/Entrainement.png",
  },
  {
    to: "/exercises",
    labelKey: "nav.exercises",
    icon: "/ForgeIcons/Exercices.png",
  },
  {
    to: "/history",
    labelKey: "nav.history",
    icon: "/ForgeIcons/Historique.png",
  },
  {
    to: "/progress",
    labelKey: "nav.progress",
    icon: "/ForgeIcons/Progression.png",
  },
  {
    to: "/goals",
    labelKey: "nav.goals",
    icon: "/ForgeIcons/Objectifs.png",
  },
  {
    to: "/assistant",
    labelKey: "nav.ai",
    icon: "/ForgeIcons/Brain.png",
  },
  {
    to: "/cycle",
    labelKey: "nav.cycle",
    icon: "/ForgeIcons/cycle.png",
  },
];

const secondaryNavItems = [
  {
    to: "/profile",
    labelKey: "nav.profile",
    icon: "/ForgeIcons/Profile.png",
  },
  {
    to: "/settings",
    labelKey: "nav.settings",
    icon: "/ForgeIcons/Parametres.png",
  },
];

export default function Sidebar() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("fyb_sidebar_collapsed") === "true",
  );

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem("fyb_sidebar_collapsed", String(next));
      return next;
    });
  };

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 ${collapsed ? "px-2" : "px-4"} py-2.5 rounded-btn text-sm font-medium transition-all duration-300 ${
      isActive
        ? "bg-accent/10 text-accent"
        : "text-secondary hover:text-accent hover:bg-accent/5"
    }`;

  return (
    <aside
      className={`sticky top-0 z-20 hidden h-screen shrink-0 flex-col overflow-visible border-r border-app py-6 transition-[width,padding] duration-500 ease-in-out motion-reduce:transition-none md:flex ${
        collapsed ? "w-20 px-2" : "w-64 px-4"
      }`}
    >
      <div className="absolute -right-7 top-1/2 z-30 h-40 w-7 -translate-y-1/2">
        <svg
          viewBox="0 0 28 144"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path
            className="sidebar-handle-fill"
            d="M0 0 C0 32 12 36 14 36 Q28 36 28 58 V86 Q28 108 14 108 C12 108 0 112 0 144 Z"
          />
          <path
            className="sidebar-handle-outline"
            d="M0 0 C0 32 12 36 14 36 Q28 36 28 58 V86 Q28 108 14 108 C12 108 0 112 0 144"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
          aria-expanded={!collapsed}
          title={collapsed ? t("nav.expand") : t("nav.collapse")}
          className="absolute right-0.5 top-1/2 flex h-16 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-secondary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <svg
            viewBox="0 0 28 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-5 w-5 translate-x-1 transition-transform duration-300 motion-reduce:transition-none ${collapsed ? "rotate-0" : "rotate-180"}`}
            aria-hidden="true"
          >
            <path d="M9 6c3 3 6 6 10 8-4 2-7 5-10 8" />
          </svg>
        </button>
      </div>

      <div
        className={`mb-8 flex items-center transition-[gap,padding] duration-300 ${
          collapsed ? "gap-0 px-2" : "gap-2 px-3"
        }`}
      >
        <img
          src="/logo-simple.png"
          alt="Forge"
          className="w-12 h-12 object-contain"
        />

        <span
          aria-hidden={collapsed}
          className={`overflow-hidden whitespace-nowrap font-extrabold tracking-tight text-primary transition-[max-width,opacity,transform] duration-200 motion-reduce:transition-none ${
            collapsed
              ? "max-w-0 -translate-x-2 opacity-0"
              : "max-w-24 translate-x-0 opacity-100 delay-100"
          }`}
        >
          {t("common.appName")}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        <nav aria-label={t("nav.primary")} className="flex flex-col gap-1">
          {navItems
            .filter((item) => item.to !== "/cycle" || profile?.sex === "female")
            .map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                end={item.to === "/"}
                aria-label={t(item.labelKey)}
                title={collapsed ? t(item.labelKey) : undefined}
              >
                <img
                  src={item.icon}
                  alt=""
                  className="h-10 w-10 shrink-0 object-contain"
                />
                <span
                  aria-hidden={collapsed}
                  style={{ transitionDelay: collapsed ? "0ms" : `${Math.min(index, 6) * 25}ms` }}
                  className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 motion-reduce:transition-none ${
                    collapsed
                      ? "max-w-0 -translate-x-2 opacity-0"
                      : "max-w-40 translate-x-0 opacity-100"
                  }`}
                >
                  {t(item.labelKey)}
                </span>
              </NavLink>
            ))}
        </nav>

        <div className="my-3 h-px shrink-0 bg-app" />

        <nav aria-label={t("nav.account")} className="flex flex-col gap-1">
          {secondaryNavItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              aria-label={t(item.labelKey)}
              title={collapsed ? t(item.labelKey) : undefined}
            >
              <img
                src={item.icon}
                alt=""
                className="h-10 w-10 shrink-0 object-contain"
              />
              <span
                aria-hidden={collapsed}
                style={{ transitionDelay: collapsed ? "0ms" : `${index * 35}ms` }}
                className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 motion-reduce:transition-none ${
                  collapsed
                    ? "max-w-0 -translate-x-2 opacity-0"
                    : "max-w-40 translate-x-0 opacity-100"
                }`}
              >
                {t(item.labelKey)}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div
        className={`mt-auto flex shrink-0 pt-4 ${
          collapsed ? "flex-col items-center gap-1" : "items-center gap-2"
        }`}
      >
        <LanguageSelector compact />
        <ThemeToggle compact />
      </div>
    </aside>
  );
}
