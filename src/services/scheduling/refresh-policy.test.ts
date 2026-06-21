import { describe, expect, it } from "vitest";
import { refreshCadenceFor, shouldRefresh } from "@/services/scheduling/refresh-policy";

describe("refresh policy", () => {
  const now = new Date("2026-06-21T16:00:00.000Z");

  it("uses age-based production cadence", () => {
    expect(refreshCadenceFor("2026-06-20T16:00:00.000Z", now)).toBe("2-hours");
    expect(refreshCadenceFor("2026-06-14T16:00:00.000Z", now)).toBe("daily");
    expect(refreshCadenceFor("2026-05-01T16:00:00.000Z", now)).toBe("weekly");
  });

  it("refreshes recent posts during US working hours", () => {
    expect(
      shouldRefresh("2026-06-20T16:00:00.000Z", "2026-06-21T13:00:00.000Z", now),
    ).toBe(true);
  });
});
