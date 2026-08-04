import type { PublicAdvisorDtoEnvelope } from "../../types/advisor";

export { syntheticPublicDto } from "../../mocks/publicDto";

export const emptyPublicDto: PublicAdvisorDtoEnvelope = {
  schemaVersion: 1,
  dtoVersion: "1.0.4",
  source: "approved-public-advisor-contract",
  advisorCount: 0,
  advisors: [],
};
