Catalyst GTM Engineer: Technical Build Challenge

This is the build challenge for the **GTM Engineer** role at Catalyst. Catalyst runs content-led go-to-market: we produce content for clients, track what works, prove it drives pipeline, and keep getting sharper. This challenge is a small, real version of the system behind that.

It has two parts: a build you do on your own, then a live walkthrough where we go through it together. We care about how you architect and build, not about how polished it looks.

## How this works

1. **The build.** You build and deploy the system below and send it over.
2. **The walkthrough (60 to 75 minutes).** You walk us through it, we push on your choices, and we make a change together with you driving your AI tools.

## What to build

A **live content analytics tracker** that, on its own and on a schedule, pulls content performance from real platforms, learns what is working, suggests what to make next, and proves the ROI back to a client. It runs itself: new data flows in, the insights sharpen, and the dashboard stays current.

Concretely, it should:

1. **Pull from real platforms.** Pull content and its performance from at least one platform you can actually access: YouTube, X, a blog or RSS feed, Reddit, a LinkedIn export, whatever. Posts plus their metrics (views, engagement, clicks). Pull on a schedule so you track metrics over time, and handle the real-world mess: pagination, rate limits, missing data, duplicates.
2. **Store it in a database you design.** Posts, their metadata (topic, format, hook, angle), metrics over time, and a downstream-outcome layer. History matters. You are tracking change, not a single snapshot.
3. **Analyze what is working.** Surface the patterns: top hooks, formats, and topics, best timing, and trends over time.
4. **Suggest what to make next, and self-improve.** Based on what is performing, recommend new content ideas (topics, formats, angles) with reasoning. As new performance data arrives, the recommendations update and get sharper. This learning loop is the heart of it.
5. **Prove ROI to the client.** Tie content performance to a downstream business outcome and build the view that shows a client the through-line from content to results. If you do not have real conversion data, define a clear proxy (for example: profile views to site clicks to demo requests) and instrument it.
6. **Keep itself updated.** A scheduled job (a cron or a worker) re-pulls, re-analyzes, and refreshes the recommendations with no manual trigger. This self-sustaining part is required, not optional.
7. **Surface it in a deployed dashboard.** Performance analytics, the content recommendations, and the client-facing ROI view, all reflecting the latest data.

Deploy it live. We will open it, watch it update, and dig into your database and your code.

### How you build it matters

We read the repo, not just the live demo. We want to see engineering you would be comfortable handing to a team:

- A repo that is structured and readable: a clear layout, sensible modules, a real commit history, and a README that lets us run it.
- Config and secrets handled properly, with no keys committed to the code.
- A database built to scale: a schema that holds up as the data grows, the right indexes, real migrations, and a clear answer for what you would do at 50 million rows.
- Tests where they earn their keep.

### Use the right tool for each job

Use off-the-shelf tools where they earn their place, and your own code where they don't. We are especially interested in where you would write code instead of paying a tool per row, and why.

### The memo (1 to 2 pages)

- Your architecture and data model. Show the schema, your indexes, and how it scales as rows grow.
- Your platforms, and why you picked them.
- How your analysis and your idea recommendations work, and how the loop gets sharper over time.
- How you frame ROI, and why a client would trust it.
- Rough cost at scale, and where it breaks first.

## Send us

1. The live dashboard link.
2. Your repo, including any AI setup you used (your `CLAUDE.md`, prompts, skills). We want to see how you drive your AI tools.
3. The memo.

## The walkthrough

This is the part that counts most. Expect to:

- Walk us through the whole system end to end.
- Defend your choices: your repo structure, your schema and indexing, your platforms, your analysis, how the recommendations improve, how you prove ROI, what changes at scale, where it breaks, and what you verified.
- Make a change live, driving your AI tools while we watch. For example, add a platform, a new signal to the analysis, or a new rule to the recommendations.

## What we are looking for

- **Real engineering:** reliable platform pulls, a clean time-series data model, and a genuinely self-sustaining scheduled system, not a one-shot script.
- **Engineering craft:** a well-structured, well-managed repo and a database built to scale, not one big file and a flat table.
- **Content and GTM judgment:** insights and ideas that actually make sense, and an ROI story a client would buy.
- **A real learning loop:** the system gets sharper as data flows in, it does not just display numbers.
- **Smart build-versus-buy calls,** and **fluent use of AI** with the judgment to catch it when it is wrong.
- **Clear thinking,** explained simply.

## What we are not grading

- How pretty the UI looks. We care about the code and the schema underneath, not the visuals.
- Whether every feature is finished. A smaller system that genuinely runs and learns beats a big one held together with tape.

## Using AI

Use it for everything. Claude Code, Cursor, whatever you reach for. We build with AI every day and want to see how you do it. The walkthrough is where you show the work is genuinely yours.