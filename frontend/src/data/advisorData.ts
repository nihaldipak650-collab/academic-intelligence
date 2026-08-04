import type {
  AdvisorDataSnapshot,
  GrowthStage,
  PlainResearchDirection,
  PublicAdvisor,
  PublicAdvisorDtoEnvelope,
  PublicEvidenceItem,
  TraceableText,
  UndergraduateScenario,
  V104Candidate,
} from "../types/advisor";

const PUBLIC_STATUSES = new Set(["approved", "published"]);
const STAGE_LABELS: Record<string, { label: string; period: string | null }> = {
  foundation: { label: "基础准备", period: "0—3个月" },
  bounded_task: { label: "边界任务", period: "3—6个月" },
  independent_module: { label: "独立模块", period: "6—12个月" },
};

type UnknownRecord = Record<string, unknown>;

function object(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function stringArray(value: unknown, allowEmpty = true): string[] | null {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) return null;
  const result = value.map(text);
  if (!result.every(Boolean)) return null;
  return [...new Set(result as string[])];
}

function evidenceIds(value: unknown, allowEmpty = true): string[] | null {
  const values = stringArray(value, allowEmpty);
  return values?.every((item) => /^E[1-9][0-9]*$/.test(item)) ? values : null;
}

function traceable(value: unknown, allowEmptyEvidence = false): TraceableText | null {
  const raw = object(value);
  const itemText = text(raw?.text);
  const ids = evidenceIds(raw?.evidenceIds ?? raw?.evidence_ids, allowEmptyEvidence);
  return raw && itemText && ids ? { text: itemText, evidenceIds: ids } : null;
}

function traceableArray(value: unknown, allowEmptyEvidence = false): TraceableText[] | null {
  if (!Array.isArray(value)) return null;
  const result = value.map((item) => traceable(item, allowEmptyEvidence));
  return result.every(Boolean) ? (result as TraceableText[]) : null;
}

function plainDirections(value: unknown, camelCase: boolean): PlainResearchDirection[] | null {
  if (!Array.isArray(value)) return null;
  const result = value.map((item) => {
    const raw = object(item);
    const term = text(raw?.[camelCase ? "term" : "term_original"]);
    const explanation = text(raw?.[camelCase ? "explanation" : "explanation_zh"]);
    const undergraduateMeaning = text(raw?.[camelCase ? "undergraduateMeaning" : "undergraduate_meaning"]);
    const ids = evidenceIds(raw?.[camelCase ? "evidenceIds" : "evidence_ids"], !camelCase);
    return raw && term && explanation && undergraduateMeaning && ids
      ? { term, explanation, undergraduateMeaning, evidenceIds: ids }
      : null;
  });
  return result.every(Boolean) ? (result as PlainResearchDirection[]) : null;
}

function tasks(value: unknown, camelCase: boolean): UndergraduateScenario[] | null {
  if (!Array.isArray(value)) return null;
  const result = value.map((item) => {
    const raw = object(item);
    const task = text(raw?.task);
    const context = text(raw?.[camelCase ? "context" : "task_context"]);
    const purpose = text(raw?.[camelCase ? "purpose" : "task_purpose"]);
    const methods = stringArray(raw?.[camelCase ? "methods" : "possible_methods"], false);
    const output = text(raw?.[camelCase ? "output" : "possible_output"]);
    const uncertaintyNote = text(raw?.[camelCase ? "uncertaintyNote" : "uncertainty_note"]);
    const ids = evidenceIds(raw?.[camelCase ? "evidenceIds" : "evidence_ids"], !camelCase);
    return raw && task && context && purpose && methods && output && uncertaintyNote && ids
      ? { task, context, purpose, methods, output, uncertaintyNote, evidenceIds: ids }
      : null;
  });
  return result.every(Boolean) ? (result as UndergraduateScenario[]) : null;
}

function growthStages(value: unknown, camelCase: boolean): GrowthStage[] | null {
  if (!Array.isArray(value)) return null;
  const result = value.map((item) => {
    const raw = object(item);
    const stageKey = text(raw?.stage);
    const possibleActivities = stringArray(raw?.[camelCase ? "possibleActivities" : "possible_activities"], false);
    const possibleOutputs = stringArray(raw?.[camelCase ? "possibleOutputs" : "possible_outputs"], false);
    const uncertaintyNote = text(raw?.[camelCase ? "uncertaintyNote" : "uncertainty_note"]);
    const ids = evidenceIds(raw?.[camelCase ? "evidenceIds" : "evidence_ids"], !camelCase);
    if (!raw || !stageKey || !possibleActivities || !possibleOutputs || !uncertaintyNote || !ids) return null;
    const stage = STAGE_LABELS[stageKey] ?? { label: stageKey, period: null };
    return {
      stage: stage.label,
      period: stage.period,
      possibleActivities,
      possibleOutputs,
      uncertaintyNote,
      evidenceIds: ids,
    };
  });
  return result.every(Boolean) ? (result as GrowthStage[]) : null;
}

function publicEvidence(value: unknown, dtoMode: boolean): PublicEvidenceItem[] | null {
  if (!Array.isArray(value)) return null;
  const result = value.map((item) => {
    const raw = object(item);
    const evidenceId = text(raw?.[dtoMode ? "evidenceId" : "id"]);
    const title = text(raw?.title);
    const rawYear = raw?.year;
    const year = typeof rawYear === "number" && Number.isInteger(rawYear)
      ? rawYear
      : typeof rawYear === "string" && /^\d{4}$/.test(rawYear)
        ? Number(rawYear)
        : undefined;
    const doi = text(raw?.doi) ?? undefined;
    const sourceUrl = text(raw?.[dtoMode ? "sourceUrl" : "source_url"]);
    const journal = text(raw?.journal) ?? undefined;
    if (
      !raw ||
      !evidenceId ||
      !/^E[1-9][0-9]*$/.test(evidenceId) ||
      !title ||
      (dtoMode && !sourceUrl) ||
      (doi && !/^10\.\d{4,9}\/\S+$/.test(doi))
    ) return null;
    return { evidenceId, title, ...(year ? { year } : {}), ...(doi ? { doi } : {}), sourceUrl, ...(journal ? { journal } : {}) };
  });
  if (!result.every(Boolean)) return null;
  const items = result as PublicEvidenceItem[];
  if (new Set(items.map((item) => item.evidenceId)).size !== items.length) return null;
  return items;
}

function assertEvidenceTraceability(advisor: PublicAdvisor) {
  const publicIds = new Set(advisor.publicEvidence.map((item) => item.evidenceId));
  const traceable = [
    { evidenceIds: advisor.summaryEvidenceIds },
    ...advisor.researchDirections,
    ...advisor.researchDirectionsPlain,
    ...advisor.researchQuestions,
    ...advisor.techniques,
    ...advisor.researchWorkflow,
    ...advisor.undergraduateScenarios,
    ...advisor.prerequisiteSkills,
    advisor.learningCost,
    ...advisor.growthPath,
  ];
  if (traceable.some((item) => item.evidenceIds.some((id) => !publicIds.has(id)))) {
    throw new Error("PUBLIC_DTO_EVIDENCE_LINK_INVALID");
  }
}

function adaptSafeDtoAdvisor(value: unknown, mode: "dto" | "staging" | "review"): PublicAdvisor {
  const raw = object(value);
  const status = String(raw?.publicationStatus);
  const approvedGate = raw?.releaseEligible === true && PUBLIC_STATUSES.has(status);
  const pendingGate = raw?.releaseEligible === false && status === "review_pending";
  const gateValid = mode === "dto"
    ? approvedGate
    : mode === "staging"
      ? pendingGate
      : approvedGate || pendingGate;
  if (
    !raw || raw.dtoVersion !== "1.0.4" || raw.schemaVersion !== "1.0.4" ||
    !gateValid || raw.evidenceType !== "academic_only" ||
    raw.hasExperienceEvidence !== false || raw.experienceCaseCount !== 0
  ) throw new Error("PUBLIC_DTO_ADVISOR_GATE_INVALID");

  const id = text(raw.id);
  const name = text(raw.nameZh);
  const institution = text(raw.institution);
  const department = text(raw.schoolOrDepartment);
  const publicRoles = stringArray(raw.publicRoles);
  const summary = traceable(raw.summary);
  const tags = stringArray(raw.tags, false);
  const searchKeywords = stringArray(raw.searchKeywords);
  const researchDirections = traceableArray(raw.researchDirections);
  const researchDirectionsPlain = plainDirections(raw.researchDirectionsPlain, true);
  const researchQuestions = traceableArray(raw.researchQuestions);
  const techniques = traceableArray(raw.mainTechniques);
  const researchWorkflow = traceableArray(raw.researchWorkflow);
  const evidence = publicEvidence(raw.publicEvidence, true);
  const undergraduateScenarios = tasks(raw.possibleUndergraduateTasks, true);
  const prerequisiteSkills = traceableArray(raw.prerequisiteSkills);
  const learningCost = traceable(raw.learningCost);
  const growthPath = growthStages(raw.genericGrowthPath, true);
  const boundaryStatement = text(raw.boundaryStatement);
  const updatedAt = text(raw.lastUpdated);
  const dataStatusNote = text(raw.dataStatusNote) ?? undefined;

  if (
    !id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !name || !institution || !department ||
    !publicRoles || !summary || !tags || !searchKeywords || !researchDirections ||
    !researchDirectionsPlain || !researchQuestions || !techniques || !researchWorkflow || !evidence ||
    !undergraduateScenarios || !prerequisiteSkills || !learningCost || !growthPath ||
    !boundaryStatement || !updatedAt || !/^\d{4}-\d{2}-\d{2}$/.test(updatedAt)
  ) throw new Error("PUBLIC_DTO_FORMAT_INVALID");

  const advisor: PublicAdvisor = {
    id,
    name,
    nameEn: text(raw.nameEn),
    institution,
    department,
    position: text(raw.position),
    publicRoles,
    summary: summary.text,
    summaryEvidenceIds: summary.evidenceIds,
    tags,
    searchKeywords,
    researchDirections,
    researchDirectionsPlain,
    researchQuestions,
    techniques,
    researchWorkflow,
    publicEvidence: evidence,
    undergraduateScenarios,
    prerequisiteSkills,
    learningCost,
    growthPath,
    boundaryStatement,
    updatedAt,
    publicationStatus: raw.publicationStatus as PublicAdvisor["publicationStatus"],
    ...(dataStatusNote ? { dataStatusNote } : {}),
  };
  assertEvidenceTraceability(advisor);
  return advisor;
}

export function adaptPublicAdvisorDtoEnvelope(value: unknown): AdvisorDataSnapshot {
  const raw = object(value);
  if (
    !raw || raw.schemaVersion !== 1 || raw.dtoVersion !== "1.0.4" ||
    raw.source !== "approved-public-advisor-contract" ||
    !Number.isInteger(raw.advisorCount) || !Array.isArray(raw.advisors) ||
    raw.advisorCount !== raw.advisors.length
  ) throw new Error("PUBLIC_DTO_ENVELOPE_INVALID");
  const advisors = raw.advisors.map((advisor) => adaptSafeDtoAdvisor(advisor, "dto"));
  if (new Set(advisors.map((advisor) => advisor.id)).size !== advisors.length) {
    throw new Error("PUBLIC_DTO_DUPLICATE_ID");
  }
  return { mode: "dto", advisors, rejectedCount: 0 };
}

export function adaptLocalStagingDtoEnvelope(value: unknown): AdvisorDataSnapshot {
  const raw = object(value);
  if (
    !raw || raw.schemaVersion !== 1 || raw.dtoVersion !== "1.0.4" ||
    raw.source !== "local-staging-advisor-contract" ||
    raw.scope !== "local_staging_only" || raw.publicReleaseApproved !== false ||
    raw.cohortDate !== "2026-08-03" || raw.advisorCount !== 6 ||
    !Array.isArray(raw.advisors) || raw.advisorCount !== raw.advisors.length
  ) throw new Error("LOCAL_STAGING_DTO_ENVELOPE_INVALID");
  const advisors = raw.advisors.map((advisor) => adaptSafeDtoAdvisor(advisor, "staging"));
  if (new Set(advisors.map((advisor) => advisor.id)).size !== advisors.length) {
    throw new Error("LOCAL_STAGING_DTO_DUPLICATE_ID");
  }
  return { mode: "staging", advisors, rejectedCount: 0 };
}

export function adaptLocalReviewDtoEnvelope(value: unknown): AdvisorDataSnapshot {
  const raw = object(value);
  if (
    !raw || raw.schemaVersion !== 1 || raw.dtoVersion !== "1.0.4" ||
    raw.source !== "local-review-advisor-contract" ||
    raw.scope !== "local_review_only" || raw.publicReleaseApproved !== false ||
    raw.cohortDate !== "2026-08-04" || raw.advisorCount !== 13 ||
    !Array.isArray(raw.advisors) || raw.advisorCount !== raw.advisors.length
  ) throw new Error("LOCAL_REVIEW_DTO_ENVELOPE_INVALID");
  const advisors = raw.advisors.map((advisor) => adaptSafeDtoAdvisor(advisor, "review"));
  if (new Set(advisors.map((advisor) => advisor.id)).size !== advisors.length) {
    throw new Error("LOCAL_REVIEW_DTO_DUPLICATE_ID");
  }
  return { mode: "review", advisors, rejectedCount: 0 };
}

function adaptMockCandidate(candidate: V104Candidate): PublicAdvisor | null {
  const record = object(candidate.record);
  const validation = object(candidate.validation);
  const status = text(record?.publication_status);
  if (
    !record || !validation || record.schema_version !== "1.0.4" ||
    validation.release_eligible !== true || !status ||
    validation.effective_publication_status !== status || !PUBLIC_STATUSES.has(status)
  ) return null;

  const id = text(record.advisor_id);
  const name = text(object(record.name_zh)?.value);
  const nameEn = text(object(record.name_zh)?.value_en);
  const institution = text(object(record.institution)?.value);
  const department = text(object(record.school_or_department)?.value);
  const publicRoles = Array.isArray(record.public_roles)
    ? record.public_roles.map((role) => text(object(role)?.value)).filter(Boolean) as string[]
    : null;
  const summary = traceable(record.summary, true);
  const tags = stringArray(record.tags, false);
  const searchKeywords = stringArray(record.search_keywords);
  const researchDirections = traceableArray(record.research_directions_original, true);
  const researchDirectionsPlain = plainDirections(record.research_directions_plain_language, false);
  const researchQuestions = traceableArray(record.research_questions, true);
  const techniques = traceableArray(record.main_techniques, true);
  const researchWorkflow = traceableArray(record.research_workflow, true);
  const evidence = publicEvidence(record.featured_public_evidence, false);
  const undergraduateScenarios = tasks(record.possible_undergraduate_tasks, false);
  const prerequisiteSkills = traceableArray(record.prerequisite_skills, true);
  const learningCost = traceable(record.learning_cost, true);
  const growthPath = growthStages(record.generic_growth_path, false);
  const boundaryStatement = text(record.boundary_statement);
  const updatedAt = text(record.updated_at);

  if (
    !id || !name || !institution || !department || !publicRoles?.length || !summary || !tags ||
    !searchKeywords || !researchDirections || !researchDirectionsPlain || !researchQuestions ||
    !techniques || !researchWorkflow || !evidence || !undergraduateScenarios ||
    !prerequisiteSkills || !learningCost || !growthPath || !boundaryStatement || !updatedAt
  ) return null;

  const advisor: PublicAdvisor = {
    id,
    name,
    nameEn,
    institution,
    department,
    position: text(object(record.position)?.value),
    publicRoles,
    summary: summary.text,
    summaryEvidenceIds: summary.evidenceIds,
    tags,
    searchKeywords,
    researchDirections,
    researchDirectionsPlain,
    researchQuestions,
    techniques,
    researchWorkflow,
    publicEvidence: evidence,
    undergraduateScenarios,
    prerequisiteSkills,
    learningCost,
    growthPath,
    boundaryStatement,
    updatedAt,
    publicationStatus: status as "approved" | "published",
  };
  try {
    assertEvidenceTraceability(advisor);
    return advisor;
  } catch {
    return null;
  }
}

export function adaptAdvisorCandidates(candidates: V104Candidate[]): AdvisorDataSnapshot {
  const advisors = candidates.map(adaptMockCandidate).filter(Boolean) as PublicAdvisor[];
  const unique = new Map(advisors.map((advisor) => [advisor.id, advisor]));
  return {
    mode: "mock",
    advisors: [...unique.values()],
    rejectedCount: candidates.length - unique.size,
  };
}

export interface AdvisorFilters {
  query: string;
  tags: string[];
  sort: "name" | "updated";
}

export function filterAndSortAdvisors(advisors: PublicAdvisor[], filters: AdvisorFilters) {
  const needle = filters.query.trim().toLocaleLowerCase();
  return advisors
    .filter((advisor) => {
      const searchable = [
        advisor.name,
        advisor.nameEn ?? "",
        advisor.institution,
        advisor.department,
        advisor.position ?? "",
        ...advisor.publicRoles,
        advisor.summary,
        ...advisor.tags,
        ...advisor.searchKeywords,
        ...advisor.researchDirections.map((item) => item.text),
        ...advisor.researchDirectionsPlain.flatMap((item) => [item.term, item.explanation, item.undergraduateMeaning]),
        ...advisor.researchQuestions.map((item) => item.text),
        ...advisor.techniques.map((item) => item.text),
        ...advisor.researchWorkflow.map((item) => item.text),
        ...advisor.undergraduateScenarios.flatMap((item) => [item.task, item.context, item.purpose, ...item.methods]),
        ...advisor.prerequisiteSkills.map((item) => item.text),
        advisor.learningCost.text,
      ].join("\n").toLocaleLowerCase();
      const queryMatch = !needle || searchable.includes(needle);
      const tagMatch = filters.tags.length === 0 || filters.tags.some((tag) => advisor.tags.includes(tag));
      return queryMatch && tagMatch;
    })
    .sort((left, right) => filters.sort === "updated"
      ? right.updatedAt.localeCompare(left.updatedAt)
      : left.name.localeCompare(right.name, "zh-CN"));
}

export function getTagCounts(advisors: PublicAdvisor[]) {
  const counts = new Map<string, number>();
  advisors.forEach((advisor) => {
    new Set(advisor.tags).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });
  return [...counts.entries()].sort(([left], [right]) => left.localeCompare(right, "zh-CN"));
}
