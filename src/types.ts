export interface ComplianceIssue {
  severity: "CRITICAL" | "MAJOR" | "MINOR";
  test: string;
  finding: string;
  evidence: string;
  fix: string;
}

export interface ComplianceScorecard {
  genuine_uncertainty: number;
  experimentation_process: number;
  documentation: number;
  technical_scope: number;
  measurement_protocol: number;
  atomic_economy_score: number; // Physics-based addition
  total_score: number;
  energy_efficiency: number; // Ratio of Useful Work / Total Entropy
  issues: ComplianceIssue[];
  recommendation: string;
}

export interface RDProjectData {
  genuine_uncertainty_statement?: {
    uncertainty_rationale?: string;
    [key: string]: any;
  };
  experimental_design?: {
    control_group?: any;
    [key: string]: any;
  };
  audit_trail_sample?: { timestamp: string; event: string }[];
  cost_breakdown?: { total_qualifying_expenditure: number };
  team_composition?: { roles: string[] };
  experimental_timeline?: { [key: string]: any };
  measurement_protocol?: {
    measurement_interval?: string;
    metrics_tracked?: { name: string; baseline_value: number; measurement_method: string; success_threshold: number }[];
  };
}

export interface SignalPackage {
  instruction: string;
  input: string;
  output: string;
  metadata: {
    latency_reduction: string;
    compliance_score: number;
    space_research_relevance: string;
    negentropy_yield: number;
    signal_density: number;
  };
}

export interface ExtractionMetrics {
  total_entropy_processed: number;
  negentropy_yield: number;
  genuine_uncertainty_count: number;
  technical_advancements: number;
  latency_reduction_avg: string;
}

export interface ExtractionResult {
  signals: SignalPackage[];
  metrics: ExtractionMetrics;
  executive_summary: string;
  demon_log: string[];
  roadmap?: NegentropicRoadmap;
}

export interface EnergyLeak {
  type: "LATENCY" | "ERROR" | "OVERHEAD" | "LOGIC";
  description: string;
  severity: number;
  impact: string;
}

export interface NegentropicRoadmap {
  stage1: {
    entropy_report: {
      genuine_uncertainty: string[];
      technical_advancements: string[];
      energy_leaks: EnergyLeak[];
    };
  };
  stage2: {
    hugging_face_mapping: {
      dataset_id: string;
      rationale: string;
      scores: {
        negentropy_yield: number;
        signal_density: number;
        compliance_score: number;
      };
    }[];
  };
  stage3: {
    immediate_fixes: { problem: string; resolution: string }[];
    sft_pipeline: string;
    long_term_growth: string;
  };
}

export interface HFDatasetData {
  id: string;
  author: string;
  description: string;
  tags: string[];
  lastModified: string;
  downloads: number;
  likes: number;
  paperswithcode_id?: string;
}

export interface GitHubRepoData {
  owner: string;
  repo: string;
  description: string;
  topics: string[];
  commits: {
    message: string;
    date: string;
    author: string;
    hash?: string;
  }[];
  tree: string[];
  packageJson?: any;
}

export interface FileData {
  name: string;
  content: string;
  type: string;
}
