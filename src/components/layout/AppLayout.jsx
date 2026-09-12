import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-app flex">
      <Sidebar />

      <div className="flex-1 min-w-0 min-h-screen flex flex-col">
        <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-10">
          <Outlet />
        </main>

        <footer className="hidden md:block border-t border-app py-5 px-6">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between text-xs text-secondary">
            <span>© {new Date().getFullYear()} Forge your Body</span>
            <span>Design by ThomasOrls</span>
          </div>
        </footer>
      </div>

      <MobileNavigation />
    </div>
  );
}
