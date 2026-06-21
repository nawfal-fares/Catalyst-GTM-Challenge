import { describe, expect, it } from "vitest";
import type { Company, Person } from "@/domain/types";
import { IcpScoringService } from "@/services/scoring/icp-engine";

const company: Company = {
  id: "c1",
  name: "SignalLayer",
  domain: "signallayer.io",
  sizeBand: "51–200",
  industry: "B2B SaaS",
  geography: "United States",
  stage: "Series B",
  targetAccount: true,
  sourceMode: "seeded",
};

describe("IcpScoringService", () => {
  it("scores a senior target-account marketer as tier A", () => {
    const person: Person = {
      id: "p1",
      linkedinId: "1",
      name: "Buyer",
      linkedinUrl: "https://linkedin.com/in/buyer",
      headline: "VP Marketing",
      role: "VP Marketing",
      seniority: "VP",
      department: "Marketing",
      companyId: company.id,
      sourceMode: "seeded",
    };
    const result = new IcpScoringService().score(person, company);
    expect(result.tier).toBe("A");
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.reasons).toContain("Named or lookalike target account");
  });

  it("returns missing data instead of inventing certainty", () => {
    const person: Person = {
      id: "p2",
      linkedinId: "2",
      name: "Unknown",
      linkedinUrl: "https://linkedin.com/in/unknown",
      headline: "--",
      role: null,
      seniority: null,
      department: null,
      companyId: null,
      sourceMode: "seeded",
    };
    const result = new IcpScoringService().score(person, null);
    expect(result.tier).toBe("Disqualified");
    expect(result.confidence).toBeLessThan(70);
    expect(result.missingData).toContain("company");
  });
});
