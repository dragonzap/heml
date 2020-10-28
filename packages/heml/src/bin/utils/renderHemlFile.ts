import { readFileSync } from "fs-extra";
import { heml, HEMLOutput } from "../..";
import { HEMLOptions } from "@dragonzap/heml-parse";

export async function renderHemlFile(
  filepath: string,
  options: HEMLOptions
): Promise<HEMLOutput> {
  const contents = readFileSync(filepath, "utf8");
  const startTime = process.hrtime();

  return heml(contents, options).then((results) => {
    results.metadata.time = Math.round(process.hrtime(startTime)[1] / 1000000);

    return results;
  });
}
