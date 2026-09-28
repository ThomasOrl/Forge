import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import Modal from "../ui/Modal";

const primaryItems = [
  {
    to: "/",
    key: "home",
    icon: "/ForgeIcons/Home.png",
    labelKey: "nav.home",
  },
  {
    to: "/workout",
    key: "workout",
    icon: "/ForgeIcons/Entrainement.png",
    labelKey: "nav.workout",
  },
  {
    to: "/progress",
    key: "progress",
    icon: "/ForgeIcons/Progression.png",
    labelKey: "nav.progress",
  },
];

const moreItems = [
  {
    to: "/exercises",
    key: "exercises",
    icon: "/ForgeIcons/Exercices.png",
    labelKey: "nav.exercises",
  },
  {
    to: "/history",
    key: "history",
    icon: "/ForgeIcons/Historique.png",
    labelKey: "nav.history",
  },
  {
    to: "/goals",
    key: "goals",
    icon: "/ForgeIcons/Objectifs.png",
    labelKey: "nav.goals",
  },
  {
    to: "/assistant",
    key: "assistant",
    icon: "/ForgeIcons/Brain.png",
    labelKey: "nav.ai",
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
  {
    to: "/settings",
    key: "settings",
    icon: "/ForgeIcons/Parametres.png",
    labelKey: "nav.settings",
  },
];

export default function MobileNavigation() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const availableMoreItems = moreItems.filter(
    (item) => item.to !== "/cycle" || profile?.sex === "female",
  );
  const isMoreActive = availableMoreItems.some((item) =>
    location.pathname.startsWith(item.to),
  );

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-dark-card/95 backdrop-blur border-t border-app flex items-center justify-around px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
        {primaryItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-1 min-w-0 flex-col items-center gap-1 px-1 py-1.5 rounded-btn text-[11px] leading-tight text-center font-medium transition-colors ${
                isActive ? "text-accent" : "text-secondary"
              }`
            }
          >
            <img src={item.icon} alt="" className="w-8 h-8 object-contain" />
            <span className="truncate max-w-full">{t(item.labelKey)}</span>
          </NavLink>
        ))}

        <button
          type="button"
          aria-expanded={moreOpen}
          aria-controls="mobile-more-menu"
          onClick={() => setMoreOpen(true)}
          className={`flex flex-1 min-w-0 flex-col items-center gap-1 px-1 py-1.5 rounded-btn text-[11px] leading-tight text-center font-medium transition-colors ${
            isMoreActive || moreOpen ? "text-accent" : "text-secondary"
          }`}
        >
          <img
            src="/ForgeIcons/More.svg"
            alt=""
            className="h-8 w-8 object-contain"
          />
          <span>{t("nav.more")}</span>
        </button>
      </nav>

      <Modal
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title={t("nav.more")}
        maxWidth="max-w-lg"
      >
        <div id="mobile-more-menu" className="grid grid-cols-2 gap-3">
          {availableMoreItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.key}
                to={item.to}
                onClick={() => setMoreOpen(false)}
                className={`flex min-h-14 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-app text-secondary hover:border-accent/25 hover:text-primary"
                }`}
              >
                <img
                  src={item.icon}
                  alt=""
                  className="h-8 w-8 shrink-0 object-contain"
                />
                <span className="min-w-0">{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
