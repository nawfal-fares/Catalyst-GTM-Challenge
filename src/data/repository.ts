import demoDataset from "@/data/demo-dataset.json";
import type { DashboardDataset } from "@/domain/types";

/**
 * Public pages use a checked-in deterministic demo snapshot so they run with no
 * credentials. Production swaps this repository for Supabase queries and
 * cursor-paginated materialized rollups.
 */
export async function getDashboardDataset(): Promise<DashboardDataset> {
  return demoDataset as DashboardDataset;
}
