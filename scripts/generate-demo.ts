import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { RawApifyRecord } from "../src/domain/types";
import { buildDashboardDataset } from "../src/services/pipeline/build-dataset";

async function main() {
  const root = process.cwd();
  const inputPath = path.join(root, process.env.APIFY_INPUT_PATH ?? "apify.json");
  const outputPath = path.join(root, "src/data/demo-dataset.json");
  const input = JSON.parse(await readFile(inputPath, "utf8")) as RawApifyRecord[];
  const dataset = await buildDashboardDataset(input);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify({
      output: path.relative(root, outputPath),
      posts: dataset.posts.length,
      reactions: dataset.reactions.length,
      comments: dataset.comments.length,
      people: dataset.people.length,
      duplicatesMerged: dataset.ingestion.duplicateRecordsMerged,
    }),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
