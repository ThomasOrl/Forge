import { describe, expect, it, vi } from "vitest";
import { fetchAllRows } from "./fetchAllRows";

describe("fetchAllRows", () => {
  it("loads every page and combines rows", async () => {
    const rangeCalls = [];
    const source = ["a", "b", "c", "d", "e"];
    const createQuery = vi.fn(() => ({
      range: vi.fn(async (start, end) => {
        rangeCalls.push([start, end]);
        return { data: source.slice(start, end + 1), error: null };
      }),
    }));

    await expect(fetchAllRows(createQuery, 2)).resolves.toEqual({
      data: source,
      error: null,
    });
    expect(rangeCalls).toEqual([[0, 1], [2, 3], [4, 5]]);
  });

  it("returns a query error without hiding it", async () => {
    const queryError = new Error("request failed");
    const createQuery = () => ({
      range: async () => ({ data: null, error: queryError }),
    });

    await expect(fetchAllRows(createQuery, 5)).resolves.toEqual({
      data: null,
      error: queryError,
    });
  });

  it("rejects invalid page sizes", async () => {
    await expect(fetchAllRows(() => {}, 0)).rejects.toThrow(RangeError);
  });
});
