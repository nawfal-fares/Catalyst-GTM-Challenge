import type { Company, IcpScore, Person } from "@/domain/types";

export interface IcpModelConfig {
  version: string;
  roleWeight: number;
  seniorityWeight: number;
  departmentWeight: number;
  companyWeight: number;
  targetAccountWeight: number;
  triggerWeight: number;
}

export const DEFAULT_ICP_MODEL: IcpModelConfig = {
  version: "will-catalyst-icp-v1",
  roleWeight: 12,
  seniorityWeight: 20,
  departmentWeight: 18,
  companyWeight: 20,
  targetAccountWeight: 22,
  triggerWeight: 8,
};

export class IcpScoringService {
  constructor(private readonly model = DEFAULT_ICP_MODEL) {}

  score(person: Person, company: Company | null): IcpScore {
    const reasons: string[] = [];
    const missingData: string[] = [];
    let score = 0;

    if (person.role) {
      if (/\b(founder|ceo|chief|vp|head|director|marketing|growth|revenue)\b/i.test(person.role)) {
        score += this.model.roleWeight;
        reasons.push("Role is close to the buying committee");
      }
    } else missingData.push("role");

    if (["Executive", "VP", "Director"].includes(person.seniority ?? "")) {
      score += this.model.seniorityWeight;
      reasons.push(`${person.seniority} seniority`);
    } else if (!person.seniority) missingData.push("seniority");

    if (["Marketing", "Revenue"].includes(person.department ?? "")) {
      score += this.model.departmentWeight;
      reasons.push(`${person.department} function`);
    } else if (!person.department) missingData.push("department");

    if (company) {
      if (["11–50", "51–200", "201–500", "501–1,000"].includes(company.sizeBand)) {
        score += this.model.companyWeight * 0.55;
        reasons.push(`Company size ${company.sizeBand}`);
      }
      if (["Series A", "Series B", "Series C"].includes(company.stage)) {
        score += this.model.companyWeight * 0.45;
        reasons.push(`${company.stage} growth stage`);
      }
      if (company.targetAccount) {
        score += this.model.targetAccountWeight;
        reasons.push("Named or lookalike target account");
      }
      if (["AI software", "Cybersecurity", "Fintech", "B2B SaaS", "AI infrastructure"].includes(company.industry)) {
        score += this.model.triggerWeight;
        reasons.push("Content-led category with active market education need");
      }
    } else {
      missingData.push("company", "company size", "industry", "geography", "company stage");
    }

    const bounded = Math.min(100, Math.round(score));
    const confidence = Math.max(45, Math.round(100 - missingData.length * 8));
    return {
      personId: person.id,
      companyId: company?.id ?? null,
      score: bounded,
      confidence,
      tier: bounded >= 75 ? "A" : bounded >= 55 ? "B" : bounded >= 30 ? "C" : "Disqualified",
      reasons,
      missingData,
      modelVersion: this.model.version,
    };
  }
}

/**
 * Production calibration:
 * - backtest account scores against historical closed-won and no-decision deals;
 * - optimize weights/thresholds for precision and recall by segment;
 * - monitor drift each quarter and preserve model versions;
 * - allow strategist overrides, with those overrides becoming training labels.
 */
