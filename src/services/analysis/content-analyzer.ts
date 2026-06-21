import type { ContentAnalysis } from "@/domain/types";
import { TAXONOMY_VERSION } from "@/domain/taxonomy";

export interface ContentAnalyzer {
  readonly name: string;
  analyze(content: string, mediaCount: number): Promise<ContentAnalysis>;
}

function includesAny(content: string, terms: string[]) {
  return terms.some((term) => content.includes(term));
}

function firstSentence(content: string) {
  return content.replace(/\s+/g, " ").trim().split(/[.!?]\s/)[0].slice(0, 150);
}

export class DeterministicContentAnalyzer implements ContentAnalyzer {
  readonly name = `deterministic:${TAXONOMY_VERSION}`;

  async analyze(content: string, mediaCount: number): Promise<ContentAnalysis> {
    const text = content.toLowerCase();
    const aeo = includesAny(text, ["aeo", "ai search", "llm", "cited"]);
    const systems = includesAny(text, ["system", "claude", "skills", "agent"]);
    const strategy = includesAny(text, ["calendar", "strategy", "feedback loop", "content problem"]);
    const event = includesAny(text, ["event", "in person", "hosted"]);
    const launch = includesAny(text, ["launch", "product"]);
    const giveaway = includesAny(text, ["comment \"", "free", "send you", "repo"]);
    const contrarian = includesAny(text, [" is dead", "most founders", "isn't a content problem"]);
    const dataLed = /\d+[%mk$]/i.test(content);
    const personal = /\bi (built|spent|wasted|think|had)\b/i.test(content);

    const topic = aeo
      ? "AEO & AI search"
      : systems
        ? "AI operations"
        : event
          ? "Community & events"
          : launch
            ? "Founder-led growth"
            : "Content strategy";

    const coreIdea = aeo
      ? "AI-search visibility is a new consideration channel that needs its own operating loop."
      : systems
        ? "AI-native content systems compress production time and make continuous learning practical."
        : strategy
          ? "Content strategy should run as a live signal-and-feedback loop, not a static calendar."
          : launch
            ? "A successful launch is earned by audience-building long before launch day."
            : event
              ? "In-person education compounds trust in fast-moving technical categories."
              : firstSentence(content);

    return {
      topic,
      subtopic: aeo
        ? "Category visibility"
        : systems
          ? "AI-enabled content operations"
          : event
            ? "IRL community"
            : launch
              ? "Launch distribution"
              : "Adaptive editorial systems",
      format: dataLed
        ? "Data drop"
        : giveaway
          ? "Build-in-public"
          : event
            ? "Event recap"
            : contrarian
              ? "Contrarian essay"
              : "Framework",
      mediaType: mediaCount > 1 ? "Photo carousel" : mediaCount === 1 ? "Single image" : "Text / link",
      visualStyle: mediaCount > 1 ? "Candid event photography" : mediaCount === 1 ? "Proof artifact" : "Text-led",
      hookType: dataLed
        ? "Proof-led"
        : contrarian
          ? "Contrarian claim"
          : personal
            ? "Personal admission"
            : "Problem reframe",
      narrativeStructure: giveaway
        ? "Promise → mechanism → component list → CTA"
        : contrarian
          ? "Conventional wisdom → reframe → evidence → new rule"
          : dataLed
            ? "News hook → benchmark → interpretation → question"
            : "Observation → lesson → implication",
      ctaType: giveaway
        ? "Comment-gated asset"
        : includesAny(text, ["newsletter", "full breakdown"])
          ? "Newsletter click"
          : includesAny(text, ["drop a category", "what do you"])
            ? "Conversation prompt"
            : "No hard CTA",
      targetAudience: aeo
        ? "B2B marketing leaders"
        : systems
          ? "Founder-led marketing teams"
          : event
            ? "AI and GTM operators"
            : "B2B founders and content leaders",
      funnelStage: giveaway ? "Consideration" : dataLed ? "Awareness" : "Consideration",
      emotionalDriver: giveaway
        ? "Leverage and urgency"
        : contrarian
          ? "Productive discomfort"
          : dataLed
            ? "Curiosity"
            : "Recognition",
      coreIdea,
      noveltyLevel: dataLed || contrarian ? "high" : systems ? "high" : "medium",
      sophisticationLevel: dataLed || aeo ? "advanced" : strategy ? "intermediate" : "foundational",
      provider: "deterministic",
    };
  }
}

export class OpenAIContentAnalyzer implements ContentAnalyzer {
  readonly name = `openai:${TAXONOMY_VERSION}`;

  constructor(private readonly apiKey: string) {}

  async analyze(content: string, mediaCount: number): Promise<ContentAnalysis> {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_ANALYSIS_MODEL ?? "gpt-5-mini",
        input: [
          {
            role: "system",
            content:
              "Classify this B2B LinkedIn post. Return only JSON matching the supplied keys. Be concise and evidence-grounded.",
          },
          {
            role: "user",
            content: JSON.stringify({ content, mediaCount, taxonomyVersion: TAXONOMY_VERSION }),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "content_analysis",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: [
                "topic", "subtopic", "format", "mediaType", "visualStyle", "hookType",
                "narrativeStructure", "ctaType", "targetAudience", "funnelStage",
                "emotionalDriver", "coreIdea", "noveltyLevel", "sophisticationLevel",
              ],
              properties: {
                topic: { type: "string" },
                subtopic: { type: "string" },
                format: { type: "string" },
                mediaType: { type: "string" },
                visualStyle: { type: "string" },
                hookType: { type: "string" },
                narrativeStructure: { type: "string" },
                ctaType: { type: "string" },
                targetAudience: { type: "string" },
                funnelStage: { type: "string" },
                emotionalDriver: { type: "string" },
                coreIdea: { type: "string" },
                noveltyLevel: { enum: ["low", "medium", "high"] },
                sophisticationLevel: { enum: ["foundational", "intermediate", "advanced"] },
              },
            },
          },
        },
      }),
    });

    if (!response.ok) throw new Error(`OpenAI analysis failed with ${response.status}.`);
    const payload = await response.json();
    const text = payload.output_text;
    return { ...JSON.parse(text), provider: "openai" } as ContentAnalysis;
  }
}

/**
 * Production uses OpenAI when configured. Demo builds are intentionally usable
 * without an API key and fall back to deterministic, inspectable rules.
 */
export function createContentAnalyzer(): ContentAnalyzer {
  return process.env.OPENAI_API_KEY
    ? new OpenAIContentAnalyzer(process.env.OPENAI_API_KEY)
    : new DeterministicContentAnalyzer();
}
