import type { AttributionLink, CanonicalPost, Company, IcpScore, Opportunity, Person } from "@/domain/types";
import { seededNumber, slugify, stableHash } from "@/lib/deterministic";

export interface CrmConnector {
  readonly provider: "HubSpot" | "Salesforce";
  listOpportunities(companies: Company[]): Promise<Opportunity[]>;
}

export class SeededCrmConnector implements CrmConnector {
  readonly provider: "HubSpot" | "Salesforce";

  constructor(provider: "HubSpot" | "Salesforce" = "HubSpot") {
    this.provider = provider;
  }

  async listOpportunities(companies: Company[]): Promise<Opportunity[]> {
    return companies
      .filter((company) => company.targetAccount)
      .sort((a, b) => stableHash(a.id) - stableHash(b.id))
      .slice(0, 6)
      .map((company, index) => {
        const amount = Math.round(seededNumber(`${company.id}:amount`, 48_000, 240_000) / 5_000) * 5_000;
        return {
          id: `opp_${slugify(company.name)}`,
          companyId: company.id,
          name: `${company.name} — content-led growth program`,
          stage: ["Discovery", "Solution fit", "Proposal", "Contracting"][index % 4],
          amount,
          closeDate: new Date(Date.UTC(2026, 6 + (index % 3), 15 + index)).toISOString(),
          crm: this.provider,
          sourceMode: "seeded",
        };
      });
  }
}

export class HubSpotConnector implements CrmConnector {
  readonly provider = "HubSpot" as const;
  async listOpportunities(_companies: Company[]): Promise<Opportunity[]> {
    void _companies;
    throw new Error("HubSpot OAuth adapter is production-shaped but disabled in demo mode.");
  }
}

export class SalesforceConnector implements CrmConnector {
  readonly provider = "Salesforce" as const;
  async listOpportunities(_companies: Company[]): Promise<Opportunity[]> {
    void _companies;
    throw new Error("Salesforce OAuth adapter is production-shaped but disabled in demo mode.");
  }
}

export function buildAttribution(
  opportunities: Opportunity[],
  posts: CanonicalPost[],
  people: Person[],
  icpScores: IcpScore[],
  engagementPostIdsByPerson: Map<string, Set<string>>,
): AttributionLink[] {
  const peopleByCompany = new Map<string, Person[]>();
  for (const person of people) {
    if (!person.companyId) continue;
    peopleByCompany.set(person.companyId, [...(peopleByCompany.get(person.companyId) ?? []), person]);
  }
  const scoreByPerson = new Map(icpScores.map((score) => [score.personId, score]));

  return opportunities.flatMap((opportunity, opportunityIndex) => {
    const candidates = (peopleByCompany.get(opportunity.companyId) ?? [])
      .filter((person) => engagementPostIdsByPerson.has(person.id))
      .sort((a, b) => (scoreByPerson.get(b.id)?.score ?? 0) - (scoreByPerson.get(a.id)?.score ?? 0));
    const primary = candidates[0];
    if (!primary) return [];
    const touchedPosts = [...(engagementPostIdsByPerson.get(primary.id) ?? [])];
    const selectedPosts = touchedPosts
      .map((id) => posts.find((post) => post.id === id))
      .filter((post): post is CanonicalPost => Boolean(post))
      .sort((a, b) => b.publicComments - a.publicComments)
      .slice(0, 2);

    return selectedPosts.map((post, index) => {
      const model: AttributionLink["model"] =
        opportunityIndex === 0 && index === 0 ? "direct" : index === 0 ? "influenced" : "estimated";
      return {
        id: `attr_${opportunity.id}_${post.id}_${primary.id}`,
        opportunityId: opportunity.id,
        postId: post.id,
        personId: primary.id,
        model,
        confidence: model === "direct" ? 88 : model === "influenced" ? 72 : 54,
        explanation:
          model === "direct"
            ? "Seeded CRM contact matched an engager before opportunity creation."
            : model === "influenced"
              ? "Account stakeholder engaged during the open opportunity window."
              : "Account-level exposure inferred from repeated stakeholder engagement.",
        sourceMode: model === "estimated" ? "estimated" : "seeded",
      };
    });
  });
}
