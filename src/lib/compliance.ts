import { FileData, ComplianceScorecard, ComplianceIssue, RDProjectData } from "../types";

export function runComplianceAudit(projectData: RDProjectData): ComplianceScorecard {
  const issues: ComplianceIssue[] = [];
  let gu = 0;
  let exp = 0;
  let doc = 0;
  let scope = 0;
  let meas = 0;
  let atomic = 0;

  // 1. Genuine Uncertainty (0-25)
  const uncertainty = projectData.genuine_uncertainty_statement || {};
  const hypotheses = Object.keys(uncertainty).filter(k => k.startsWith("hypothesis_"));
  
  if (hypotheses.length === 0) {
    issues.push({
      severity: "CRITICAL",
      test: "Genuine Uncertainty",
      finding: "No hypotheses documented",
      evidence: "Missing hypothesis_* entries",
      fix: "Add at least 2 explicit hypotheses."
    });
  } else if (hypotheses.length === 1) {
    gu += 10;
    issues.push({
      severity: "MAJOR",
      test: "Genuine Uncertainty",
      finding: "Only one hypothesis documented",
      evidence: "Found 1 hypothesis",
      fix: "Add at least one more competing hypothesis."
    });
  } else {
    gu += 15;
  }

  const rationale = uncertainty.uncertainty_rationale || "";
  if (!rationale) {
    issues.push({
      severity: "MAJOR",
      test: "Genuine Uncertainty",
      finding: "No rationale provided",
      evidence: "Missing uncertainty_rationale",
      fix: "Explain why a competent professional couldn't predict the outcome."
    });
  } else if (rationale.length > 250) {
    gu += 10;
  } else {
    gu += 5;
    issues.push({
      severity: "MINOR",
      test: "Genuine Uncertainty",
      finding: "Uncertainty rationale too brief",
      evidence: `Rationale is ${rationale.length} chars`,
      fix: "Expand rationale to 250+ characters for ERIS 2026 compliance."
    });
  }

  // 2. Experimentation (0-25)
  const design = projectData.experimental_design || {};
  if (!design.control_group) {
    issues.push({
      severity: "CRITICAL",
      test: "Experimentation",
      finding: "No control group defined",
      evidence: "Missing control_group",
      fix: "Add a control_group section for baseline comparison."
    });
  } else {
    exp += 8;
  }

  const treatments = Object.keys(design).filter(k => k.startsWith("treatment_"));
  if (treatments.length === 0) {
    issues.push({
      severity: "CRITICAL",
      test: "Experimentation",
      finding: "No alternative approaches tested",
      evidence: "Missing treatment_* entries",
      fix: "Add 2+ treatment groups testing different designs."
    });
  } else if (treatments.length < 2) {
    exp += 8;
    issues.push({
      severity: "MAJOR",
      test: "Experimentation",
      finding: "Only one treatment approach tested",
      evidence: "Found 1 treatment",
      fix: "Add another treatment group to show iterative testing."
    });
  } else {
    exp += 17;
  }

  // 3. Documentation (0-25)
  const auditTrail = projectData.audit_trail_sample || [];
  const timestamped = auditTrail.filter((e: any) => e.timestamp).length;
  if (timestamped < 3) {
    doc += 5;
    issues.push({ severity: "CRITICAL", test: "Documentation", finding: `Only ${timestamped} events`, evidence: "Expected 5+", fix: "Add more timestamped milestones." });
  } else if (timestamped < 6) {
    doc += 12;
    issues.push({ severity: "MAJOR", test: "Documentation", finding: `Only ${timestamped} events`, evidence: "Ideal is 10+", fix: "Document intermediate milestones." });
  } else {
    doc += 18;
  }

  if (auditTrail.length > 1) {
    const times = auditTrail.map((e: any) => new Date(e.timestamp).getTime()).sort((a: any, b: any) => a - b);
    const days = (times[times.length - 1] - times[0]) / (1000 * 60 * 60 * 24);
    if (days < 14) {
      issues.push({ severity: "CRITICAL", test: "Documentation", finding: `Timeline spans only ${days.toFixed(1)} days`, evidence: "HMRC requires sustained R&D", fix: "Extend project timeline to 4+ weeks." });
    } else if (days < 60) {
      doc += 5;
      issues.push({ severity: "MAJOR", test: "Documentation", finding: `Timeline spans ${days.toFixed(1)} days`, evidence: "Complex R&D usually > 60 days", fix: "Extend project duration logic." });
    } else {
      doc += 7;
    }
  }

  // 4. Scope (0-25)
  const cost = projectData.cost_breakdown;
  const totalExp = cost?.total_qualifying_expenditure || 0;
  if (totalExp > 100000) scope += 8;
  else if (totalExp > 25000) scope += 4;
  else issues.push({ severity: "MINOR", test: "Technical Scope", finding: "Budget seems small for R&D claims", evidence: `£${totalExp}`, fix: "Ensure budget accurately reflects R&D intensity." });

  const roles = (projectData.team_composition?.roles || []);
  if (roles.length < 3) {
    scope += 4;
    issues.push({ severity: "MINOR", test: "Technical Scope", finding: "Narrow team structure", evidence: `${roles.length} role(s)`, fix: "Document cross-functional technical expertise." });
  } else {
    scope += 8;
  }

  const phases = Object.keys(projectData.experimental_timeline || {}).filter(k => k.startsWith("phase_"));
  if (phases.length < 4) {
    scope += 4;
    issues.push({ severity: "MAJOR", test: "Technical Scope", finding: `Only ${phases.length} phases`, evidence: "Rigorous R&D needs distinct phases", fix: "Define Ideation, Prototype, Beta, and Refinement phases." });
  } else {
    scope += 9;
  }

  // 5. Measurement (0-25)
  const protocol = projectData.measurement_protocol || {};
  if (!protocol.measurement_interval) {
    issues.push({ severity: "MAJOR", test: "Measurement", finding: "No interval specified", evidence: "Missing measurement_interval", fix: "Define how often metrics are tracked." });
  } else {
    meas += 8;
  }

  const metrics = (protocol.metrics_tracked || []);
  if (metrics.length < 3) {
    meas += 4;
    issues.push({ severity: "MAJOR", test: "Measurement", finding: `Only ${metrics.length} metric(s)`, evidence: "Expected 4+", fix: "Track more independent technical metrics." });
  } else {
    const complete = metrics.filter((m: any) => m.name && m.baseline_value !== undefined && m.measurement_method && m.success_threshold).length;
    if (complete === metrics.length) meas += 17;
    else {
      meas += 10;
      issues.push({ severity: "MINOR", test: "Measurement", finding: `${complete}/${metrics.length} metrics complete`, evidence: "Missing fields", fix: "All metrics must have baseline, method, and threshold." });
    }
  }

  // 6. Atomic Economy & OPF Alignment (Physics-based R&D) (0-25)
  // This measures the efficiency of the R&D process and alignment with the Observer-Potential Framework (OPF)
  const totalEntropy = issues.length * 10; // Each issue is a form of entropy
  const totalNegentropy = (gu + exp + doc + scope + meas);
  const efficiency = totalNegentropy / (totalNegentropy + totalEntropy || 1);
  
  // Specific OPF Alignment checks
  const hasOPFMetrics = (protocol.metrics_tracked || []).some((m: any) => 
    m.name?.toLowerCase().includes("entropy") || 
    m.name?.toLowerCase().includes("negentropy") || 
    m.name?.toLowerCase().includes("phi") ||
    m.name?.toLowerCase().includes("resonance")
  );

  let opfBonus = hasOPFMetrics ? 5 : 0;
  
  atomic = Math.round(efficiency * 20) + opfBonus;
  
  if (!hasOPFMetrics) {
    issues.push({
      severity: "MINOR",
      test: "Atomic Economy",
      finding: "Missing OPF-specific metrics",
      evidence: "No Ø-resonance or Negentropy metrics found",
      fix: "Incorporate Poincaré Information Density or Ø-resonance metrics for OPF alignment."
    });
  }

  if (efficiency < 0.6) {
    issues.push({
      severity: "MAJOR",
      test: "Atomic Economy",
      finding: "High process entropy detected",
      evidence: `${(1-efficiency).toFixed(2)} entropy overhead`,
      fix: "Streamline R&D documentation and resolve critical gaps to improve Observer Stability."
    });
  }

  const total = gu + exp + doc + scope + meas + atomic;
  let recommendation = "✗ UNACCEPTABLE - Total failure to meet ERIS 2026 standards";
  if (total >= 110) recommendation = "✓ OPTIMAL - Genome verified for maximum tax advantage";
  else if (total >= 90) recommendation = "✓ STRONG - High probability of audit success";
  else if (total >= 70) recommendation = "~ MARGINAL - Requires intense re-calibration";
  else if (total >= 50) recommendation = "✗ WEAK - High risk of HMRC challenge";

  return {
    genuine_uncertainty: gu,
    experimentation_process: exp,
    documentation: doc,
    technical_scope: scope,
    measurement_protocol: meas,
    atomic_economy_score: atomic,
    total_score: total,
    energy_efficiency: efficiency,
    issues,
    recommendation
  };
}

