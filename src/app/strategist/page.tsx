import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CircleAlert,
  MessageSquareQuote,
  Repeat2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { ConfidencePanel } from "@/components/dashboard/confidence-panel";
import { EvidenceLabel } from "@/components/dashboard/evidence-label";
import { Button } from "@/components/ui/button";
import {
  accountActivity,
  audienceMix,
  discussionSignals,
  observedSummary,
  posts,
  recommendations,
  repeatEngagerExamples,
  reportMeta,
} from "@/data/market-intelligence";

const number = new Intl.NumberFormat("en-US");

function SectionTitle({
  index,
  eyebrow,
  title,
  detail,
  layer,
}: {
  index: string;
  eyebrow: string;
  title: string;
  detail: string;
  layer: "observed" | "derived" | "seeded";
}) {
  return (
    <div className="mb-5 grid gap-3 border-t border-black/18 pt-4 lg:grid-cols-[70px_1fr_360px_auto] lg:items-start">
      <span className="font-mono text-[10px] text-black/38">{index}</span>
      <div>
        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-black/42">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-serif text-3xl leading-none tracking-[-0.035em]">
          {title}
        </h2>
      </div>
      <p className="text-xs leading-5 text-black/50">{detail}</p>
      <EvidenceLabel layer={layer} />
    </div>
  );
}

function ConfidenceDot({ level }: { level: "High" | "Medium" | "Low" }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold">
      <span
        className={
          level === "High"
            ? "size-2 rounded-full bg-[#2f655d]"
            : level === "Medium"
              ? "size-2 rounded-full bg-[#c1862f]"
              : "size-2 rounded-full bg-[#9d6d67]"
        }
      />
      {level}
    </span>
  );
}

export default function StrategistPage() {
  const adaptivePost = posts.find((post) => post.id === "post_7473017986715574274")!;
  const categoryPost = posts.find((post) => post.id === "post_7473410944619118592")!;

  return (
    <AppShell active="strategist" modeLabel="Working view · June market readout">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="grid gap-8 border-b border-black/18 pb-10 xl:grid-cols-[1fr_360px] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">
              <span>Strategist view</span>
              <span>{reportMeta.client}</span>
              <span>{reportMeta.period}</span>
            </div>
            <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
              What is the market telling us to do next?
            </h1>
          </div>
          <div>
            <p className="text-sm leading-6 text-black/56">
              A working brief for turning observed engagement into content decisions.
              Every interpretation stays separate from the source evidence.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Button
                render={<Link href="/client" />}
                className="h-9 rounded-none px-4 text-xs"
              >
                Open client readout <ArrowRight className="size-3.5" />
              </Button>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-black/36">
                {reportMeta.scope}
              </span>
            </div>
          </div>
        </header>

        <section className="py-12">
          <SectionTitle
            index="01"
            eyebrow="Current signals"
            title="What deserves attention now"
            detail="Each signal has a defined rule. Where the export cannot support a judgment, the product says so."
            layer="derived"
          />
          <div className="grid border border-black/14 bg-white lg:grid-cols-3">
            <article className="flex min-h-[330px] flex-col border-b border-black/12 p-6 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-black/42">
                  Gaining momentum
                </span>
                <ConfidenceDot level="Low" />
              </div>
              <CircleAlert className="mt-10 size-5 text-[#9d6d67]" />
              <h3 className="mt-4 font-serif text-3xl leading-none tracking-[-0.035em]">
                Not measurable from one snapshot.
              </h3>
              <p className="mt-4 text-sm leading-6 text-black/56">
                Momentum means engagement growth between two comparable snapshots.
                The export contains current totals only, so no post is labeled as
                accelerating or slowing.
              </p>
              <p className="mt-auto border-t border-black/10 pt-4 text-[10px] leading-5 text-black/44">
                Decision: collect another timestamp before changing distribution based
                on velocity.
              </p>
            </article>

            <article className="flex min-h-[330px] flex-col border-b border-black/12 p-6 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-black/42">
                  High discussion density
                </span>
                <ConfidenceDot level="High" />
              </div>
              <MessageSquareQuote className="mt-10 size-5 text-[#2f655d]" />
              <h3 className="mt-4 font-serif text-3xl leading-none tracking-[-0.035em]">
                Adaptive planning
              </h3>
              <p className="mt-4 text-sm leading-6 text-black/56">
                {adaptivePost.substantiveComments} of {adaptivePost.capturedComments}{" "}
                captured comments contained a question, example, objection, or point
                of view. No other post came close.
              </p>
              <a
                href={adaptivePost.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-auto flex items-center gap-1 border-t border-black/10 pt-4 text-[10px] font-semibold hover:underline"
              >
                Open source post <ArrowUpRight className="size-3" />
              </a>
            </article>

            <article className="flex min-h-[330px] flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-black/42">
                  Strong audience quality
                </span>
                <ConfidenceDot level="Medium" />
              </div>
              <ShieldCheck className="mt-10 size-5 text-[#b7781d]" />
              <h3 className="mt-4 font-serif text-3xl leading-none tracking-[-0.035em]">
                Category research reached decision-makers.
              </h3>
              <p className="mt-4 text-sm leading-6 text-black/56">
                The AI-agent security scan had only {categoryPost.capturedComments}{" "}
                captured comments, but they came from an SVP Marketing and a Head of
                Enterprise Business. One also exposed a data-quality problem.
              </p>
              <p className="mt-auto border-t border-black/10 pt-4 text-[10px] leading-5 text-black/44">
                Decision: repair the research method before using this format again.
              </p>
            </article>
          </div>
        </section>

        <section className="pb-12">
          <SectionTitle
            index="02"
            eyebrow="Content breakdown"
            title="Nine posts, five useful fields"
            detail="The classification is intentionally small: topic, core idea, hook, format, and audience."
            layer="derived"
          />
          <div className="overflow-x-auto border border-black/14 bg-white">
            <table className="w-full min-w-[1120px] border-collapse text-left">
              <thead>
                <tr className="border-b border-black/14 bg-[#e9e6dd] font-mono text-[9px] uppercase tracking-[0.13em] text-black/50">
                  <th className="w-[240px] px-4 py-3 font-medium">Post</th>
                  <th className="w-[160px] px-4 py-3 font-medium">Topic</th>
                  <th className="w-[260px] px-4 py-3 font-medium">Core idea</th>
                  <th className="w-[200px] px-4 py-3 font-medium">Hook</th>
                  <th className="w-[180px] px-4 py-3 font-medium">Format</th>
                  <th className="w-[190px] px-4 py-3 font-medium">Audience</th>
                  <th className="px-4 py-3 text-right font-medium">Observed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/8">
                {posts.map((post) => (
                  <tr key={post.id} className="align-top hover:bg-[#faf9f5]">
                    <td className="px-4 py-4">
                      <a
                        href={post.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-3 text-xs font-medium leading-5 hover:underline"
                      >
                        {post.excerpt}
                      </a>
                      <p className="mt-2 font-mono text-[9px] text-black/35">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                        }).format(new Date(post.date))}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs leading-5">{post.topic}</td>
                    <td className="px-4 py-4 text-xs leading-5 text-black/60">
                      {post.coreIdea}
                    </td>
                    <td className="px-4 py-4 text-xs leading-5 text-black/60">
                      {post.hook}
                    </td>
                    <td className="px-4 py-4 text-xs leading-5">{post.format}</td>
                    <td className="px-4 py-4 text-xs leading-5 text-black/60">
                      {post.audience}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-[10px] leading-5">
                      <div>{post.reactions} reactions</div>
                      <div>{post.publicComments} comments</div>
                      <div className="text-black/38">
                        {post.substantiveComments} substantive
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="pb-12">
          <SectionTitle
            index="03"
            eyebrow="Discussion signals"
            title="The useful information inside the comments"
            detail="These are not sentiment labels. They are constraints, questions, pain, language, and openings for the next piece."
            layer="derived"
          />
          <div className="grid border border-black/14 bg-white lg:grid-cols-2">
            {discussionSignals.map((item, index) => (
              <article
                key={item.kind}
                className={`p-6 ${
                  index < 4 ? "border-b border-black/10" : ""
                } ${index % 2 === 0 ? "lg:border-r" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#7b4b05]">
                    {item.kind}
                  </span>
                  <span className="font-mono text-[9px] text-black/32">0{index + 1}</span>
                </div>
                <p className="mt-8 font-serif text-2xl leading-[1.14] tracking-[-0.025em]">
                  {item.signal}
                </p>
                <p className="mt-4 text-[10px] text-black/42">{item.source}</p>
                <div className="mt-6 border-t border-black/10 pt-4">
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.13em] text-black/40">
                    Why this matters
                  </p>
                  <p className="mt-2 text-xs leading-5 text-black/58">{item.why}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="pb-12">
          <SectionTitle
            index="04"
            eyebrow="Audience signals"
            title="Who is repeatedly showing up"
            detail="Public headlines support a useful directional view. They do not replace enrichment or an agreed ICP."
            layer="derived"
          />
          <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="border border-[#c99b55] bg-[#fff8e9] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-[#7b4b05]" />
                  <h3 className="text-sm font-semibold">Role mix</h3>
                </div>
                <EvidenceLabel layer="derived" />
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
            </div>

            <div className="border border-[#c99b55] bg-white">
              <div className="flex items-center justify-between border-b border-black/10 p-5">
                <div className="flex items-center gap-2">
                  <Repeat2 className="size-4 text-[#7b4b05]" />
                  <div>
                    <h3 className="text-sm font-semibold">Repeat engagers</h3>
                    <p className="mt-0.5 text-[10px] text-black/42">
                      {observedSummary.repeatEngagers} people across 2+ posts ·{" "}
                      {observedSummary.repeatEngagersThreePlus} across 3+
                    </p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-black/8">
                {repeatEngagerExamples.map((person) => (
                  <div
                    key={person.name}
                    className="grid grid-cols-[1fr_auto] items-center gap-4 p-5"
                  >
                    <div>
                      <p className="text-sm font-semibold">{person.name}</p>
                      <p className="mt-1 text-[11px] text-black/46">{person.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-2xl">{person.posts}</p>
                      <p className="text-[9px] text-black/40">posts engaged</p>
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
            eyebrow="Account-level activity"
            title="Where engagement is accumulating"
            detail="Accounts are grouped only when a person explicitly names a company in their public headline."
            layer="derived"
          />
          <div className="border border-[#c99b55] bg-white">
            <div className="hidden grid-cols-[1fr_110px_110px_110px_1.3fr_90px] border-b border-black/12 bg-[#fff8e9] px-5 py-3 font-mono text-[9px] uppercase tracking-[0.13em] text-[#7b4b05]/70 md:grid">
              <span>Account</span>
              <span className="text-right">People</span>
              <span className="text-right">Posts</span>
              <span className="text-right">Touches</span>
              <span className="pl-8">Ideas attracting them</span>
              <span className="text-right">Confidence</span>
            </div>
            <div className="divide-y divide-black/8">
              {accountActivity.map((account) => (
                <div
                  key={account.account}
                  className="grid gap-4 p-5 md:grid-cols-[1fr_110px_110px_110px_1.3fr_90px] md:items-center"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center border border-black/12 bg-[#f2f0e9] font-serif text-sm">
                      {account.account.slice(0, 1)}
                    </span>
                    <p className="text-sm font-semibold">{account.account}</p>
                  </div>
                  <p className="font-mono text-xs md:text-right">{account.people}</p>
                  <p className="font-mono text-xs md:text-right">{account.posts}</p>
                  <p className="font-mono text-xs md:text-right">{account.touches}</p>
                  <p className="text-xs leading-5 text-black/55 md:pl-8">
                    {account.ideas}
                  </p>
                  <div className="md:text-right">
                    <ConfidenceDot level={account.confidence} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-12">
          <SectionTitle
            index="06"
            eyebrow="Recommendation board"
            title="What should change next"
            detail="Each recommendation starts with an observation and ends with a testable expectation."
            layer="derived"
          />
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <article
                key={recommendation.recommendation}
                className="border border-black/14 bg-white"
              >
                <div className="grid border-b border-black/10 bg-[#e9e6dd] px-5 py-3 md:grid-cols-[70px_1fr_auto] md:items-center">
                  <span className="font-mono text-[10px] text-black/42">0{index + 1}</span>
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-black/50">
                    Evidence-backed recommendation
                  </span>
                  <ConfidenceDot level={recommendation.confidence} />
                </div>
                <div className="grid lg:grid-cols-5">
                  {[
                    ["Observation", recommendation.observation],
                    ["Evidence", recommendation.evidence],
                    ["Recommendation", recommendation.recommendation],
                    ["Expected outcome", recommendation.expectedOutcome],
                    ["Confidence", `${recommendation.confidence}. The evidence is ${
                      recommendation.confidence === "High"
                        ? "direct and specific within this sample."
                        : "directional and should be validated by the next post."
                    }`],
                  ].map(([label, value], fieldIndex) => (
                    <div
                      key={label}
                      className={`min-h-[220px] p-5 ${
                        fieldIndex < 4
                          ? "border-b border-black/8 lg:border-b-0 lg:border-r"
                          : ""
                      } ${label === "Recommendation" ? "bg-[#caff54]/55" : ""}`}
                    >
                      <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-black/42">
                        {label}
                      </p>
                      <p
                        className={
                          label === "Recommendation"
                            ? "mt-7 font-serif text-xl leading-[1.18]"
                            : "mt-7 text-xs leading-5 text-black/62"
                        }
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="pb-8">
          <SectionTitle
            index="07"
            eyebrow="Uncertainty"
            title="Confidence is part of the product"
            detail="The source layer and confidence level should travel with the insight when it is shared."
            layer="derived"
          />
          <ConfidencePanel />
        </section>

        <footer className="grid gap-4 border-t border-black/16 py-5 text-[10px] text-black/42 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span>{number.format(observedSummary.publicReactions)} public reactions</span>
            <span>{number.format(observedSummary.publicComments)} public comments</span>
            <span>{number.format(observedSummary.uniqueEngagedPeople)} known engagers</span>
            <span>{number.format(observedSummary.substantiveComments)} substantive comments</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="size-3.5" />
            Account grouping uses self-reported headlines
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
