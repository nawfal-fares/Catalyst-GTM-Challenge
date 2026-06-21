import { readFile } from "node:fs/promises";
import path from "node:path";
import type { RawApifyRecord } from "@/domain/types";
import { buildDashboardDataset } from "@/services/pipeline/build-dataset";
import { SupabaseWarehouse } from "@/services/persistence/supabase-warehouse";

export async function runSync() {
  const inputPath = path.join(process.cwd(), "apify.json");
  const records = JSON.parse(await readFile(inputPath, "utf8")) as RawApifyRecord[];
  const dataset = await buildDashboardDataset(records);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    return {
      mode: "demo-dry-run" as const,
      persisted: false,
      reason: "SUPABASE_SERVICE_ROLE_KEY is not configured",
      stats: dataset.ingestion,
    };
  }

  const warehouse = new SupabaseWarehouse(url, serviceRole);
  const result = await warehouse.persist(dataset);
  return { mode: "supabase" as const, persisted: true, stats: dataset.ingestion, result };
}
