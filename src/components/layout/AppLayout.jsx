import { Outlet } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";

export default function AppLayout() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-app flex">
      <Sidebar />

      <div className="flex-1 min-w-0 min-h-screen flex flex-col">
        <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-10">
          <Outlet />
        </main>

        <footer className="hidden md:block border-t border-app px-6 py-6">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-primary">Forge</p>
              <p className="mt-1 text-xs text-secondary">
                © {new Date().getFullYear()} Forge
                <span aria-hidden="true"> · </span>
                {t("footer.author")}
                <span aria-hidden="true"> · </span>
                Thomas Orlans
              </p>
            </div>

            <nav
              aria-label={t("footer.socialLinks")}
              className="flex items-center gap-2"
            >
              <a
                href="https://github.com/ThomasOrl"
                target="_blank"
                rel="noreferrer"
                aria-label={t("footer.githubProfile")}
                className="inline-flex items-center gap-2 rounded-xl border border-app px-3 py-2 text-sm text-secondary transition-colors hover:border-accent/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.68-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.62 1.22 3.26.93.1-.72.39-1.22.71-1.5-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.16-3-.12-.28-.5-1.42.11-2.96 0 0 .95-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.12 2.96.72.78 1.15 1.78 1.15 3.01 0 4.29-2.62 5.23-5.11 5.51.4.35.76 1.03.76 2.08v3.05c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
                </svg>
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/thomas-orlans-6a8434201/"
                target="_blank"
                rel="noreferrer"
                aria-label={t("footer.linkedinProfile")}
                className="inline-flex items-center gap-2 rounded-xl border border-app px-3 py-2 text-sm text-secondary transition-colors hover:border-accent/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.45H4.97V9h2.96v9.45ZM6.45 7.71a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm12 10.74H15.5v-4.6c0-1.1-.02-2.51-1.53-2.51-1.53 0-1.77 1.19-1.77 2.43v4.68H9.24V9h2.84v1.29h.04c.4-.74 1.36-1.53 2.8-1.53 3 0 3.53 1.97 3.53 4.53v5.16Z" />
                </svg>
                <span>LinkedIn</span>
              </a>
            </nav>
          </div>
        </footer>
      </div>

      <MobileNavigation />
    </div>
  );
}
