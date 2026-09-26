const DAY_MS = 1000 * 60 * 60 * 24;

function toDate(date) {
  const d = new Date(`${date}T00:00:00`);
  d.setHours(0, 0, 0, 0);
  return d;
}

function differenceInDays(from, to) {
  return Math.round((toDate(to) - toDate(from)) / DAY_MS);
}

export function getCycleLengths(cycles = []) {
  const sorted = [...cycles]
    .filter((cycle) => cycle.start_date)
    .sort((a, b) => toDate(a.start_date) - toDate(b.start_date));

  const lengths = [];

  for (let i = 1; i < sorted.length; i += 1) {
    const length = differenceInDays(
      sorted[i - 1].start_date,
      sorted[i].start_date,
    );

    if (length > 0) {
      lengths.push(length);
    }
  }

  return lengths;
}

export function getAverageCycleLength(cycles = []) {
  const lengths = getCycleLengths(cycles);

  if (lengths.length === 0) return null;

  return Math.round(
    lengths.reduce((sum, length) => sum + length, 0) / lengths.length,
  );
}

export function getCycleRegularity(cycles = []) {
  const lengths = getCycleLengths(cycles);

  if (lengths.length < 2) {
    return {
      status: "unknown",
      minLength: lengths[0] || null,
      maxLength: lengths[0] || null,
      range: null,
    };
  }

  const minLength = Math.min(...lengths);
  const maxLength = Math.max(...lengths);
  const range = maxLength - minLength;

  return {
    status: range <= 7 ? "stable" : "variable",
    minLength,
    maxLength,
    range,
  };
}

export function getCurrentCycleDay(startDate, today = new Date()) {
  if (!startDate) return null;

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const days = differenceInDays(startDate, todayString);

  if (days < 0) return null;

  return days + 1;
}

export function getCyclePhase({
  cycleDay,
  averageCycleLength,
  periodEndDay = 5,
}) {
  if (!cycleDay) {
    return {
      phase: null,
      confidence: "low",
    };
  }

  // Les règles sont identifiées à partir des données réellement saisies.
  if (cycleDay <= periodEndDay) {
    return {
      phase: "menstrual",
      confidence: "high",
    };
  }

  // Sans historique suffisant, nous ne faisons pas
  // d'estimation des phases suivantes.
  if (!averageCycleLength) {
    return {
      phase: null,
      confidence: "low",
    };
  }

  // L'ovulation est estimée environ 14 jours
  // avant le début des prochaines règles.
  const estimatedOvulationDay = Math.max(
    periodEndDay + 1,
    averageCycleLength - 14,
  );

  const ovulationStart = Math.max(periodEndDay + 1, estimatedOvulationDay - 1);

  const ovulationEnd = estimatedOvulationDay + 1;

  if (cycleDay >= ovulationStart && cycleDay <= ovulationEnd) {
    return {
      phase: "ovulation",
      confidence: "medium",
      estimatedOvulationDay,
    };
  }

  if (cycleDay < ovulationStart) {
    return {
      phase: "follicular",
      confidence: "medium",
      estimatedOvulationDay,
    };
  }

  return {
    phase: "luteal",
    confidence: "medium",
    estimatedOvulationDay,
  };
}

export function getCurrentCycleStatus(cycles = [], today = new Date()) {
  const sortedCycles = [...cycles]
    .filter((cycle) => cycle.start_date)
    .sort((a, b) => toDate(b.start_date) - toDate(a.start_date));

  if (sortedCycles.length === 0) {
    return {
      cycleDay: null,
      averageCycleLength: null,
      phase: null,
      estimatedOvulationDay: null,
      estimatedNextPeriod: null,
      confidence: "low",
      regularity: "unknown",
      cycleRange: null,
    };
  }

  const latestCycle = sortedCycles[0];

  const cycleDay = getCurrentCycleDay(latestCycle.start_date, today);

  if (!cycleDay) {
    return {
      cycleDay: null,
      averageCycleLength: null,
      phase: null,
      estimatedOvulationDay: null,
      estimatedNextPeriod: null,
      confidence: "low",
      regularity: "unknown",
      cycleRange: null,
    };
  }

  const cycleLengths = getCycleLengths(sortedCycles);
  const averageCycleLength = getAverageCycleLength(sortedCycles);
  const regularity = getCycleRegularity(sortedCycles);

  /*
   * Avec un seul début de cycle, nous n'avons pas encore
   * suffisamment d'historique personnel pour estimer
   * la durée habituelle du cycle.
   */
  const effectiveCycleLength = averageCycleLength;

  /*
   * Si nous avons plusieurs cycles, nous pouvons commencer
   * à personnaliser l'estimation.
   */
  const confidence =
    cycleLengths.length >= 3
      ? "high"
      : cycleLengths.length >= 1
        ? "medium"
        : "low";

  const periodEndDay = latestCycle.end_date
    ? differenceInDays(latestCycle.start_date, latestCycle.end_date) + 1
    : 5;

  const phaseInfo = getCyclePhase({
    cycleDay,
    averageCycleLength: effectiveCycleLength,
    periodEndDay,
  });

  let estimatedNextPeriod = null;

  if (effectiveCycleLength) {
    const nextPeriodDate = new Date(toDate(latestCycle.start_date));

    nextPeriodDate.setDate(nextPeriodDate.getDate() + effectiveCycleLength);

    estimatedNextPeriod = [
      nextPeriodDate.getFullYear(),
      String(nextPeriodDate.getMonth() + 1).padStart(2, "0"),
      String(nextPeriodDate.getDate()).padStart(2, "0"),
    ].join("-");
  }

  return {
    cycleDay,
    averageCycleLength: effectiveCycleLength,
    phase: phaseInfo.phase,
    estimatedOvulationDay: phaseInfo.estimatedOvulationDay || null,
    estimatedNextPeriod,
    confidence,
    regularity: regularity.status,
    cycleRange: regularity.range,
  };
}
