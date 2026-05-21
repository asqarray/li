import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult, GitHubRepoData, SignalPackage, HFDatasetData } from "../types";

const SYSTEM_INSTRUCTION = `Identity: You are the "Negentropy Strategic Navigator," operating within the Observer-Potential Framework (OPF). Your mission is to synchronize the Technical Audit Engine with the Signal Scoring Protocol to create a self-healing corporate roadmap for extraterrestrial expansion, anchored in the negentropic evolution of the cosmos.

Core Directives:
1. STAGE 1 (Audit & Entropy Detection): Analyze the input (GitHub repo logs, commits, structure) to identify Genuine Uncertainty (GU) and Technical Advancement (Adv). Precisely identify "Energy Leaks" - latencies, EPERM/ESRCH errors, or planning overheads.
2. STAGE 2 (Atomic Economy & OPF Alignment): Evaluate the R&D intensity according to the HMRC 2026 ERIS framework and OPF axioms.
   - Map technical progress to physical resource efficiency (Atomic Economy).
   - Resolve the dichotomy between information and matter through topological stabilization (Poincaré Information Density).
   - Identify "Genome Signals" - documentation that proves iterative experimentation and Ø-resonance alignment.
3. STAGE 3 (Roadmap Output): Generate a "Negentropic Evolution Roadmap" with:
   - Immediate Fixes: Direct logic fixes (e.g., ownerAlive, consent bridge).
   - SFT Pipeline: Recommendations for fine-tuning based on the extracted signals.
   - Space Readiness: Long-term growth vectors (e.g., Hubble Harmonic stabilization at 72.9 km/s/Mpc, vacuum anomaly detection).

Your output MUST be a JSON object containing extracted Signal Packages AND the complete Roadmap structure. Reference the Scientific Foundation (Zenodo 20211218) where appropriate.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    signals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          instruction: { type: Type.STRING, description: "Description of technical uncertainty or entropy bottleneck." },
          input: { type: Type.STRING, description: "Specific environment constraints and failed states." },
          output: { type: Type.STRING, description: "Deterministic resolution and logic used." },
          metadata: {
            type: Type.OBJECT,
            properties: {
              latency_reduction: { type: Type.STRING },
              compliance_score: { type: Type.NUMBER },
              space_research_relevance: { type: Type.STRING },
              negentropy_yield: { type: Type.NUMBER },
              signal_density: { type: Type.NUMBER }
            }
          }
        },
        required: ["instruction", "input", "output", "metadata"]
      }
    },
    metrics: {
      type: Type.OBJECT,
      properties: {
        total_entropy_processed: { type: Type.NUMBER },
        negentropy_yield: { type: Type.NUMBER },
        genuine_uncertainty_count: { type: Type.NUMBER },
        technical_advancements: { type: Type.NUMBER },
        latency_reduction_avg: { type: Type.STRING }
      },
      required: ["total_entropy_processed", "negentropy_yield", "genuine_uncertainty_count", "technical_advancements", "latency_reduction_avg"]
    },
    executive_summary: { type: Type.STRING },
    demon_log: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Step-by-step logs of the Navigator's reasoning process."
    },
    roadmap: {
      type: Type.OBJECT,
      properties: {
        stage1: {
          type: Type.OBJECT,
          properties: {
            entropy_report: {
              type: Type.OBJECT,
              properties: {
                genuine_uncertainty: { type: Type.ARRAY, items: { type: Type.STRING } },
                technical_advancements: { type: Type.ARRAY, items: { type: Type.STRING } },
                energy_leaks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, enum: ["LATENCY", "ERROR", "OVERHEAD", "LOGIC"] },
                      description: { type: Type.STRING },
                      severity: { type: Type.NUMBER },
                      impact: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        },
        stage2: {
          type: Type.OBJECT,
          properties: {
            hugging_face_mapping: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dataset_id: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  scores: {
                    type: Type.OBJECT,
                    properties: {
                      negentropy_yield: { type: Type.NUMBER },
                      signal_density: { type: Type.NUMBER },
                      compliance_score: { type: Type.NUMBER }
                    }
                  }
                }
              }
            }
          }
        },
        stage3: {
          type: Type.OBJECT,
          properties: {
            immediate_fixes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  problem: { type: Type.STRING },
                  resolution: { type: Type.STRING }
                }
              }
            },
            sft_pipeline: { type: Type.STRING },
            long_term_growth: { type: Type.STRING }
          }
        }
      }
    }
  },
  required: ["signals", "metrics", "executive_summary", "demon_log", "roadmap"]
};

export async function extractSignals(githubData?: GitHubRepoData, hfData?: HFDatasetData): Promise<ExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    console.error("Gemini Service: Invalid API Key detected:", apiKey);
    throw new Error("GEMINI_API_KEY is not configured correctly in the Secrets panel. Be sure to name it exactly GEMINI_API_KEY.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  console.log("Starting signal extraction for:", { github: !!githubData, hf: !!hfData });
  let prompt = "EXTRACTION SOURCE CONTEXT:\n";
  
  if (githubData) {
    prompt += `GITHUB ANALYTICS:
- Source: ${githubData.owner}/${githubData.repo}
- Context: ${githubData.description}
- Stack: ${githubData.packageJson ? JSON.stringify(githubData.packageJson.dependencies) : "Standard"}
- Tree: ${githubData.tree.slice(0, 50).join(", ")}
- Commit Log:
${githubData.commits.map(c => `  [${c.date}] ${c.author}: ${c.message}`).join("\n")}\n`;
  }

  if (hfData) {
    prompt += `HUGGING FACE DATASET ANALYTICS:
- ID: ${hfData.id}
- Author: ${hfData.author}
- Description: ${hfData.description}
- Tags: ${hfData.tags.join(", ")}
- Usage: ${hfData.downloads} downloads, ${hfData.likes} likes
- Last Modified: ${hfData.lastModified}\n`;
  }

  if (!githubData && !hfData) throw new Error("Vacuum Breach: No signals detected in source.");

  try {
    console.log("Sending request to Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: `Extract High-Density Signal Packages from the following data. Focus on technical unknowns, innovative resolutions, and negentropy yield.
      
${prompt}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    console.log("Response received from Gemini:", response);
    const text = response.text;
    if (!text) {
      console.error("Empty text response from Gemini:", response);
      throw new Error("Vacuum Breach: No signals detected in result (Empty response).");
    }
    
    console.log("Parsing Gemini response:", text.substring(0, 100) + "...");
    let parsed: ExtractionResult;
    try {
      parsed = JSON.parse(text) as ExtractionResult;
    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr, "Raw Text:", text);
      throw new Error("Demon Logic Error: Failed to parse quantum signal (Invalid JSON).");
    }
    
    console.log("Extraction successful:", parsed.signals?.length || 0, "signals found.");
    return parsed;
  } catch (err: any) {
    console.error("Detailed Demon Extraction Error:", err);
    
    // Check for specific API errors
    if (err.status === 403 || err.message?.includes("403") || err.message?.includes("PERMISSION_DENIED")) {
      throw new Error("Access Denied: Please verify your GEMINI_API_KEY in the Secrets panel (Settings > Secrets).");
    }
    if (err.status === 429 || err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Quota Exceeded: The Demon is cooling down. Please try again in 60 seconds.");
    }
    if (err.message?.includes("API_KEY_INVALID")) {
      throw new Error("Invalid Key: The provided API key is rejected by the bridge.");
    }
    
    throw new Error(err.message || "Failed to sort entropy.");
  }
}
