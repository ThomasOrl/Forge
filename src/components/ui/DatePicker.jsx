import { useEffect, useRef, useState } from "react";

function parseDate(value) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatInputDate(date) {
  if (!date) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatSupabaseDate(date) {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSameDay(first, second) {
  if (!first || !second) return false;

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const previousMonthLastDay = new Date(year, month, 0).getDate();

  const days = [];

  for (let i = startDay - 1; i >= 0; i -= 1) {
    days.push({
      date: new Date(year, month - 1, previousMonthLastDay - i),
      outsideMonth: true,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({
      date: new Date(year, month, day),
      outsideMonth: false,
    });
  }

  const remainingDays = 42 - days.length;

  for (let day = 1; day <= remainingDays; day += 1) {
    days.push({
      date: new Date(year, month + 1, day),
      outsideMonth: true,
    });
  }

  return days;
}

export default function DatePicker({
  id,
  value,
  onChange,
  min,
  placeholder = "JJ/MM/AAAA",
  disabled = false,
}) {
  const containerRef = useRef(null);

  const selectedDate = parseDate(value);
  const minDate = parseDate(min);

  const [open, setOpen] = useState(false);

  const [visibleDate, setVisibleDate] = useState(selectedDate || new Date());

  useEffect(() => {
    if (selectedDate) {
      setVisibleDate(selectedDate);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const calendarDays = getCalendarDays(
    visibleDate.getFullYear(),
    visibleDate.getMonth(),
  );

  const monthLabel = visibleDate.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const today = new Date();

  const goToPreviousMonth = () => {
    setVisibleDate(
      new Date(visibleDate.getFullYear(), visibleDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setVisibleDate(
      new Date(visibleDate.getFullYear(), visibleDate.getMonth() + 1, 1),
    );
  };

  const handleSelectDate = (date) => {
    if (minDate && date < minDate) return;

    onChange(formatSupabaseDate(date));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`w-full h-12 rounded-lg border bg-app px-4 flex items-center justify-between text-left transition-all ${
          open
            ? "border-accent ring-2 ring-accent/20"
            : "border-app hover:border-accent/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-5 h-5 text-secondary"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="17" rx="3" />
            <path d="M8 2v4M16 2v4M3 9h18" />
          </svg>

          <span className={value ? "text-primary" : "text-secondary"}>
            {selectedDate ? formatInputDate(selectedDate) : placeholder}
          </span>
        </span>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`w-4 h-4 text-secondary transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Sélectionner une date"
          className="absolute z-50 mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-xl border border-app bg-[#111016] p-4 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-primary hover:bg-accent/10 transition-colors"
              aria-label="Mois précédent"
            >
              ←
            </button>

            <p className="text-sm font-semibold text-primary capitalize">
              {monthLabel}
            </p>

            <button
              type="button"
              onClick={goToNextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-primary hover:bg-accent/10 transition-colors"
              aria-label="Mois suivant"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
              <div
                key={`${day}-${index}`}
                className="h-8 flex items-center justify-center text-[11px] font-medium text-secondary"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {calendarDays.map(({ date, outsideMonth }) => {
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);
              const isBeforeMin = minDate && date < minDate;

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  disabled={isBeforeMin}
                  onClick={() => handleSelectDate(date)}
                  className={`relative h-9 w-9 mx-auto rounded-lg text-sm transition-all ${
                    outsideMonth ? "text-secondary/30" : "text-primary"
                  } ${
                    isBeforeMin
                      ? "opacity-25 cursor-not-allowed"
                      : "hover:bg-accent/15 hover:text-primary"
                  } ${
                    isSelected
                      ? "bg-accent text-white font-semibold shadow-[0_0_14px_rgba(168,85,247,0.35)]"
                      : ""
                  }`}
                >
                  {date.getDate()}

                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-app flex items-center gap-4 text-[11px] text-secondary">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              Date sélectionnée
            </span>

            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full border border-accent" />
              Aujourd'hui
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
