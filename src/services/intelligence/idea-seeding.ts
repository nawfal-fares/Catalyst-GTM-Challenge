import type {
  CanonicalPost,
  Company,
  IdeaSeed,
  NormalizedComment,
  NormalizedReaction,
  Person,
} from "@/domain/types";

export function buildIdeaSeeds(
  posts: CanonicalPost[],
  people: Person[],
  companies: Company[],
  reactions: NormalizedReaction[],
  comments: NormalizedComment[],
): IdeaSeed[] {
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const personById = new Map(people.map((person) => [person.id, person]));
  const postById = new Map(posts.map((post) => [post.id, post]));
  const touches = [
    ...reactions.map((reaction) => ({ postId: reaction.postId, personId: reaction.personId })),
    ...comments.map((comment) => ({ postId: comment.postId, personId: comment.personId })),
  ];
  const groups = new Map<string, { people: Set<string>; touches: number; postId: string; companyId: string }>();

  for (const touch of touches) {
    const person = personById.get(touch.personId);
    const post = postById.get(touch.postId);
    if (!person?.companyId || !post || !companyById.has(person.companyId)) continue;
    const key = `${post.analysis.coreIdea}:${person.companyId}`;
    const group = groups.get(key) ?? {
      people: new Set<string>(),
      touches: 0,
      postId: post.id,
      companyId: person.companyId,
    };
    group.people.add(person.id);
    group.touches += 1;
    groups.set(key, group);
  }

  return [...groups.values()]
    .filter((group) => group.touches >= 2 || group.people.size >= 2)
    .map((group) => {
      const post = postById.get(group.postId)!;
      const strength: IdeaSeed["strength"] =
        group.people.size >= 3 || group.touches >= 5
          ? "saturated"
          : group.people.size >= 2
            ? "warming"
            : "emerging";
      return {
        id: `seed_${post.id}_${group.companyId}`,
        postId: post.id,
        idea: post.analysis.coreIdea,
        companyId: group.companyId,
        peopleCount: group.people.size,
        touchCount: group.touches,
        latestTouchAt: post.metrics.at(-1)?.capturedAt ?? post.publishedAt,
        strength,
      };
    })
    .sort((a, b) => b.peopleCount - a.peopleCount || b.touchCount - a.touchCount);
}
