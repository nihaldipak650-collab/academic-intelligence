import { syncAdvisorData } from "./data-pipeline.mjs";

try {
  const result = await syncAdvisorData();
  console.log(`Synced advisors: ${result.envelope.advisorCount}`);
  console.log(`Copied reports: ${result.reports.length}`);
  result.warnings.forEach((warning) => console.warn(`Warning: ${warning}`));
} catch (error) {
  console.error(`Data sync failed: ${error.message}`);
  process.exitCode = 1;
}
