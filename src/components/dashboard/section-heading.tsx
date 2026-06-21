export function SectionHeading({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow?: string;
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-lime-700">{eyebrow}</p>}
        <h2 className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl">{title}</h2>
        {detail && <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{detail}</p>}
      </div>
      {action}
    </div>
  );
}
