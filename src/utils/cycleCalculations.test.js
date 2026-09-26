import { describe, expect, test } from "vitest";

import {
  getCycleLengths,
  getAverageCycleLength,
  getCycleRegularity,
  getCurrentCycleDay,
  getCyclePhase,
  getCurrentCycleStatus,
} from "./cycleCalculations";

describe("cycleCalculations", () => {
  const cycles = [
    { start_date: "2026-07-01", end_date: "2026-07-05" },
    { start_date: "2026-07-30", end_date: "2026-08-03" },
    { start_date: "2026-08-29", end_date: "2026-09-02" },
  ];

  test("calcule correctement les durées des cycles", () => {
    expect(getCycleLengths(cycles)).toEqual([29, 30]);
  });

  test("calcule correctement la durée moyenne", () => {
    expect(getAverageCycleLength(cycles)).toBe(30);
  });

  test("calcule correctement le jour du cycle", () => {
    expect(
      getCurrentCycleDay("2026-08-29", new Date("2026-09-13T00:00:00")),
    ).toBe(16);
  });

  test("identifie la fenêtre estimée de l'ovulation", () => {
    expect(
      getCyclePhase({
        cycleDay: 16,
        averageCycleLength: 30,
        periodEndDay: 5,
      }),
    ).toEqual({
      phase: "ovulation",
      confidence: "medium",
      estimatedOvulationDay: 16,
    });
  });

  test("calcule correctement le statut complet du cycle", () => {
    expect(
      getCurrentCycleStatus(cycles, new Date("2026-09-13T00:00:00")),
    ).toEqual({
      cycleDay: 16,
      averageCycleLength: 30,
      phase: "ovulation",
      estimatedOvulationDay: 16,
      estimatedNextPeriod: "2026-09-28",
      confidence: "medium",
      regularity: "stable",
      cycleRange: 1,
    });
  });

  test("ne fait pas d'estimation avec un seul cycle", () => {
    const singleCycle = [
      {
        start_date: "2026-08-29",
        end_date: "2026-09-02",
      },
    ];

    expect(
      getCurrentCycleStatus(singleCycle, new Date("2026-09-13T00:00:00")),
    ).toEqual({
      cycleDay: 16,
      averageCycleLength: null,
      phase: null,
      estimatedOvulationDay: null,
      estimatedNextPeriod: null,
      confidence: "low",
      regularity: "unknown",
      cycleRange: null,
    });
  });
  test("identifie les règles en cours", () => {
    expect(
      getCyclePhase({
        cycleDay: 3,
        averageCycleLength: 30,
        periodEndDay: 5,
      }),
    ).toEqual({
      phase: "menstrual",
      confidence: "high",
    });
  });

  test("identifie la phase folliculaire", () => {
    expect(
      getCyclePhase({
        cycleDay: 10,
        averageCycleLength: 30,
        periodEndDay: 5,
      }),
    ).toEqual({
      phase: "follicular",
      confidence: "medium",
      estimatedOvulationDay: 16,
    });
  });

  test("identifie la phase lutéale", () => {
    expect(
      getCyclePhase({
        cycleDay: 20,
        averageCycleLength: 30,
        periodEndDay: 5,
      }),
    ).toEqual({
      phase: "luteal",
      confidence: "medium",
      estimatedOvulationDay: 16,
    });
  });

  test("gère un cycle court de 21 jours", () => {
    expect(
      getCyclePhase({
        cycleDay: 6,
        averageCycleLength: 21,
        periodEndDay: 5,
      }),
    ).toEqual({
      phase: "ovulation",
      confidence: "medium",
      estimatedOvulationDay: 7,
    });
  });

  test("gère un cycle long de 35 jours", () => {
    expect(
      getCyclePhase({
        cycleDay: 20,
        averageCycleLength: 35,
        periodEndDay: 5,
      }),
    ).toEqual({
      phase: "ovulation",
      confidence: "medium",
      estimatedOvulationDay: 21,
    });
  });

  test("ne fait aucune estimation sans cycle", () => {
    expect(getCurrentCycleStatus([], new Date("2026-09-13T00:00:00"))).toEqual({
      cycleDay: null,
      averageCycleLength: null,
      phase: null,
      estimatedOvulationDay: null,
      estimatedNextPeriod: null,
      confidence: "low",
      regularity: "unknown",
      cycleRange: null,
    });
  });

  test("ne fait pas d'estimation de phase avec un seul cycle", () => {
    const singleCycle = [
      {
        start_date: "2026-08-29",
        end_date: "2026-09-02",
      },
    ];

    expect(
      getCurrentCycleStatus(singleCycle, new Date("2026-09-13T00:00:00")).phase,
    ).toBe(null);
  });
  test("identifie un cycle stable", () => {
    const cycles = [
      { start_date: "2026-06-01" },
      { start_date: "2026-06-30" },
      { start_date: "2026-07-30" },
    ];

    expect(getCycleRegularity(cycles)).toEqual({
      status: "stable",
      minLength: 29,
      maxLength: 30,
      range: 1,
    });
  });

  test("identifie un cycle variable", () => {
    const cycles = [
      { start_date: "2026-05-01" },
      { start_date: "2026-05-25" },
      { start_date: "2026-06-25" },
      { start_date: "2026-08-05" },
    ];

    expect(getCycleRegularity(cycles)).toEqual({
      status: "variable",
      minLength: 24,
      maxLength: 41,
      range: 17,
    });
  });
});
