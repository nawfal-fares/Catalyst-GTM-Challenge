import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  Eye,
  FileCheck2,
  MessageCircleMore,
  Network,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardDataset } from "@/data/repository";
import {
  formatCompact,
  formatCurrency,
  getDailySeries,
  getDashboardSummary,
} from "@/lib/dashboard";

export default async function ClientPage() {
  const data = await getDashboardDataset();
  const summary = getDashboardSummary(data);
  const series = getDailySeries(data);
  const topPosts = [...data.posts]
    .sort((a, b) => b.metrics.at(-1)!.impressions - a.metrics.at(-1)!.impressions)
    .slice(0, 3);

  return (
    <AppShell active="client" modeLabel="Demo · modeled">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="relative overflow-hidden rounded-[2rem] bg-black px-6 py-8 text-white sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <div className="absolute -right-20 -top-24 size-80 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <Badge className="rounded-full bg-lime-300 text-black">June content brief</Badge>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
                Your point of view is reaching the right rooms.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/60">
                Will’s strongest content is doing more than creating attention. It is starting substantive conversations with senior operators and repeatedly exposing target accounts to Catalyst’s signal-loop thesis.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-4xl font-semibold tracking-[-0.05em]">{formatCompact(summary.totalReach)}</div>
                <div className="mt-1 text-xs text-white/45">modeled reach</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-4xl font-semibold tracking-[-0.05em]">{formatCurrency(summary.influencedPipeline)}</div>
                <div className="mt-1 text-xs text-white/45">modeled influence</div>
              </div>
            </div>
          </div>
        </section>

        <section className="my-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: FileCheck2, label: "Content shipped", value: data.posts.length.toString(), detail: "canonical posts" },
            { icon: Eye, label: "Impressions", value: formatCompact(summary.totalImpressions), detail: "modeled owned analytics" },
            { icon: Target, label: "ICP engagement", value: `${summary.qualifiedShare}%`, detail: `${summary.qualifiedPeople} qualified people` },
            { icon: Users, label: "Target accounts", value: summary.targetAccounts.toString(), detail: "engaged this period" },
          ].map((metric) => (
            <Card key={metric.label} className="border-black/10 bg-white shadow-none">
              <CardContent className="p-5">
                <metric.icon className="size-4 text-muted-foreground" />
                <div className="mt-8 text-3xl font-semibold tracking-[-0.04em]">{metric.value}</div>
                <div className="mt-1 text-xs font-medium">{metric.label}</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">{metric.detail}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mb-12 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="border-black/10 bg-white shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Content performance</CardTitle>
              <p className="text-xs text-muted-foreground">Impressions by publish date</p>
            </CardHeader>
            <CardContent><PerformanceChart data={series} /></CardContent>
          </Card>
          <Card className="border-lime-300 bg-lime-100/60 shadow-none">
            <CardContent className="flex h-full flex-col p-6">
              <Sparkles className="size-5" />
              <p className="mt-12 text-xs font-semibold uppercase tracking-[0.16em]">Executive readout</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">Point of view beat promotion.</h2>
              <p className="mt-4 text-sm leading-6 text-black/60">
                The adaptive-content thesis drew senior, experience-rich comments. Free assets generated volume, but the clearest buyer signal came from a strong operating belief people could debate and apply.
              </p>
              <div className="mt-auto pt-8">
                <div className="flex items-center gap-2 text-xs font-semibold"><MessageCircleMore className="size-4" /> 23 comments on the leading thesis</div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <SectionHeading eyebrow="Top content" title="What earned attention" />
          <div className="grid gap-4 lg:grid-cols-3">
            {topPosts.map((post, index) => (
              <a key={post.id} href={post.linkedinUrl} target="_blank" rel="noreferrer" className="group">
                <Card className="h-full border-black/10 bg-white shadow-none transition-transform group-hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">0{index + 1}</span>
                      <Badge variant="outline">{post.analysis.format}</Badge>
                    </div>
                    <p className="mt-10 line-clamp-4 text-xl font-semibold leading-7 tracking-[-0.025em]">{post.excerpt}</p>
                    <div className="mt-8 grid grid-cols-3 gap-3 border-t border-black/8 pt-4">
                      <div><div className="text-sm font-semibold">{formatCompact(post.metrics.at(-1)!.impressions)}</div><div className="text-[9px] text-muted-foreground">impressions</div></div>
                      <div><div className="text-sm font-semibold">{post.publicComments}</div><div className="text-[9px] text-muted-foreground">comments</div></div>
                      <div><div className="text-sm font-semibold">{post.metrics.at(-1)!.engagementRate}%</div><div className="text-[9px] text-muted-foreground">engagement</div></div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </section>

        <section className="mb-12 grid gap-4 lg:grid-cols-2">
          <Card className="border-black bg-black text-white shadow-none">
            <CardContent className="p-7">
              <div className="flex items-center justify-between">
                <Network className="size-5 text-lime-300" />
                <Badge className="bg-white/10 text-white">{summary.seededAccounts} accounts</Badge>
              </div>
              <h2 className="mt-16 text-4xl font-semibold tracking-[-0.05em]">The idea is traveling.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/55">
                Multiple people inside the same accounts are engaging with the idea that content should operate as a live learning loop. That is an account warming signal, not a claim that content caused a deal.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {data.ideaSeeds.slice(0, 3).map((seed) => (
                  <div key={seed.id} className="rounded-xl border border-white/10 p-3">
                    <div className="text-lg font-semibold">{seed.peopleCount}</div>
                    <div className="text-[9px] leading-4 text-white/45">stakeholders at {data.companies.find((company) => company.id === seed.companyId)?.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-black/10 bg-white shadow-none">
            <CardContent className="p-7">
              <div className="flex items-center justify-between">
                <CircleDollarSign className="size-5" />
                <Badge variant="outline">Modeled · not live CRM</Badge>
              </div>
              <h2 className="mt-16 text-4xl font-semibold tracking-[-0.05em]">{formatCurrency(summary.influencedPipeline)}</h2>
              <p className="mt-2 text-sm font-medium">across {summary.influencedOpportunities} influenced opportunities</p>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">
                The demo joins observed engagers to seeded people, companies, and opportunities. A production CRM connector would use real contact and opportunity timestamps to preserve the same explainable chain.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                <Badge className="bg-lime-200 text-lime-950">Direct</Badge>
                <Badge className="bg-sky-100 text-sky-800">Influenced</Badge>
                <Badge className="bg-stone-100 text-stone-700">Estimated</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12 rounded-[2rem] border border-black/10 bg-white p-6 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-lime-700">Strategic direction</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Turn the thesis into a series.</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Keep the core belief, increase the proof density, and answer the objections the right buyers are already handing us.
              </p>
            </div>
            <div className="space-y-3">
              {data.recommendations.map((recommendation, index) => (
                <div key={recommendation.id} className="grid gap-4 rounded-2xl bg-[#f6f6f1] p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                  <span className="grid size-9 place-items-center rounded-full bg-black text-xs font-semibold text-white">0{index + 1}</span>
                  <div>
                    <p className="text-sm font-semibold">{recommendation.contentIdea}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">“{recommendation.hook}”</p>
                  </div>
                  <span className="text-[10px] font-semibold">{recommendation.confidence}% confidence</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-4 flex flex-col justify-between gap-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold">How to read these numbers</p>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-amber-900/65">{data.client.attributionDisclaimer}</p>
          </div>
          <Button render={<Link href="/strategist" />} variant="outline" className="shrink-0 rounded-full bg-white">
            See the evidence <ArrowRight className="size-4" />
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
