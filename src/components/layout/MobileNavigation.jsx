import { NavLink } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";

const items = [
  {
    to: "/",
    key: "home",
    icon: "/ForgeIcons/Home.png",
    labelKey: "nav.home",
  },
  {
    to: "/workout",
    key: "workout",
    icon: "/ForgeIcons/Exercices.png",
    labelKey: "nav.workout",
  },
  {
    to: "/history",
    key: "history",
    icon: "/ForgeIcons/Historique.png",
    labelKey: "nav.history",
  },
  {
    to: "/cycle",
    key: "cycle",
    icon: "/ForgeIcons/cycle.png",
    labelKey: "nav.cycle",
  },
  {
    to: "/profile",
    key: "profile",
    icon: "/ForgeIcons/Profile.png",
    labelKey: "nav.profile",
  },
];

export default function MobileNavigation() {
  const { t } = useLanguage();
  const { profile } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-dark-card/95 backdrop-blur border-t border-app flex items-center justify-around px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
      {items
        .filter((item) => item.to !== "/cycle" || profile?.sex === "female")
        .map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-btn text-[11px] font-medium min-w-[64px] transition-colors ${
                isActive ? "text-accent" : "text-secondary"
              }`
            }
          >
            <img src={item.icon} alt="" className="w-10 h-10 object-contain" />

            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
    </nav>
  );
}
