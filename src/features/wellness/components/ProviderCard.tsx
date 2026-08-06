interface Props {
  title: string;
  subtitle: string;
  available: boolean;
  onConnect: () => void;
}

export default function ProviderCard({
  title,
  subtitle,
  available,
  onConnect,
}: Props) {
  return (
    <div className="rounded-3xl border bg-card p-6 transition hover:shadow-lg">

      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <p className="text-sm text-muted-foreground mt-2">
        {subtitle}
      </p>

      <button
        disabled={!available}
        onClick={onConnect}
        className="mt-6 w-full rounded-xl bg-primary text-primary-foreground py-2 disabled:opacity-50"
      >
        {available ? "Connect" : "Coming Soon"}
      </button>

    </div>
  );
}