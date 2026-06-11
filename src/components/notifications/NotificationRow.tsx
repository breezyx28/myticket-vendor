export function NotificationRow({
  title,
  body,
  createdAt,
}: {
  title: string;
  body: string;
  createdAt: string;
}) {
  return (
    <>
      <p className="font-bold text-ink">{title}</p>
      <p className="mt-1 text-[14px] leading-relaxed text-ink-60">{body}</p>
      <p className="mt-2 text-[11px] text-ink-40" dir="ltr">
        {new Date(createdAt).toLocaleString()}
      </p>
    </>
  );
}
