export type RefreshCadence = "2-hours" | "daily" | "weekly";

export function refreshCadenceFor(publishedAt: string, now = new Date()): RefreshCadence {
  const ageHours = (now.getTime() - new Date(publishedAt).getTime()) / 3_600_000;
  if (ageHours < 48) return "2-hours";
  if (ageHours < 24 * 14) return "daily";
  return "weekly";
}

export function shouldRefresh(
  publishedAt: string,
  lastSyncedAt: string | null,
  now = new Date(),
): boolean {
  if (!lastSyncedAt) return true;
  const elapsedHours = (now.getTime() - new Date(lastSyncedAt).getTime()) / 3_600_000;
  const cadence = refreshCadenceFor(publishedAt, now);

  if (cadence === "2-hours") {
    const easternHour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        hour12: false,
      }).format(now),
    );
    return easternHour >= 8 && easternHour <= 20 && elapsedHours >= 2;
  }
  return elapsedHours >= (cadence === "daily" ? 24 : 24 * 7);
}
