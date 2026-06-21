import type {
  CommentOpportunity,
  Company,
  IcpScore,
  NormalizedComment,
  Person,
} from "@/domain/types";

function scoreComment(text: string, likes: number): number {
  let score = Math.min(25, text.length / 8) + Math.min(15, likes * 4);
  if (/\?/.test(text)) score += 16;
  if (/\b(we|our team|tested|piloted|quarter|pipeline|revenue|board|cfo)\b/i.test(text)) score += 24;
  if (/\b(disagree|push|but|though|what do you do|figuring out)\b/i.test(text)) score += 14;
  return Math.min(100, Math.round(score));
}

export function enrichComments(
  comments: Array<Omit<NormalizedComment, "qualityScore" | "responsePriority">>,
): NormalizedComment[] {
  return comments.map((comment) => {
    const qualityScore = scoreComment(comment.text, comment.likes);
    return {
      ...comment,
      qualityScore,
      responsePriority: qualityScore >= 66 ? "high" : qualityScore >= 42 ? "medium" : "low",
    };
  });
}

export function buildCommentOpportunities(
  comments: NormalizedComment[],
  people: Person[],
  companies: Company[],
  icpScores: IcpScore[],
): CommentOpportunity[] {
  const personById = new Map(people.map((person) => [person.id, person]));
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const scoreByPerson = new Map(icpScores.map((score) => [score.personId, score.score]));

  return comments
    .map((comment) => {
      const person = personById.get(comment.personId);
      if (!person) return null;
      const icpScore = scoreByPerson.get(person.id) ?? 0;
      const company = person.companyId ? companyById.get(person.companyId) : null;
      const combined = comment.qualityScore * 0.58 + icpScore * 0.42;
      return {
        commentId: comment.id,
        postId: comment.postId,
        personId: person.id,
        personName: person.name,
        headline: person.headline,
        companyName: company?.name ?? null,
        text: comment.text,
        qualityScore: comment.qualityScore,
        icpScore,
        reason:
          icpScore >= 70
            ? "High-fit buyer adding substantive signal"
            : /\?/.test(comment.text)
              ? "Specific question creates a natural reply path"
              : "Detailed first-hand experience can deepen the thread",
        combined,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.combined - a.combined)
    .slice(0, 6)
    .map((item) => ({
      commentId: item.commentId,
      postId: item.postId,
      personId: item.personId,
      personName: item.personName,
      headline: item.headline,
      companyName: item.companyName,
      text: item.text,
      qualityScore: item.qualityScore,
      icpScore: item.icpScore,
      reason: item.reason,
    }));
}
