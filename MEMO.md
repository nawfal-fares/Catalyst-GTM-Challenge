# Product memo: Catalyst Market Intelligence

## Product position

This prototype is not a generic social dashboard. It is a decision-support
product for a content-led GTM team.

Catalyst’s public positioning is built around turning original executive insight
into pipeline. The company is explicit that impressions and follower growth are
not sufficient outcomes. The prototype therefore starts with a different
question: what did the market reveal through its response, and what should a
strategist do with that information?

The two routes serve different decisions:

- The client view answers whether the content is producing meaningful market
  engagement.
- The strategist view answers what deserves attention and what should happen
  next.

## Evidence and trust

The core product decision is to separate observed, derived, and seeded data.

Observed data comes directly from the supplied Apify export: posts, comments,
reactions, actor headlines, timestamps, and public engagement totals. Derived
data interprets that evidence: content classification, substantive-comment
rules, role mix, company grouping, discussion themes, and recommendations.
Seeded data appears only in the pipeline demonstration.

This separation prevents three common attribution errors:

1. treating modeled reach as an owned platform metric;
2. treating a job-title parser as verified enrichment;
3. treating account exposure as proof that content caused an opportunity.

Confidence is visible because uncertainty changes the decision. Observed
activity is high confidence. Content classification and account grouping are
medium confidence. Estimated reach and pipeline influence are low confidence.

## What the sample says

The strongest market-learning event was the post arguing that annual editorial
calendars are obsolete. All 23 captured comments contained a point, example,
question, or objection. The thread moved beyond agreement into operating
constraints: stakeholder alignment, reactive decision-making, and the problem
of learning before a company has a large audience.

The giveaway post produced a different signal. It reported 38 public comments;
of the 27 comments captured in the export, 20 were only the requested keyword.
That is evidence of demand for the asset and the distribution mechanic. It is
not evidence that buyers accepted the thesis or intended to buy.

The AI-agent security benchmark produced little volume but high-value feedback.
Its two captured commenters included an SVP Marketing and a Head of Enterprise
Business. One identified a wrong logo and company tag. The product treats that
as a research-quality problem to correct before repeating the format.

## Recommendation logic

Recommendations use a fixed structure:

`Observation → Evidence → Recommendation → Expected outcome → Confidence`

This makes the strategist’s inference inspectable. The recommendation board
does not rely on a composite score or fake precision. Each recommendation can be
accepted, challenged, or rewritten by examining the evidence beside it.

The next useful test is not “post more.” It is to publish the operating model
requested by the comments: how a weekly signal review works, how quarterly
alignment is preserved, and how the team distinguishes evidence from noise.

## Pipeline framing

The pipeline section is intentionally a demonstration. Observed people and
account activity are joined to seeded opportunities to show the product shape
that becomes possible with CRM data. It does not claim that the opportunities
exist or that content caused them.

A production implementation would need verified contact-to-account mappings,
opportunity creation dates, stage history, and content-touch timestamps. Even
then, the appropriate language is influence, not causation.

## Limitation that matters most

The export is a single recent snapshot. It can support discussion analysis and
identity-based audience patterns. It cannot support momentum claims because
there is no second comparable timestamp. The strategist view states this
directly instead of manufacturing a velocity score.
