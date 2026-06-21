import type { Company, Person } from "@/domain/types";
import { seededNumber, slugify, stableHash } from "@/lib/deterministic";

export interface ApolloInput {
  linkedinId: string;
  linkedinUrl: string;
  name: string;
  headline: string;
}

export interface ApolloResult {
  person: Omit<Person, "sourceMode">;
  company: Company | null;
}

export interface ApolloResolver {
  resolve(input: ApolloInput): Promise<ApolloResult>;
}

const KNOWN_COMPANIES = [
  { match: "noma", name: "Noma Security", domain: "noma.security", industry: "Cybersecurity", stage: "Series B" },
  { match: "vellum", name: "Vellum", domain: "vellum.ai", industry: "AI infrastructure", stage: "Series B" },
  { match: "omada", name: "Omada AI", domain: "omada.ai", industry: "AI software", stage: "Seed" },
  { match: "arcadia", name: "Arcadia", domain: "arcadia.io", industry: "Healthtech", stage: "Series C" },
  { match: "floc", name: "FLOC", domain: "floc.co", industry: "Marketing services", stage: "Bootstrapped" },
  { match: "majestiq", name: "MajestIQ", domain: "majestiq.ai", industry: "E-commerce software", stage: "Seed" },
  { match: "atten labs", name: "Atten Labs", domain: "attenlabs.com", industry: "AI software", stage: "Seed" },
  { match: "systems limited", name: "Systems Limited", domain: "systemsltd.com", industry: "IT services", stage: "Public" },
] as const;

const SYNTHETIC_COMPANIES = [
  ["Northstar AI", "northstar.ai", "AI software", "Series B"],
  ["LedgerWorks", "ledgerworks.com", "Fintech", "Series A"],
  ["SignalLayer", "signallayer.io", "Marketing technology", "Series C"],
  ["Forge Security", "forge.security", "Cybersecurity", "Series B"],
  ["Orbit Systems", "orbitsystems.ai", "B2B SaaS", "Series A"],
] as const;

function parseSeniority(headline: string): string | null {
  const value = headline.toLowerCase();
  if (/\b(founder|co-founder|ceo|chief|owner|president)\b/.test(value)) return "Executive";
  if (/\b(vp|vice president|svp|evp)\b/.test(value)) return "VP";
  if (/\b(head|director)\b/.test(value)) return "Director";
  if (/\b(manager|lead)\b/.test(value)) return "Manager";
  if (/\b(student|intern)\b/.test(value)) return "Entry";
  return null;
}

function parseDepartment(headline: string): string | null {
  const value = headline.toLowerCase();
  if (/\b(marketing|content|brand|growth|seo|aeo|communications)\b/.test(value)) return "Marketing";
  if (/\b(sales|revenue|gtm|commercial|business development)\b/.test(value)) return "Revenue";
  if (/\b(engineer|developer|technical|data|security|cyber)\b/.test(value)) return "Engineering";
  if (/\b(product)\b/.test(value)) return "Product";
  if (/\b(recruit|talent|people|hr)\b/.test(value)) return "People";
  return null;
}

function parseRole(headline: string): string | null {
  const segment = headline.split(/[|@•]/)[0]?.trim();
  return segment && segment !== "--" ? segment.slice(0, 100) : null;
}

export class SeededApolloResolver implements ApolloResolver {
  async resolve(input: ApolloInput): Promise<ApolloResult> {
    const normalized = input.headline.toLowerCase();
    const known = KNOWN_COMPANIES.find((company) => normalized.includes(company.match));
    const shouldHaveCompany = known || stableHash(input.linkedinId) % 100 < 78;
    const synthetic = SYNTHETIC_COMPANIES[stableHash(input.linkedinId) % SYNTHETIC_COMPANIES.length];
    const companyData = known ?? (shouldHaveCompany ? {
      name: synthetic[0],
      domain: synthetic[1],
      industry: synthetic[2],
      stage: synthetic[3],
    } : null);
    const companyId = companyData ? `company_${slugify(companyData.name)}` : null;
    const seniority = parseSeniority(input.headline);
    const department = parseDepartment(input.headline);

    const company: Company | null = companyData
      ? {
          id: companyId!,
          name: companyData.name,
          domain: companyData.domain,
          sizeBand: ["11–50", "51–200", "201–500", "501–1,000"][
            stableHash(`${companyId}:size`) % 4
          ],
          industry: companyData.industry,
          geography: ["United States", "United Kingdom", "Canada", "Europe"][
            stableHash(`${companyId}:geo`) % 4
          ],
          stage: companyData.stage,
          targetAccount:
            ["B2B SaaS", "AI software", "Cybersecurity", "Fintech", "AI infrastructure"].includes(
              companyData.industry,
            ) && seededNumber(`${companyId}:target`, 0, 1) > 0.32,
          sourceMode: "seeded",
        }
      : null;

    return {
      person: {
        id: `person_${input.linkedinId}`,
        linkedinId: input.linkedinId,
        name: input.name,
        linkedinUrl: input.linkedinUrl,
        headline: input.headline,
        role: parseRole(input.headline),
        seniority,
        department,
        companyId,
      },
      company,
    };
  }
}

/**
 * Production adapter boundary: call Apollo People Match using LinkedIn URL,
 * then resolve the returned organization. Cache results and store provider
 * payload/version separately; null is a valid result and must not block ingest.
 */
export class ApolloApiResolver implements ApolloResolver {
  constructor(private readonly apiKey: string) {}

  async resolve(_input: ApolloInput): Promise<ApolloResult> {
    void this.apiKey;
    void _input;
    throw new Error("Apollo live adapter is production-shaped but disabled in this demo.");
  }
}

export function createApolloResolver(): ApolloResolver {
  return process.env.APOLLO_API_KEY
    ? new ApolloApiResolver(process.env.APOLLO_API_KEY)
    : new SeededApolloResolver();
}
