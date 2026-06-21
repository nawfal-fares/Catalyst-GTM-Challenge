import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CircleDollarSign,
  Clock3,
  Eye,
  Flame,
  Lightbulb,
  MessageSquareText,
  MousePointer2,
  Network,
  Radar,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { RankedBars } from "@/components/dashboard/ranked-bars";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { StatusPill } from "@/components/dashboard/status-pill";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardDataset } from "@/data/repository";
import {
  aggregatePerformance,
  formatCompact,
  formatCurrency,
  getDailySeries,
  getDashboardSummary,
} from "@/lib/dashboard";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default async function StrategistPage() {
  const data = await getDashboardDataset();
  const summary = getDashboardSummary(data);
  const topicPerformance = aggregatePerformance(data, "topic");
  const formatPerformance = aggregatePerformance(data, "format");
  const hookPerformance = aggregatePerformance(data, "hookType");
  const series = getDailySeries(data);
  const takingOff = data.posts.filter((post) => post.status === "taking-off");
  const slowing = data.posts.filter((post) => post.status === "slowing");
  const personById = new Map(data.people.map((person) => [person.id, person]));
  const companyById = new Map(data.companies.map((company) => [company.id, company]));
  const opportunityById = new Map(data.opportunities.map((opportunity) => [opportunity.id, opportunity]));
  const postById = new Map(data.posts.map((post) => [post.id, post]));

  const companyEngagement = data.companies
    .map((company) => {
      const people = data.people.filter((person) => person.companyId === company.id);
      const personIds = new Set(people.map((person) => person.id));
      const touches =
        data.reactions.filter((reaction) => personIds.has(reaction.personId)).length +
        data.comments.filter((comment) => personIds.has(comment.personId)).length;
      const maxScore = Math.max(
        0,
        ...data.icpScores.filter((score) => score.companyId === company.id).map((score) => score.score),
      );
      return { company, people: people.length, touches, maxScore };
    })
    .filter((item) => item.touches > 0)
    .sort((a, b) => b.maxScore - a.maxScore || b.touches - a.touches)
    .slice(0, 7);

  return (
    <AppShell active="strategist" modeLabel="Demo · modeled">
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full bg-white">
                <span className="mr-1.5 size-1.5 rounded-full bg-lime-500" />
                Will Leatherman · LinkedIn
              </Badge>
              <span className="text-xs text-muted-foreground">Updated Jun 21, 2026 · 9 canonical posts</span>
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
              Know what is landing.
              <span className="text-black/30"> Know who it is landing with.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Public engagement identity meets modeled owned analytics, ICP fit, account influence, and a recommendation loop.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full bg-white">Last 14 days</Button>
            <Button render={<Link href="/client" />} className="rounded-full">
              Open client view <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>

        <section className="mb-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Total impressions" value={formatCompact(summary.totalImpressions)} detail="Modeled from public signals" delta={18} icon={Eye} dark />
          <MetricCard label="Unique reach" value={formatCompact(summary.totalReach)} detail="61–78% of impressions" delta={14} icon={Radar} />
          <MetricCard label="ICP engagement" value={`${summary.qualifiedShare}%`} detail={`${summary.qualifiedPeople} qualified people`} delta={9} icon={Target} />
          <MetricCard label="Target accounts" value={String(summary.targetAccounts)} detail="Engaged this period" delta={25} icon={Building2} />
          <MetricCard label="Influenced pipeline" value={formatCurrency(summary.influencedPipeline)} detail={`${summary.influencedOpportunities} modeled opportunities`} delta={12} icon={CircleDollarSign} />
        </section>

        <section className="mb-12 grid gap-4 xl:grid-cols-[1.6fr_0.8fr]">
          <Card className="border-black/10 bg-white shadow-none">
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">Impression curve</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Final seeded snapshot by publish date</p>
              </div>
              <Badge variant="outline" className="rounded-full">Zernio-shaped · seeded</Badge>
            </CardHeader>
            <CardContent>
              <PerformanceChart data={series} />
            </CardContent>
          </Card>
          <Card className="border-black bg-black text-white shadow-none">
            <CardContent className="flex h-full flex-col p-6">
              <div className="flex items-center justify-between">
                <Badge className="rounded-full bg-lime-300 text-black">Signal</Badge>
                <Sparkles className="size-4 text-lime-300" />
              </div>
              <div className="mt-12">
                <p className="text-sm text-white/55">What changed</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                  The audience is rewarding operating systems, not tool lists.
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/60">
                  “Editorial calendar is dead” drew the strongest mix of substantive comments and qualified engagement. The giveaway produced volume; the operating-system point of view produced buyer language.
                </p>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
                <div className="rounded-xl border border-white/10 p-3">
                  <div className="text-2xl font-semibold">23</div>
                  <div className="text-[11px] text-white/50">deep comments</div>
                </div>
                <div className="rounded-xl border border-white/10 p-3">
                  <div className="text-2xl font-semibold">3</div>
                  <div className="text-[11px] text-white/50">buyer objections</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <SectionHeading
            eyebrow="Velocity"
            title="Catch the posts while they are moving"
            detail="Snapshot deltas separate early momentum from late-stage tail so the team knows where to respond, redistribute, or move on."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-lime-300 bg-lime-100/50 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm"><Flame className="size-4" /> Taking off</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {takingOff.map((post) => (
                  <a key={post.id} href={post.linkedinUrl} target="_blank" rel="noreferrer" className="block rounded-xl border border-black/10 bg-white p-4 transition-transform hover:-translate-y-0.5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <StatusPill status={post.status} />
                      <span className="text-[10px] text-muted-foreground">{post.velocityLabel}</span>
                    </div>
                    <p className="line-clamp-2 text-sm font-medium leading-5">{post.excerpt}</p>
                    <div className="mt-4 flex gap-4 text-[11px] text-muted-foreground">
                      <span>{formatCompact(post.metrics.at(-1)!.impressions)} impressions</span>
                      <span>{post.publicComments} comments</span>
                      <span>{post.metrics.at(-1)!.engagementRate}% ER</span>
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>
            <Card className="border-black/10 bg-white shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm"><Clock3 className="size-4" /> Slowing down</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {slowing.map((post) => (
                  <div key={post.id} className="rounded-xl border border-black/8 bg-[#fafaf7] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <StatusPill status={post.status} />
                      <span className="text-[10px] text-muted-foreground">{post.velocityLabel}</span>
                    </div>
                    <p className="line-clamp-1 text-sm font-medium">{post.excerpt}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {post.metrics.at(-1)!.engagementRate < 1.75 ? "Below portfolio engagement baseline" : "Mature post with limited comment depth"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <SectionHeading
            eyebrow="Content ledger"
            title="Every post, from reach to account signal"
            detail="Observed LinkedIn engagement is paired with seeded impressions and enrichment. Source mode stays visible."
          />
          <Card className="overflow-hidden border-black/10 bg-white shadow-none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[38%]">Post</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Engagement</TableHead>
                  <TableHead>Content DNA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.posts.map((post) => {
                  const metric = post.metrics.at(-1)!;
                  return (
                    <TableRow key={post.id}>
                      <TableCell>
                        <a href={post.linkedinUrl} target="_blank" rel="noreferrer" className="group">
                          <p className="line-clamp-2 max-w-lg text-sm font-medium leading-5 group-hover:underline">{post.excerpt}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric" }).format(new Date(post.publishedAt))}
                          </p>
                        </a>
                      </TableCell>
                      <TableCell><StatusPill status={post.status} /></TableCell>
                      <TableCell className="text-right font-mono text-xs">{formatCompact(metric.impressions)}</TableCell>
                      <TableCell className="text-right">
                        <div className="font-mono text-xs">{metric.engagementRate}%</div>
                        <div className="text-[10px] text-muted-foreground">{post.publicComments} comments</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="font-normal">{post.analysis.topic}</Badge>
                          <Badge variant="outline" className="font-normal">{post.analysis.hookType}</Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </section>

        <section className="mb-12">
          <SectionHeading
            eyebrow="Content DNA"
            title="The patterns behind performance"
            detail="Performance is rolled up by canonical analysis labels, not inferred from the dashboard presentation."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-black/10 bg-white shadow-none">
              <CardHeader><CardTitle className="text-sm">Top hooks</CardTitle></CardHeader>
              <CardContent><RankedBars items={hookPerformance} /></CardContent>
            </Card>
            <Card className="border-black/10 bg-white shadow-none">
              <CardHeader><CardTitle className="text-sm">Top topics</CardTitle></CardHeader>
              <CardContent><RankedBars items={topicPerformance} /></CardContent>
            </Card>
            <Card className="border-black/10 bg-white shadow-none">
              <CardHeader><CardTitle className="text-sm">Top formats</CardTitle></CardHeader>
              <CardContent><RankedBars items={formatPerformance} /></CardContent>
            </Card>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              { icon: Clock3, label: "Best publish window", value: "Tue–Wed · 10am–2pm ET", detail: "4 of the top 5 posts shipped in this window" },
              { icon: MessageSquareText, label: "Comment quality", value: "Questions beat applause", detail: "First-hand experience and objections are the best reply surface" },
              { icon: MousePointer2, label: "Best CTA", value: "Open question", detail: "Category prompts preserve quality better than generic engagement asks" },
            ].map((insight) => (
              <Card key={insight.label} className="border-black/10 bg-white shadow-none">
                <CardContent className="p-5">
                  <insight.icon className="mb-8 size-5" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{insight.label}</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight">{insight.value}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{insight.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12 grid gap-4 xl:grid-cols-[1fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="Audience intelligence"
              title="Qualified people, not anonymous likes"
              detail="Apollo-shaped enrichment and an explainable ICP model turn public engagement into an account view."
            />
            <Card className="border-black/10 bg-white shadow-none">
              <CardContent className="p-0">
                <div className="grid grid-cols-3 border-b border-black/8">
                  <div className="p-5"><div className="text-2xl font-semibold">{summary.engagedPeople}</div><div className="text-[11px] text-muted-foreground">known engagers</div></div>
                  <div className="border-x border-black/8 p-5"><div className="text-2xl font-semibold">{summary.qualifiedPeople}</div><div className="text-[11px] text-muted-foreground">ICP B or better</div></div>
                  <div className="p-5"><div className="text-2xl font-semibold">{summary.targetAccounts}</div><div className="text-[11px] text-muted-foreground">target accounts</div></div>
                </div>
                <div className="divide-y divide-black/8">
                  {companyEngagement.map(({ company, people, touches, maxScore }) => (
                    <div key={company.id} className="grid grid-cols-[1fr_auto] items-center gap-4 p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-9"><AvatarFallback className="bg-black text-xs text-white">{initials(company.name)}</AvatarFallback></Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium">{company.name}</p>
                            {company.targetAccount && <Badge className="rounded-full bg-lime-200 text-[9px] text-lime-950">Target</Badge>}
                          </div>
                          <p className="truncate text-[11px] text-muted-foreground">{company.industry} · {company.sizeBand}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 text-right">
                        <div><div className="text-sm font-semibold">{touches}</div><div className="text-[10px] text-muted-foreground">touches</div></div>
                        <div><div className="text-sm font-semibold">{people}</div><div className="text-[10px] text-muted-foreground">people</div></div>
                        <div className="w-16"><Progress value={maxScore} className="h-1.5" /><div className="mt-1 text-[9px] text-muted-foreground">ICP {maxScore}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <SectionHeading
              eyebrow="Idea seeding"
              title="Watch an idea move through an account"
              detail="Repeated engagement with the same canonical idea is influence intelligence—not proof of attribution."
            />
            <Card className="border-black bg-black text-white shadow-none">
              <CardContent className="p-6">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-semibold tracking-[-0.05em]">{summary.seededAccounts}</div>
                    <div className="mt-1 text-xs text-white/50">accounts with repeated idea exposure</div>
                  </div>
                  <Network className="size-8 text-lime-300" />
                </div>
                <div className="space-y-3">
                  {data.ideaSeeds.slice(0, 6).map((seed) => {
                    const company = companyById.get(seed.companyId);
                    return (
                      <div key={seed.id} className="rounded-xl border border-white/10 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium">{company?.name}</p>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/50">{seed.idea}</p>
                          </div>
                          <Badge className={seed.strength === "saturated" ? "bg-lime-300 text-black" : "bg-white/10 text-white"}>
                            {seed.strength}
                          </Badge>
                        </div>
                        <div className="mt-3 flex gap-4 text-[10px] text-white/45">
                          <span>{seed.peopleCount} stakeholders</span>
                          <span>{seed.touchCount} touches</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <SectionHeading
            eyebrow="Conversation queue"
            title="Comments worth responding to"
            detail="Prioritized by comment substance and ICP fit—not follower count."
          />
          <div className="grid gap-3 lg:grid-cols-2">
            {data.commentOpportunities.map((comment) => (
              <Card key={comment.commentId} className="border-black/10 bg-white shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-9"><AvatarFallback>{initials(comment.personName)}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{comment.personName}</p>
                        <Badge variant="outline" className="rounded-full text-[9px]">ICP {comment.icpScore}</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{comment.headline}</p>
                    </div>
                  </div>
                  <blockquote className="mt-4 line-clamp-3 border-l-2 border-lime-400 pl-3 text-sm leading-6 text-black/75">
                    {comment.text}
                  </blockquote>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-[10px] font-medium text-lime-800">{comment.reason}</p>
                    <Button
                      render={<a href={postById.get(comment.postId)?.linkedinUrl} target="_blank" rel="noreferrer" />}
                      variant="ghost"
                      size="sm"
                    >
                      Open thread <ArrowRight className="size-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <SectionHeading
            eyebrow="ROI"
            title="Content → stakeholder → account → opportunity"
            detail="Seeded CRM records demonstrate the production attribution path. Every link is labeled by model and confidence."
          />
          <div className="grid gap-4 xl:grid-cols-[0.65fr_1.35fr]">
            <Card className="border-black bg-black text-white shadow-none">
              <CardContent className="p-6">
                <CircleDollarSign className="size-6 text-lime-300" />
                <div className="mt-16 text-5xl font-semibold tracking-[-0.055em]">{formatCurrency(summary.influencedPipeline)}</div>
                <p className="mt-2 text-sm text-white/55">modeled influenced pipeline</p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/8 p-4"><div className="text-xl font-semibold">{summary.influencedOpportunities}</div><div className="text-[10px] text-white/45">opportunities</div></div>
                  <div className="rounded-xl bg-white/8 p-4"><div className="text-xl font-semibold">{data.attribution.filter((item) => item.model === "direct").length}</div><div className="text-[10px] text-white/45">direct matches</div></div>
                </div>
                <p className="mt-6 text-[10px] leading-5 text-white/40">Demo assumption: opportunities and CRM contact timing are seeded. No claim is made that these are live Catalyst opportunities.</p>
              </CardContent>
            </Card>
            <Card className="border-black/10 bg-white shadow-none">
              <CardContent className="divide-y divide-black/8 p-0">
                {data.attribution.map((link) => {
                  const opportunity = opportunityById.get(link.opportunityId);
                  const person = personById.get(link.personId);
                  const post = postById.get(link.postId);
                  return (
                    <div key={link.id} className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">{opportunity?.name}</p>
                          <Badge
                            className={
                              link.model === "direct"
                                ? "bg-lime-200 text-lime-950"
                                : link.model === "influenced"
                                  ? "bg-sky-100 text-sky-800"
                                  : "bg-stone-100 text-stone-700"
                            }
                          >
                            {link.model}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {person?.name} engaged with “{post?.analysis.coreIdea.slice(0, 72)}…”
                        </p>
                        <p className="mt-2 text-[10px] text-muted-foreground">{link.explanation}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <div className="text-sm font-semibold">{formatCurrency(opportunity?.amount ?? 0)}</div>
                        <div className="text-[10px] text-muted-foreground">{link.confidence}% confidence</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Next moves"
            title="Recommendations with a receipt"
            detail="Each idea ties back to observed performance, ICP-weighted engagement, account influence, and strategic gaps."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {data.recommendations.map((recommendation, index) => (
              <Card key={recommendation.id} className={index === 0 ? "border-lime-300 bg-lime-100/55 shadow-none" : "border-black/10 bg-white shadow-none"}>
                <CardContent className="flex h-full flex-col p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">Recommendation 0{index + 1}</span>
                    <span className="font-mono text-[10px]">{recommendation.confidence}% confidence</span>
                  </div>
                  <Lightbulb className="mt-10 size-6" />
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.035em]">{recommendation.contentIdea}</h3>
                  <p className="mt-4 rounded-lg border border-black/10 bg-white/60 p-3 text-sm font-medium leading-5">“{recommendation.hook}”</p>
                  <dl className="mt-5 space-y-3 text-xs">
                    <div><dt className="text-muted-foreground">Format</dt><dd className="mt-0.5 font-medium">{recommendation.format}</dd></div>
                    <div><dt className="text-muted-foreground">Angle</dt><dd className="mt-0.5 leading-5">{recommendation.angle}</dd></div>
                  </dl>
                  <div className="mt-5 border-t border-black/10 pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Evidence</p>
                    <ul className="mt-2 space-y-2 text-xs leading-5 text-black/65">
                      {recommendation.evidence.map((evidence) => <li key={evidence} className="flex gap-2"><span>↳</span>{evidence}</li>)}
                    </ul>
                  </div>
                  <div className="mt-auto pt-6">
                    <div className="flex items-center gap-2 text-xs font-semibold"><TrendingUp className="size-3.5" /> {recommendation.expectedImpact}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <footer className="mt-16 flex flex-col justify-between gap-4 border-t border-black/10 py-6 text-[10px] text-muted-foreground sm:flex-row">
          <span>Observed: Apify public engagement · Seeded: Zernio, Apollo, CRM · Deterministic analysis fallback</span>
          <span>{data.ingestion.rawRecords} raw records · {data.ingestion.duplicateRecordsMerged} duplicates merged · idempotent import</span>
        </footer>
      </div>
    </AppShell>
  );
}
