import { describe, expect, it } from "vitest";
import {
  getExerciseProgressSamples,
  getMaximumWeight,
  getPreviousWeekStart,
  getWeeklyVolume,
} from "./progressCalculations";

describe("progress calculations", () => {
  it("finds the maximum weight across exercises and sets", () => {
    expect(getMaximumWeight([
      { sets: [{ weight: "42.5" }, { weight: 60 }] },
      { sets: [{ weight: 55 }, { weight: null }] },
      { sets: [] },
    ])).toBe(60);
    expect(getMaximumWeight([])).toBe(0);
  });

  it("returns each exercise's best weight in chronological order", () => {
    const samples = getExerciseProgressSamples([
      { workouts: { date: "2026-04-10" }, sets: [{ weight: 50 }, { weight: 52.5 }] },
      { workouts: { date: "2026-04-02" }, sets: [{ weight: "47.5" }] },
      { workouts: null, sets: [{ weight: 100 }] },
    ]);

    expect(samples).toEqual([
      { date: "2026-04-02", value: 47.5 },
      { date: "2026-04-10", value: 52.5 },
    ]);
  });

  it("groups workout volume by Sunday-starting week and keeps the latest eight", () => {
    const result = getWeeklyVolume([
      { date: "2026-03-02", total_volume: 100 },
      { date: "2026-03-07", total_volume: 250 },
      { date: "2026-03-08", total_volume: "400.4" },
      { date: "2026-03-09", total_volume: null },
    ]);

    expect(result).toHaveLength(2);
    expect(result.map(({ value }) => value)).toEqual([350, 400]);
  });

  it("uses Monday of the previous week for history cleanup", () => {
    expect(getPreviousWeekStart(new Date(2026, 8, 30))).toBe("2026-09-21");
    expect(getPreviousWeekStart(new Date(2026, 8, 27))).toBe("2026-09-14");
  });
});
