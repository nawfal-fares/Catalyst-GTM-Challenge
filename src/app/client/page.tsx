import {
  ArrowUpRight,
  Building2,
  MessageSquareText,
  Repeat2,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { ConfidencePanel } from "@/components/dashboard/confidence-panel";
import { EvidenceLabel } from "@/components/dashboard/evidence-label";
import {
  accountActivity,
  audienceMix,
  clientFindings,
  ideaClusters,
  observedSummary,
  reportMeta,
  seededPipeline,
  whatWeLearned,
} from "@/data/market-intelligence";

const number = new Intl.NumberFormat("en-US");
const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 0,
});

function SectionTitle({
  index,
  title,
  question,
  layer,
}: {
  index: string;
  title: string;
  question: string;
  layer: "observed" | "derived" | "seeded";
}) {
  return (
    <div className="mb-5 grid gap-3 border-t border-black/18 pt-4 md:grid-cols-[70px_1fr_auto] md:items-start">
      <span className="font-mono text-[10px] text-black/38">{index}</span>
      <div>
        <h2 className="font-serif text-3xl leading-none tracking-[-0.035em]">{title}</h2>
        <p className="mt-2 text-sm text-black/50">{question}</p>
      </div>
      <EvidenceLabel layer={layer} />
    </div>
  );
}

export default function ClientPage() {
  const seededTotal = seededPipeline.reduce((sum, item) => sum + item.value, 0);

  return (
    <AppShell active="client" modeLabel="Client readout · evidence labeled">
      <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="grid gap-8 border-b border-black/18 pb-10 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">
              <span>Client readout</span>
              <span>{reportMeta.client}</span>
              <span>{reportMeta.period}</span>
            </div>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
              Is the content creating meaningful market engagement?
            </h1>
          </div>
          <div className="border-l border-black/15 pl-5">
            <p className="text-sm leading-6 text-black/58">
              A decision-oriented readout of what people responded to, who was present,
              and what the data cannot establish yet.
            </p>
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.15em] text-black/38">
              Prepared {reportMeta.prepared} · {reportMeta.scope}
            </p>
          </div>
        </header>

        <section className="py-12">
          <SectionTitle
            index="01"
            title="Executive summary"
            question="Three findings that change how this period should be read."
            layer="observed"
          />
          <div className="grid border border-black/14 bg-white lg:grid-cols-3">
            {clientFindings.map((finding, index) => (
              <article
                key={finding.title}
                className="flex min-h-[300px] flex-col border-b border-black/12 p-6 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-black/35">0{index + 1}</span>
                  <EvidenceLabel layer={finding.layer} />
                </div>
                <h3 className="mt-10 font-serif text-[28px] leading-[1.02] tracking-[-0.035em]">
                  {finding.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-black/58">{finding.body}</p>
                <p className="mt-auto border-t border-black/10 pt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.1em]">
                  {finding.evidence}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="pb-12">
          <SectionTitle
            index="02"
            title="Market engagement"
            question="The observed activity, then the interpretation built on top of it."
            layer="observed"
          />
          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="border border-black/14 bg-[#182320] p-6 text-white">
              <div className="flex items-center justify-between">
                <EvidenceLabel layer="observed" className="border-white/30" />
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  LinkedIn export
                </span>
              </div>
              <div className="mt-12 grid grid-cols-2 gap-px bg-white/12 sm:grid-cols-4">
                {[
                  ["Canonical entries", observedSummary.posts],
                  ["Public reactions", observedSummary.publicReactions],
                  ["Public comments", observedSummary.publicComments],
                  ["Known engagers", observedSummary.uniqueEngagedPeople],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#182320] px-4 py-5">
                    <div className="font-serif text-4xl tracking-[-0.04em]">
                      {number.format(Number(value))}
                    </div>
                    <div className="mt-2 text-[11px] text-white/48">{label}</div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[11px] leading-5 text-white/45">
                Identity capture is slightly lower than the public totals:{" "}
                {observedSummary.capturedReactionIdentities} named reactions and{" "}
                {observedSummary.capturedComments} comment records were available for
                person-level analysis.
              </p>
            </div>

            <div className="border border-[#c99b55] bg-[#fff8e9] p-6">
              <div className="flex items-center justify-between">
                <EvidenceLabel layer="derived" />
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#7b4b05]/55">
                  Directional
                </span>
              </div>
              <p className="mt-12 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#7b4b05]/62">
                Estimated audience reach
              </p>
              <div className="mt-2 font-serif text-5xl tracking-[-0.05em] text-[#35250e]">
                23k–47k
              </div>
              <p className="mt-4 text-xs leading-5 text-[#5f461f]/70">
                A working range based on {number.format(
                  observedSummary.publicReactions +
                    observedSummary.publicComments +
                    observedSummary.publicReposts,
                )}{" "}
                public interactions and a 1.5–3% response assumption. Owned
                impressions were not supplied, so this should not be used as a
                performance target.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-12">
          <SectionTitle
            index="03"
            title="Ideas generating discussion"
            question="What people were responding to—not which post looked largest."
            layer="derived"
          />
          <div className="divide-y divide-black/12 border border-black/14 bg-white">
            {ideaClusters.map((cluster, index) => (
              <article
                key={cluster.idea}
                className="grid gap-5 p-6 md:grid-cols-[58px_1fr_150px] md:items-start"
              >
                <span className="font-serif text-3xl text-black/28">0{index + 1}</span>
                <div>
                  <h3 className="font-serif text-2xl leading-none tracking-[-0.025em]">
                    {cluster.idea}
                  </h3>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-black/58">
                    {cluster.description}
                  </p>
                  <p className="mt-4 border-l-2 border-[#b7781d] pl-3 text-xs italic leading-5 text-black/54">
                    {cluster.comment}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                  <div>
                    <div className="font-serif text-2xl">{cluster.posts}</div>
                    <div className="text-[10px] text-black/42">related posts</div>
                  </div>
                  <div>
                    <div className="font-serif text-2xl">{cluster.comments}</div>
                    <div className="text-[10px] text-black/42">public comments</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="pb-12">
          <SectionTitle
            index="04"
            title="Audience quality"
            question="A modeled view of seniority, role, repeat engagement, and named accounts."
            layer="derived"
          />
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="border border-[#c99b55] bg-[#fff8e9] p-6">
              <div className="flex items-center gap-3">
                <Users className="size-4 text-[#7b4b05]" />
                <h3 className="text-sm font-semibold">Role mix</h3>
              </div>
              <div className="mt-7 space-y-4">
                {audienceMix.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1.5 flex items-center justify-between text-[11px]">
                      <span>{item.label}</span>
                      <span className="font-mono">
                        {item.count} · {item.value}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#e9d6b6]">
                      <div
                        className="h-full bg-[#8a5a11]"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[10px] leading-5 text-[#5f461f]/65">
                Roles are inferred from self-reported LinkedIn headlines. Ambiguous
                profiles stay in “Other / unclear.”
              </p>
            </div>

            <div className="border border-[#c99b55] bg-white">
              <div className="flex items-center justify-between border-b border-black/10 p-5">
                <div className="flex items-center gap-3">
                  <Building2 className="size-4 text-[#7b4b05]" />
                  <div>
                    <h3 className="text-sm font-semibold">Account examples</h3>
                    <p className="mt-0.5 text-[10px] text-black/42">
                      Company names parsed from public headlines
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-black/48">
                  <Repeat2 className="size-3.5" />
                  {observedSummary.repeatEngagers} people engaged with 2+ posts
                </div>
              </div>
              <div className="divide-y divide-black/8">
                {accountActivity.slice(0, 4).map((account) => (
                  <div
                    key={account.account}
                    className="grid gap-3 p-5 sm:grid-cols-[1fr_190px] sm:items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold">{account.account}</p>
                      <p className="mt-1 text-[11px] leading-5 text-black/48">
                        {account.ideas}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-right">
                      <div>
                        <div className="font-serif text-xl">{account.people}</div>
                        <div className="text-[9px] text-black/40">people</div>
                      </div>
                      <div>
                        <div className="font-serif text-xl">{account.posts}</div>
                        <div className="text-[9px] text-black/40">posts</div>
                      </div>
                      <div>
                        <div className="font-serif text-xl">{account.touches}</div>
                        <div className="text-[9px] text-black/40">touches</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-12">
          <SectionTitle
            index="05"
            title="Pipeline influence"
            question="A demonstration of the join a CRM would make possible."
            layer="seeded"
          />
          <div className="border border-[#7766a9] bg-[#f5f1ff]">
            <div className="grid gap-6 border-b border-[#7766a9]/25 p-6 lg:grid-cols-[280px_1fr]">
              <div>
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#55447f]/65">
                  Seeded open pipeline
                </p>
                <p className="mt-2 font-serif text-5xl tracking-[-0.05em] text-[#30264b]">
                  {compactCurrency.format(seededTotal)}
                </p>
                <p className="mt-2 text-xs text-[#55447f]/65">
                  Three demonstration opportunities
                </p>
              </div>
              <div className="border-l border-[#7766a9]/25 pl-6">
                <p className="text-sm font-semibold text-[#30264b]">
                  This section demonstrates how content influence could be connected
                  to pipeline when CRM data exists.
                </p>
                <p className="mt-2 text-xs leading-5 text-[#55447f]/70">
                  The engagement and named people come from the supplied export. The
                  opportunities, values, stages, and timing are seeded. The connection
                  is an influence hypothesis, never a claim that content caused a deal.
                </p>
              </div>
            </div>
            <div className="divide-y divide-[#7766a9]/20">
              {seededPipeline.map((item) => (
                <div
                  key={item.account}
                  className="grid gap-4 p-6 md:grid-cols-[180px_1fr_120px] md:items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#30264b]">{item.account}</p>
                    <p className="mt-1 text-[10px] text-[#55447f]/62">
                      {item.observedSignal}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#30264b]">{item.opportunity}</p>
                    <p className="mt-1 text-[11px] leading-5 text-[#55447f]/65">
                      {item.influence}
                    </p>
                  </div>
                  <div className="md:text-right">
                    <p className="font-serif text-2xl text-[#30264b]">
                      {compactCurrency.format(item.value)}
                    </p>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-[#55447f]/55">
                      {item.stage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-12">
          <SectionTitle
            index="06"
            title="What we learned"
            question="Interpretation for the client—not a tactical publishing plan."
            layer="derived"
          />
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div className="border border-black/14 bg-[#caff54] p-7">
              <MessageSquareText className="size-5" />
              <div className="mt-14 space-y-6">
                {whatWeLearned.map((item, index) => (
                  <div key={item} className="grid grid-cols-[28px_1fr] gap-3">
                    <span className="font-mono text-[10px] text-black/45">0{index + 1}</span>
                    <p className="font-serif text-2xl leading-[1.12] tracking-[-0.025em]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <ConfidencePanel compact />
          </div>
        </section>

        <footer className="flex flex-col justify-between gap-3 border-t border-black/16 py-5 text-[10px] text-black/42 sm:flex-row">
          <span>
            Observed: supplied Apify export · Derived: classification and role/account
            modeling · Seeded: CRM demonstration
          </span>
          <a
            href="/strategist"
            className="inline-flex items-center gap-1 font-semibold text-black hover:underline"
          >
            Open the strategist evidence view <ArrowUpRight className="size-3" />
          </a>
        </footer>
      </div>
    </AppShell>
  );
}
