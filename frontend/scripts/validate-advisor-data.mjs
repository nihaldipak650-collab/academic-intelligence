import { validateGeneratedData } from "./data-pipeline.mjs";

try {
  const result = await validateGeneratedData();
  console.log(`Validated advisors: ${result.envelope.advisorCount}`);
  console.log(`Verified report copies: ${result.reports.length}`);
  result.warnings.forEach((warning) => console.warn(`Warning: ${warning}`));
} catch (error) {
  console.error(`Data validation failed: ${error.message}`);
  process.exitCode = 1;
}
