import { useState } from "react";
import Button from "../ui/Button";
import DatePicker from "../ui/DatePicker";
import {
  ArrowRightIcon,
  CalendarIcon,
  InfoIcon,
} from "./CycleIcons";

const DAY_MS = 1000 * 60 * 60 * 24;

export default function AddCycleForm({ addCycle, error, t }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!startDate) {
      setFormError(t("cycle.errors.startDateRequired"));
      return;
    }

    if (endDate && endDate < startDate) {
      setFormError(t("cycle.errors.endDateBeforeStart"));
      return;
    }

    if (endDate) {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T00:00:00`);
      const duration = Math.round((end - start) / DAY_MS) + 1;

      if (duration > 10) {
        setFormError(t("cycle.errors.endDateTooLate"));
        return;
      }
    }

    setSaving(true);

    const { error: addError } = await addCycle({
      startDate,
      endDate: endDate || null,
    });

    if (addError) {
      setFormError(t("cycle.errors.save"));
      setSaving(false);
      return;
    }

    setStartDate("");
    setEndDate("");
    setSaving(false);
  };

  return (
    <section className="relative overflow-visible card p-5 sm:p-7 mb-5">
      <div
        className="pointer-events-none absolute -right-24 -bottom-28 w-64 h-64 rounded-full blur-3xl opacity-[0.055]"
        style={{
          background:
            "radial-gradient(circle, rgba(236,72,153,0.9), rgba(168,85,247,0.6), transparent 70%)",
        }}
      />

      <div className="relative">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <CalendarIcon />
          </div>

          <div>
            <h2 className="text-lg font-bold text-primary">
              {t("cycle.addTitle")}
            </h2>

            <p className="text-sm text-secondary mt-1">
              {t("cycle.addDescription")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="cycle-start-date"
                className="block text-sm font-medium text-secondary mb-2"
              >
                {t("cycle.startDate")}
              </label>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
                  <CalendarIcon />
                </div>

                <DatePicker
                  id="cycle-start-date"
                  value={startDate}
                  onChange={setStartDate}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="cycle-end-date"
                className="block text-sm font-medium text-secondary mb-2"
              >
                {t("cycle.endDate")}
              </label>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
                  <CalendarIcon />
                </div>

                <DatePicker
                  id="cycle-end-date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={setEndDate}
                />
              </div>
            </div>
          </div>

          {formError && (
            <p className="text-sm text-red-400 mt-4">{formError}</p>
          )}

          {error && !formError && (
            <p className="text-sm text-red-400 mt-4">
              {t("cycle.errors.generic")}
            </p>
          )}

          <div className="flex justify-end mt-5">
            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto min-w-[200px]"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {saving ? t("common.loading") : t("cycle.save")}
                {!saving && <ArrowRightIcon />}
              </span>
            </Button>
          </div>

          <p className="flex items-center gap-2 text-xs text-secondary mt-3">
            <InfoIcon />
            <span>{t("cycle.endDateHint")}</span>
          </p>
        </form>
      </div>
    </section>
  );
}
