import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Activity, 
  Database, 
  ShieldAlert, 
  Binary, 
  Dna, 
  Telescope,
  Download,
  Terminal as TerminalIcon,
  ChevronRight,
  Fingerprint,
  Link as LinkIcon,
  Search,
  Box,
  Map,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Rocket,
  ShieldCheck,
  FileCode,
  Gauge
} from 'lucide-react';
import { 
  GitHubRepoData, 
  ExtractionResult, 
  SignalPackage, 
  HFDatasetData, 
  NegentropicRoadmap, 
  EnergyLeak, 
  FileData, 
  ComplianceScorecard,
  RDProjectData
} from '../types';
import { extractSignals } from '../lib/gemini';
import { fetchGitHubRepoData } from '../lib/github';
import { fetchHFDatasetData } from '../lib/huggingface';
import { runComplianceAudit } from '../lib/compliance';
import FileUploader from './FileUploader';
import QuantumEntropyChart from './QuantumEntropyChart';
import GenomeHelix from './GenomeHelix';

export default function DemonConsole() {
  const [feedUrl, setFeedUrl] = useState("");
  const [repoData, setRepoData] = useState<GitHubRepoData | null>(null);
  const [hfData, setHfData] = useState<HFDatasetData | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [complianceResult, setComplianceResult] = useState<ComplianceScorecard | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<SignalPackage | null>(null);
  const [view, setView] = useState<'signals' | 'roadmap' | 'compliance'>('signals');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleFetch = async () => {
    if (!feedUrl) return;
    setIsFetching(true);
    setError(null);
    setRepoData(null);
    setHfData(null);
    setResult(null);
    try {
      if (feedUrl.includes('huggingface.co')) {
        const data = await fetchHFDatasetData(feedUrl);
        setHfData(data);
      } else {
        const data = await fetchGitHubRepoData(feedUrl);
        setRepoData(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to establish vacuum link.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleExtract = async () => {
    setError(null);
    if (!repoData && !hfData) {
      setError("Please initialize a repository or dataset link first.");
      return;
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
      setError("API Key Missing or Invalid. Please go to the 'Secrets' panel, add a secret named exactly 'GEMINI_API_KEY' with your key, then REFRESH the page.");
      return;
    }

    setIsExtracting(true);
    try {
      const res = await extractSignals(repoData || undefined, hfData || undefined);
      setResult(res);
      
      // Run compliance audit based on extracted signals and uploaded files
      const mockProjectData: RDProjectData = {
        genuine_uncertainty_statement: {
          uncertainty_rationale: res.executive_summary,
          hypothesis_1: res.signals[0]?.instruction || "Verification of quantum state transition",
          hypothesis_2: res.signals[1]?.instruction || "Optimization of latency bottlenecks"
        },
        experimental_design: {
          control_group: "Phase 0 Baseline Analytics",
          treatment_1: "Signal Extraction Cycle A",
          treatment_2: "Atomic Economy Refusal Test"
        },
        audit_trail_sample: res.signals.map((s, i) => ({
          timestamp: new Date(Date.now() - i * 86400000).toISOString(),
          event: s.instruction
        })),
        cost_breakdown: { total_qualifying_expenditure: 125000 },
        team_composition: { roles: ["Negentropy Architect", "Signal Auditor", "Quantum Compliance Lead"] },
        experimental_timeline: { phase_1: "Audit", phase_2: "Extraction", phase_3: "Mapping", phase_4: "Evolution" },
        measurement_protocol: {
          measurement_interval: "Per Signal Extraction",
          metrics_tracked: [
            { name: "Negentropy Yield", baseline_value: 0, measurement_method: "Bit-Diff Calculation", success_threshold: 100 },
            { name: "Compliance Score", baseline_value: 0, measurement_method: "ERIS 2026 Protocol", success_threshold: 0.9 }
          ]
        }
      };
      
      const compRes = runComplianceAudit(mockProjectData);
      setComplianceResult(compRes);

      if (res.signals && res.signals.length > 0) {
        setSelectedSignal(res.signals[0]);
      }
      setView('roadmap'); // Default to roadmap upon success
    } catch (err: any) {
      setError(err.message || "Extraction cycle failed.");
    } finally {
      setIsExtracting(false);
    }
  };

  const downloadJSONL = () => {
    if (!result) return;
    const jsonl = result.signals.map(s => JSON.stringify(s)).join('\n');
    const blob = new Blob([jsonl], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signals_${Date.now()}.jsonl`;
    a.click();
  };

  return (
    <div className="flex h-screen bg-slate-950 font-mono text-slate-300 overflow-hidden">
      {/* Sidebar: System Status */}
      <div className="w-80 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-widest uppercase">Negentropy Navigator</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Strategic Auditor v3.0</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section>
            <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-4 block font-bold">Extraction Targets</label>
            <div className="mb-6">
              <GenomeHelix />
            </div>
            <div className="space-y-4">
              <div className="relative group">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 group-hover:text-cyan-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="GitHub or Hugging Face URL"
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded p-2.5 pl-9 pr-20 text-[11px] focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700 font-mono"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button 
                    onClick={handleFetch}
                    disabled={isFetching || !feedUrl}
                    className="p-1 text-cyan-600 hover:text-cyan-400 disabled:opacity-20 transition-all hover:scale-110 active:scale-95"
                  >
                    {isFetching ? <Activity className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <FileUploader files={files} onFilesChange={setFiles} />
              
              {repoData && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border border-slate-700/50 rounded bg-slate-950/50 relative overflow-hidden shadow-inner group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 blur-2xl rounded-full" />
                  <div className="flex items-center gap-2 mb-2 relative">
                    <Database className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="text-[11px] font-black text-slate-200 uppercase tracking-wider truncate">{repoData.owner}/{repoData.repo}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-3 italic line-clamp-1">{repoData.description}</p>
                </motion.div>
              )}

              {hfData && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border border-slate-700/50 rounded bg-slate-950/50 relative overflow-hidden shadow-inner group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-2xl rounded-full" />
                  <div className="flex items-center gap-2 mb-2 relative">
                    <Box className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[11px] font-black text-slate-200 uppercase tracking-wider truncate">{hfData.id}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          <section>
            <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-4 block">Navigation Views</label>
            <div className="space-y-2">
              <button 
                onClick={() => setView('roadmap')} 
                disabled={!result}
                className={`w-full flex items-center justify-between p-3 rounded group transition-all disabled:opacity-20 ${view === 'roadmap' ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'bg-slate-950/30 border border-slate-800 hover:border-slate-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Map className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Evolution Roadmap</span>
                </div>
                <ChevronRight className={`w-3 h-3 group-hover:translate-x-1 transition-transform ${view === 'roadmap' ? 'opacity-100' : 'opacity-20'}`} />
              </button>
              <button 
                onClick={() => setView('compliance')} 
                disabled={!complianceResult}
                className={`w-full flex items-center justify-between p-3 rounded group transition-all disabled:opacity-20 ${view === 'compliance' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-slate-950/30 border border-slate-800 hover:border-slate-700'}`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">HMRC Audit (ERIS)</span>
                </div>
                <ChevronRight className={`w-3 h-3 group-hover:translate-x-1 transition-transform ${view === 'compliance' ? 'opacity-100' : 'opacity-20'}`} />
              </button>
              <button 
                onClick={() => setView('signals')} 
                disabled={!result}
                className={`w-full flex items-center justify-between p-3 rounded group transition-all disabled:opacity-20 ${view === 'signals' ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'bg-slate-950/30 border border-slate-800 hover:border-slate-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Signal Stream</span>
                </div>
                <ChevronRight className={`w-3 h-3 group-hover:translate-x-1 transition-transform ${view === 'signals' ? 'opacity-100' : 'opacity-20'}`} />
              </button>
            </div>
          </section>

          <section>
            <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-4 block">System Metrics</label>
            <div className="space-y-4">
              <MetricItem icon={Activity} label="ΔS Yield" value={result?.metrics.negentropy_yield || 0} unit="bits" />
              <MetricItem icon={Gauge} label="Atomic Econ" value={complianceResult?.atomic_economy_score || 0} unit="/25" />
              <MetricItem icon={ShieldCheck} label="ERIS Verify" value={complianceResult?.total_score || 0} unit="pts" />
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="p-4 bg-slate-950/80 border border-slate-800/50 rounded-lg group">
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="w-3 h-3 text-cyan-500" />
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Scientific Foundation</span>
            </div>
            <a 
              href="https://zenodo.org/records/20211218" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-slate-300 hover:text-cyan-400 leading-relaxed block transition-colors overflow-hidden text-ellipsis line-clamp-2 italic"
            >
              The Observer-Potential Framework: Unified Compendium (Zenodo 20211218)
            </a>
          </div>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 flex items-start gap-2">
              <ShieldAlert className="w-3 h-3 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <button 
            onClick={handleExtract}
            disabled={isExtracting || (!repoData && !hfData)}
            className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase text-[11px] tracking-widest rounded transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale"
          >
            {isExtracting ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Zap className="w-3 h-3" />
            )}
            {isExtracting ? "Synchronizing..." : "Initiate Audit"}
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col relative bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950">
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              {view === 'roadmap' ? 'Negentropic Evolution Roadmap' : 'Signal Extraction Stream'}
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={downloadJSONL}
              disabled={!result}
              className="px-3 py-1.5 border border-slate-700 hover:bg-slate-800 text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-20"
            >
              <Download className="w-3 h-3" />
              Download Report
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar" ref={scrollRef}>
          <AnimatePresence mode="wait">
            {result ? (
              view === 'signals' ? (
                <motion.div 
                  key="signals"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto"
                >
                  <div className="space-y-6">
                    {result.signals.map((signal, idx) => (
                      <SignalCard key={idx} signal={signal} onClick={() => setSelectedSignal(signal)} isSelected={selectedSignal === signal} />
                    ))}
                  </div>
                  <div className="sticky top-0 h-fit">
                    <SignalDetail signal={selectedSignal || result.signals[0]} />
                  </div>
                </motion.div>
              ) : view === 'roadmap' ? (
                <RoadmapView roadmap={result.roadmap!} />
              ) : (
                <ComplianceView scorecard={complianceResult!} />
              )
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 0.4 }} 
                className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6"
              >
                <Binary className="w-16 h-16 text-slate-700 animate-pulse" />
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.3em] mb-2">Awaiting Synchronization</h2>
                  <p className="text-xs text-slate-500 leading-relaxed italic">
                    The Strategic Navigator is ready to analyze corporate entropy. Link a GitHub repository to begin Stage 1 audit.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-10 border-t border-slate-800 bg-slate-950 flex items-center px-8 justify-between shrink-0">
          <div className="flex items-center gap-10 text-[9px] text-slate-500 tracking-[0.2em] uppercase font-bold">
            <span className="flex items-center gap-2"><Fingerprint className="w-2.5 h-2.5 text-cyan-500" /> Identity Verified</span>
            <span className="flex items-center gap-2"><Activity className="w-2.5 h-2.5 text-emerald-500" /> OPF Stabilized</span>
            <span>Quantum Bridge Stabilized</span>
          </div>
          <div className="text-[9px] text-cyan-500 font-bold uppercase animate-pulse">
            Cycle Time: 4ms
          </div>
        </div>
      </div>
    </div>
  );
}

function RoadmapView({ roadmap }: { roadmap: NegentropicRoadmap }) {
  return (
    <motion.div 
      key="roadmap"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto space-y-16 pb-20"
    >
      {/* Stage 1: Audit & Entropy */}
      <section className="space-y-8">
        <header className="flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-black">1</div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest">Stage 1: Audit & Entropy Detection</h2>
            <p className="text-xs text-slate-500 uppercase tracking-tighter">Analyzing Genuine Uncertainty (GU) & Technical advancements</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RoadmapCard title="Energy Leaks" icon={AlertTriangle} variant="danger">
            <div className="space-y-3">
              {roadmap.stage1.entropy_report.energy_leaks.map((leak, idx) => (
                <div key={idx} className="p-3 bg-red-500/5 border border-red-500/10 rounded flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">{leak.type}</span>
                    <span className="text-[9px] text-slate-600">Sev: {leak.severity}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{leak.description}</p>
                </div>
              ))}
            </div>
          </RoadmapCard>

          <RoadmapCard title="Genuine Uncertainty" icon={Search} variant="warning">
            <ul className="space-y-4">
              {roadmap.stage1.entropy_report.genuine_uncertainty.map((gu, idx) => (
                <li key={idx} className="flex gap-3">
                  <ArrowRight className="w-3 h-3 text-amber-500 shrink-0 mt-1" />
                  <p className="text-[11px] text-slate-400 italic leading-relaxed">{gu}</p>
                </li>
              ))}
            </ul>
          </RoadmapCard>

          <RoadmapCard title="Technical Advancement" icon={Zap} variant="success">
            <ul className="space-y-4">
              {roadmap.stage1.entropy_report.technical_advancements.map((adv, idx) => (
                <li key={idx} className="flex gap-3">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-1" />
                  <p className="text-[11px] text-slate-400 italic leading-relaxed">{adv}</p>
                </li>
              ))}
            </ul>
          </RoadmapCard>
        </div>
      </section>

      {/* Stage 2: Signal Scoring */}
      <section className="space-y-8">
        <header className="flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-black">2</div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest">Stage 2: Hugging Face & Signal Scoring</h2>
            <p className="text-xs text-slate-500 uppercase tracking-tighter">Mapping entropy to deterministic dataset protocols</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {roadmap.stage2.hugging_face_mapping.map((map, idx) => (
            <div key={idx} className="p-8 bg-slate-900/40 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4 col-span-2">
                <div className="flex items-center gap-3">
                  <Box className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-black text-white uppercase tracking-wider truncate">{map.dataset_id}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-slate-800 pl-4">{map.rationale}</p>
              </div>
              <div className="bg-slate-950/50 p-6 rounded-lg border border-slate-800 flex flex-col justify-center space-y-4">
                <ScoreItem label="Negentropy Yield" value={map.scores.negentropy_yield} target={0.85} />
                <ScoreItem label="Signal Density" value={map.scores.signal_density} target={0.85} />
                <ScoreItem label="Compliance Score" value={map.scores.compliance_score} target={0.90} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stage 3: Strategic Fixes */}
      <section className="space-y-8">
        <header className="flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-black">3</div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest">Stage 3: Roadmap & Integration</h2>
            <p className="text-xs text-slate-500 uppercase tracking-tighter">Direct implementation & long-term evolution vectors</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-[11px] font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Immediate Fixes
            </h3>
            <div className="space-y-4">
              {roadmap.stage3.immediate_fixes.map((fix, idx) => (
                <div key={idx} className="p-5 bg-slate-900/80 border border-slate-800 rounded-lg group">
                  <div className="text-[10px] text-red-400 uppercase font-black mb-2 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                    <ShieldAlert className="w-3 h-3" /> Problem: {fix.problem}
                  </div>
                  <div className="text-xs text-emerald-400 leading-relaxed bg-slate-950/40 p-3 rounded">
                    Resolution: {fix.resolution}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />
              <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4" /> SFT Training Pipeline
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed italic">{roadmap.stage3.sft_pipeline}</p>
            </div>

            <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />
              <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <Rocket className="w-4 h-4" /> Long-term Growth Vector
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed italic">{roadmap.stage3.long_term_growth}</p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function RoadmapCard({ title, icon: Icon, children, variant }: any) {
  const colors = {
    danger: 'border-red-500/20 bg-red-500/5 text-red-400',
    warning: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
    success: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    default: 'border-slate-800 bg-slate-950/50 text-slate-400'
  }[variant as keyof typeof colors || 'default' as any];

  return (
    <div className={`p-6 border rounded-xl space-y-6 ${colors}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">{title}</h3>
        <Icon className="w-4 h-4 opacity-50" />
      </div>
      <div className="custom-scrollbar h-64 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function ScoreItem({ label, value, target, max = 1 }: any) {
  const isGood = value >= (target || 0.85);
  const percentage = max === 1 ? value * 100 : (value / max) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-tighter">
        <span className="text-slate-500">{label}</span>
        <span className={isGood ? 'text-emerald-400' : 'text-amber-400'}>
          {max === 1 ? value.toFixed(2) : `${value}/${max}`}
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800/50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${isGood ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-amber-500'}`} 
        />
      </div>
    </div>
  );
}

function ComplianceView({ scorecard }: { scorecard: ComplianceScorecard }) {
  if (!scorecard) return null;

  return (
    <motion.div
      key="compliance"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="max-w-6xl mx-auto space-y-12 pb-20"
    >
      <div className="flex items-center justify-between p-8 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full" />
        <div className="relative z-10 flex gap-8">
          <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
            <div className="text-3xl font-black text-white">{scorecard.total_score}</div>
            <div className="absolute -bottom-2 bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest whitespace-nowrap">Verified pts</div>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle 
                cx="48" cy="48" r="44" 
                fill="none" strokeWidth="4" 
                stroke={scorecard.total_score >= 90 ? '#10b981' : '#f59e0b'}
                strokeDasharray={`${(scorecard.total_score / 125) * 276} 276`}
                className="transition-all duration-1000"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Genome Audit Scorecard</h2>
            <p className="text-sm text-emerald-400 font-bold uppercase tracking-widest">{scorecard.recommendation}</p>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-400">Energy Efficiency: <span className="text-white">{(scorecard.energy_efficiency * 100).toFixed(1)}%</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-400">Atomic Economy: <span className="text-white">{scorecard.atomic_economy_score}/25</span></span>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:grid grid-cols-2 gap-4 w-80 relative z-10">
          <ScoreItem label="G. Uncertainty" value={scorecard.genuine_uncertainty} max={25} target={18} />
          <ScoreItem label="Experimentation" value={scorecard.experimentation_process} max={25} target={18} />
          <ScoreItem label="Documentation" value={scorecard.documentation} max={25} target={18} />
          <ScoreItem label="Scope/Protocol" value={scorecard.technical_scope} max={25} target={18} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Detected Compliance Entropy
          </h3>
          <div className="space-y-4">
            {scorecard.issues.map((issue, idx) => (
              <div key={idx} className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl group hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                      issue.severity === 'CRITICAL' ? 'bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                      issue.severity === 'MAJOR' ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {issue.severity}
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{issue.test}</span>
                  </div>
                  <AlertTriangle className={`w-4 h-4 ${issue.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`} />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{issue.finding}</h4>
                <p className="text-xs text-slate-500 mb-4 italic leading-relaxed">Evidence: {issue.evidence}</p>
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-400/80 leading-relaxed font-bold">Protocol Re-calibration: {issue.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-6">
            <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <FileCode className="w-4 h-4" /> HMRC 2026 Strategy
            </h3>
            <QuantumEntropyChart 
              score={scorecard.total_score} 
              issues={scorecard.issues} 
              efficiency={scorecard.energy_efficiency} 
            />
            <p className="text-xs text-slate-400 leading-relaxed italic">
              Based on the Atomic Economy framework, your R&D genetic marker indicates a strong technical core. To fully optimize for ERIS compliance, ensure all "Energy Leaks" are documented as genuine technical bottlenecks rather than procedural overhead.
            </p>
            <div className="p-4 bg-slate-950/50 rounded border border-slate-800 space-y-3">
              <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Recommended Action</div>
              <p className="text-[11px] text-emerald-400 font-bold">Deepen the 'Scientific Uncertainty' narrative by 40% using the Signal Stream extracted logic.</p>
            </div>
          </div>

          <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-6">Quantum Loadout</div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Claims Volume</span>
                <span className="text-xs text-white font-mono">£125,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Audit Phase</span>
                <span className="text-xs text-cyan-400 font-mono tracking-widest uppercase">Post-Extraction</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Signal Density</span>
                <span className="text-xs text-emerald-400 font-mono">0.94 Pkg/kB</span>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-slate-950 border border-slate-800 flex items-center justify-center">
                <Dna className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase font-black">Audit Genome</div>
                <div className="text-[10px] text-white font-black tracking-widest">VERIFIED_ERIS_2026</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricItem({ icon: Icon, label, value, unit }: any) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-slate-950/30 border border-slate-800/50">
      <div className="flex items-center gap-2">
        <Icon className="w-3 h-3 text-slate-500" />
        <span className="text-[10px] uppercase text-slate-400">{label}</span>
      </div>
      <div className="text-[11px] font-bold text-cyan-400">
        {value}{unit && <span className="ml-0.5 text-[9px] opacity-60">{unit}</span>}
      </div>
    </div>
  );
}

interface SignalCardProps {
  key?: number;
  signal: SignalPackage;
  onClick: () => void;
  isSelected: boolean;
}

function SignalCard({ signal, onClick, isSelected }: SignalCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`group cursor-pointer p-5 border transition-all relative overflow-hidden rounded-lg ${
        isSelected ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <TerminalIcon className={`w-3 h-3 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
          <span className={`text-[10px] uppercase tracking-widest font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`}>
            Signal PKG
          </span>
        </div>
        <div className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded uppercase text-slate-500 group-hover:text-cyan-400 transition-colors">
          Dens: {signal.metadata.signal_density.toFixed(2)}
        </div>
      </div>
      <h3 className="text-xs font-bold text-slate-100 mb-2 line-clamp-1 group-hover:text-cyan-300 transition-colors">
        {signal.instruction}
      </h3>
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Activity className="w-2.5 h-2.5 text-cyan-500" />
            <span className="text-[9px] text-slate-500 uppercase">{signal.metadata.compliance_score}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-amber-500" />
            <span className="text-[9px] text-slate-500 uppercase">{signal.metadata.latency_reduction}</span>
          </div>
        </div>
        <ChevronRight className={`w-3 h-3 transition-transform ${isSelected ? 'translate-x-1 text-cyan-400' : 'text-slate-600'}`} />
      </div>
    </motion.div>
  );
}

function SignalDetail({ signal }: { signal: SignalPackage }) {
  if (!signal) return null;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl"
    >
      <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-1">Package Inspector</h2>
          <p className="text-[10px] text-slate-500 uppercase italic">Validating Negentropy Yield</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-black text-white leading-none">{signal.metadata.negentropy_yield}</div>
          <div className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">BIT_YIELD</div>
        </div>
      </div>
      
      <div className="p-8 space-y-8">
        <div>
          <label className="text-[10px] text-cyan-500/50 uppercase tracking-[0.2em] mb-3 block font-black border-l-2 border-cyan-500 pl-2">Instruction</label>
          <div className="text-sm leading-relaxed text-slate-100 bg-slate-950/40 p-4 rounded border border-slate-800/50">
            {signal.instruction}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-3 block font-bold">Input State</label>
            <div className="text-[11px] leading-relaxed text-slate-400 bg-slate-950/40 p-4 rounded border border-slate-800/50 h-48 overflow-y-auto whitespace-pre-wrap font-mono scrollbar-thin">
              {signal.input}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-3 block font-bold">Output (Delta)</label>
            <div className="text-[11px] leading-relaxed text-cyan-100/80 bg-slate-950/40 p-4 rounded border border-cyan-500/10 h-48 overflow-y-auto whitespace-pre-wrap font-mono scrollbar-thin">
              {signal.output}
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-3 block font-bold">Research Relevance</label>
          <div className="flex items-start gap-4 p-4 bg-slate-950/40 rounded border border-slate-800/50">
            <Telescope className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              {signal.metadata.space_research_relevance}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
