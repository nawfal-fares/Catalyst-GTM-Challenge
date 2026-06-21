export const CONTENT_TAXONOMY = {
  topics: [
    "Content strategy",
    "AI operations",
    "AEO & AI search",
    "Founder-led growth",
    "Community & events",
  ],
  formats: ["Framework", "Build-in-public", "Data drop", "Event recap", "Contrarian essay"],
  hookTypes: ["Contrarian claim", "Proof-led", "Newsjacking", "Personal admission", "Problem reframe"],
  funnelStages: ["Awareness", "Consideration", "Decision"],
} as const;

/**
 * Catalyst can replace this default vocabulary with its internal content framework.
 * Analysis records store the resulting labels, while analysis_runs stores the
 * taxonomy and provider versions used at that point in time.
 */
export const TAXONOMY_VERSION = "catalyst-demo-2026-06";
