import { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useMenstrualCycles } from "../hooks/useMenstrualCycles";

import { getCurrentCycleStatus } from "../utils/cycleCalculations";
import CycleFlower from "../components/cycle/CycleFlowerTemp";
import CycleHistory from "../components/cycle/CycleHistory";
import AddCycleForm from "../components/cycle/AddCycleForm";
import CurrentCycleCard from "../components/cycle/CurrentCycleCard";
import CycleStats from "../components/cycle/CycleStats";
import CyclePageHeader from "../components/cycle/CyclePageHeader";

export default function Cycle() {
  const { profile } = useAuth();
  const { t, language } = useLanguage();

  const { cycles, loading, error, addCycle, deleteCycle } =
    useMenstrualCycles();

  const isMale = profile?.sex === "male";
  const cycleStatus = useMemo(() => getCurrentCycleStatus(cycles), [cycles]);

  const locale =
    {
      fr: "fr-FR",
      en: "en-US",
      es: "es-ES",
      it: "it-IT",
    }[language] || "en-US";

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(`${date}T00:00:00`).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(t("cycle.confirmDelete"));

    if (!confirmed) return;

    await deleteCycle(id);
  };

  const unavailableMessage = isMale
    ? "cycle.notAvailable"
    : !profile?.sex
      ? "cycle.sexRequired"
      : null;

  if (unavailableMessage) {
    return (
      <div className="animate-fadeIn max-w-5xl mx-auto">
        <CyclePageHeader t={t} />

        <div className="card p-6">
          <p className="text-secondary text-sm">{t(unavailableMessage)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative animate-fadeIn max-w-5xl mx-auto pb-8 overflow-visible">
      <CycleFlower />

      <CyclePageHeader t={t} />

      {loading ? (
        <div className="card p-6">
          <p className="text-secondary text-sm">{t("common.loading")}</p>
        </div>
      ) : (
        <>
          <CurrentCycleCard cycleStatus={cycleStatus} cycles={cycles} t={t} />

          <CycleStats
            cycleStatus={cycleStatus}
            formatDate={formatDate}
            t={t}
          />

          <AddCycleForm addCycle={addCycle} error={error} t={t} />

          <CycleHistory
            cycles={cycles}
            formatDate={formatDate}
            onDelete={handleDelete}
            t={t}
          />
        </>
      )}
    </div>
  );
}
