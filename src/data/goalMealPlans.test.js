import { describe, expect, it } from "vitest";
import { goalMealPlans } from "./goalMealPlans";

const supportedLanguages = ["fr", "en", "es", "it"];
const expectedDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

describe("goal meal plans", () => {
  it.each(["mass", "cut"])("provides a complete translated week for %s", (goal) => {
    const plan = goalMealPlans[goal];

    expect(plan.map(({ day }) => day)).toEqual(expectedDays);

    plan.forEach((day) => {
      ["breakfast", "lunch", "snack", "dinner"].forEach((mealName) => {
        const translations = day[mealName];

        supportedLanguages.forEach((language) => {
          expect(translations[language]).toEqual(expect.any(String));
          expect(translations[language].trim().length).toBeGreaterThan(0);
        });
      });
    });
  });
});
