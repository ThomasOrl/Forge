import { describe, expect, it } from "vitest";
import {
  calculateExerciseVolume,
  calculateSetVolume,
  calculateWorkoutVolume,
  findBestSet,
  formatDuration,
  formatVolume,
  isNewPersonalRecord,
  localeFromLang,
} from "./calculations";

describe("workout calculations", () => {
  it("calculates set volume from numeric and string inputs", () => {
    expect(calculateSetVolume("42.5", "8")).toBe(340);
  });

  it("treats missing or invalid set values as zero", () => {
    expect(calculateSetVolume(undefined, "invalid")).toBe(0);
  });

  it("sums set and exercise volumes", () => {
    const exercises = [
      { sets: [{ weight: 20, repetitions: 10 }, { weight: 25, repetitions: 8 }] },
      { sets: [{ weight: "12.5", repetitions: "4" }] },
    ];

    expect(calculateExerciseVolume(exercises[0].sets)).toBe(400);
    expect(calculateWorkoutVolume(exercises)).toBe(450);
  });

  it("returns zero volume for empty collections", () => {
    expect(calculateExerciseVolume([])).toBe(0);
    expect(calculateWorkoutVolume([])).toBe(0);
  });

  it("finds the heaviest set and handles empty input", () => {
    const sets = [{ weight: 40 }, { weight: "65" }, { weight: 55 }];
    expect(findBestSet(sets)).toBe(sets[1]);
    expect(findBestSet([])).toBeNull();
    expect(findBestSet(null)).toBeNull();
  });

  it("detects only weights above the previous record", () => {
    expect(isNewPersonalRecord(null, 20)).toBe(true);
    expect(isNewPersonalRecord(50, 51)).toBe(true);
    expect(isNewPersonalRecord(50, 50)).toBe(false);
    expect(isNewPersonalRecord(50, 49)).toBe(false);
  });

  it("formats volume and durations", () => {
    expect(formatVolume(1234.6).replace(/\s/g, "")).toBe("1235");
    expect(formatVolume(null)).toBe("0");
    expect(formatDuration(0)).toBe("0 min");
    expect(formatDuration(3599)).toBe("1 h");
    expect(formatDuration(3660)).toBe("1 h 1 min");
  });

  it("uses the correct number locale for all supported languages", () => {
    expect(localeFromLang("fr")).toBe("fr-FR");
    expect(localeFromLang("en")).toBe("en-US");
    expect(localeFromLang("es")).toBe("es-ES");
    expect(localeFromLang("it")).toBe("it-IT");
    expect(localeFromLang("unknown")).toBe("fr-FR");
  });
});
