/* =========================================================================
   MENTOR PROFILE — T02 data adapter (integration copy).
   Adapted from the frozen T02 construction data.js (convergence-site):
   - single-mentor load by ?id=
   - public-only gate: only mentors in the public DTO + release_eligible=true render
   - release fail-closed · year authority · contact policy · featured gate preserved
   Content authority: Mentor Content Contract V2.1 FINAL. UI never edits data.
   ========================================================================= */

export async function loadAll(mentorId) {
  const id = String(mentorId || '').replace(/[^a-z0-9-]/g, '');
  const dto = await fetchJson('data/public-dto.json');
  const publicIds = new Set((dto.advisors || []).map(a => a.id));
  let mentors = {};
  if (id && publicIds.has(id)) {
    const [pack, manifest, validation, recs, dates] = await Promise.all([
      fetchJson('data/packs/' + id + '/public-advisor-v1.json'),
      fetchJson('data/packs/' + id + '/evidence-manifest-v1.json'),
      fetchJson('data/packs/' + id + '/validation-report-v1.json'),
      fetchJson('data/evidence/crossref_5dois.json'),
      fetchJson('data/evidence/crossref_dates.json'),
    ]);
    mentors[id] = buildAdvisor({ pack, manifest, validation }, recs, dates, dto);
  }
  return {
    mentors,
    meta: {
      dtoCount: (dto.advisors || []).length,
      publicIds,
    },
  };
}

function buildAdvisor({ pack, manifest, validation }, recs, dates, dto) {
  const release = releaseEligibility(validation);
  const adopted = (manifest.candidate_evidence || []).filter(e => (e.candidate_statuses || []).includes('adopted'));
  const pubEv = adopted.filter(e => e.evidence_type === 'publication');
  const profileEv = adopted.filter(e => e.evidence_type === 'official_profile');

  const pubs = pubEv.map(e => {
    const doi = (e.doi || '').replace(/^https?:\/\/doi\.org\//, '');
    const rec = (recs || {})[doi] || {};
    const dt = (dates || {})[doi] || {};
    return {
      id: e.evidence_id,
      title: e.title,
      year: canonicalYear(dt, rec),
      doi,
      venue: rec.container || null,
      volume: dt.volume || null,
      issue: dt.issue || null,
      pages: dt.page || null,
      position: e.author_position || null,
      corresponding: !!e.is_corresponding,
      identityVerified: !!e.identity_verified,
      versionGroup: e.version_group || null,
      verifiedAt: e.last_verified_at || null,
      sourceUrl: e.source_url || null,
    };
  }).sort((a, b) => (b.year || 0) - (a.year || 0));

  const contact = buildContact(pack);

  return {
    id: pack.advisor_id,
    nameZh: val(pack.name_zh), nameEn: val(pack.name_en),
    institution: val(pack.institution), department: val(pack.school_or_department),
    position: val(pack.position),
    roles: (pack.public_roles || []).map(r => r.value),
    summary: pack.summary ? pack.summary.text : null,
    tags: pack.tags || [],
    keywords: pack.search_keywords || [],
    boundary: pack.boundary_statement,
    contact,
    release: {
      eligible: release.eligible,
      warning: release.warning,
      publicationStatus: pack.publication_status,
      identityStatus: pack.publication_identity_status,
      evidenceStatus: pack.evidence_status,
      confidence: pack.confidence,
      featuredStatus: pack.featured_selection_status,
      featuredIds: pack.featured_publication_evidence_ids || [],
      dataStatusNote: pack.data_status_note,
      warnings: (validation.warnings || []).map(w => ({ code: w.code, severity: w.severity, message: w.message })),
    },
    directions: {
      original: (pack.research_directions_original || []).map(d => ({ text: d.text, status: d.evidence_status, confidence: d.confidence, sources: d.source_urls || [] })),
      plain: (pack.research_directions_plain_language || []).map(d => ({
        term: d.term_original, explanation: d.explanation_zh, undergrad: d.undergraduate_meaning,
        confidence: d.confidence, lane: d.evidence_lane, evidenceIds: d.evidence_ids || [],
      })),
    },
    research: {
      questions: (pack.research_questions || []).map(g => ({ text: g.text, confidence: g.confidence, lane: g.evidence_lane, ids: g.evidence_ids || [] })),
      techniques: (pack.main_techniques || []).map(g => ({ text: g.text, confidence: g.confidence, lane: g.evidence_lane, ids: g.evidence_ids || [] })),
      workflow: (pack.research_workflow || []).map(g => ({ text: g.text, confidence: g.confidence, lane: g.evidence_lane, ids: g.evidence_ids || [] })),
    },
    undergrad: {
      tasks: (pack.possible_undergraduate_tasks || []).map(t => ({
        task: t.task, context: t.task_context, purpose: t.task_purpose,
        methods: t.possible_methods || [], output: t.possible_output,
        confidence: t.confidence, note: t.uncertainty_note, ids: t.evidence_ids || [],
      })),
      prereq: (pack.prerequisite_skills || []).map(p => ({ text: p.text, confidence: p.confidence, ids: p.evidence_ids || [] })),
      learningCost: pack.learning_cost ? { text: pack.learning_cost.text, confidence: pack.learning_cost.confidence } : null,
      growthPath: (pack.generic_growth_path || []).map(g => ({
        stage: g.stage, activities: g.possible_activities || [], outputs: g.possible_outputs || [],
        note: g.uncertainty_note || null, ids: g.evidence_ids || [],
      })),
    },
    publications: pubs,
    evidenceById: evidenceIndex(manifest),
    profileEv,
    sourceScope: manifest.source_scope,
    officialEv: manifest.candidate_evidence || [],
  };
}

function evidenceIndex(manifest) {
  const map = {};
  for (const e of manifest.candidate_evidence || []) {
    map[e.evidence_id] = {
      id: e.evidence_id, type: e.evidence_type, sourceUrl: e.source_url,
      authority: e.source_authority, statuses: e.candidate_statuses || [],
      supportedFields: e.supported_fields || [], notes: e.notes || null,
      verifiedAt: e.last_verified_at, title: e.title || null,
      doi: e.doi ? String(e.doi).replace(/^https?:\/\/doi\.org\//, '') : null,
      year: e.publication_year || null,
      position: e.author_position || null,
      corresponding: !!e.is_corresponding,
      identityVerified: !!e.identity_verified,
      versionGroup: e.version_group || null,
    };
  }
  return map;
}

function releaseEligibility(validationRecord) {
  const has = validationRecord && Object.prototype.hasOwnProperty.call(validationRecord, 'release_eligible');
  const raw = has ? validationRecord.release_eligible : undefined;
  if (raw === true) return { eligible: true, warning: null };
  if (raw === false) return { eligible: false, warning: null };
  const why = raw === undefined ? 'RELEASE_ELIGIBILITY_MISSING' : 'RELEASE_ELIGIBILITY_MALFORMED';
  return { eligible: false, warning: { code: why, severity: 'warning', note: 'release permission not established; fail closed' } };
}

function canonicalYear(dt, rec) {
  if (dt && dt.published_print && dt.published_print[0]) return dt.published_print[0][0];
  if (dt && dt.issued && dt.issued[0]) return dt.issued[0][0];
  if (dt && dt.published_online && dt.published_online[0]) return dt.published_online[0][0];
  return (rec && rec.year) || null;
}

function buildContact(pack) {
  const c = pack.contact || {};
  const profile = c.official_profile_url && c.official_profile_url.value ? c.official_profile_url.value : null;
  const email = c.official_email && c.official_email.value ? c.official_email.value : null;
  const emailVerified = !!email && c.official_email.missing_status === 'available';
  return {
    officialProfileUrl: profile,
    officialEmail: emailVerified ? email : null,
    emailVerified,
    emailPublicationAllowed: false,
    emailVisibility: emailVerified ? 'REVIEW_ONLY' : 'HIDDEN',
    profileVisibility: profile ? 'PUBLIC_VERIFIED' : 'HIDDEN',
    warnings: emailVerified ? [{ code: 'CONTACT_CURRENCY_UNVERIFIED', severity: 'warning', note: 'page-captured; timeliness not re-verified' }] : [],
  };
}

function val(f) { return f && f.value ? f.value : null; }

function fetchJson(url) {
  return fetch(url).then(r => { if (!r.ok) throw new Error('fetch failed ' + url); return r.json(); });
}
