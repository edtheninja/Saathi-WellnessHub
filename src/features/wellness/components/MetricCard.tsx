interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
}

export default function MetricCard({
  title,
  value,
  unit,
  icon,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 transition-all duration-200 hover:shadow-sm">

      <div className="mb-4 text-primary">
        {icon}
      </div>

      <h3 className="text-2xl font-semibold">
        {value}
        {unit && (
          <span className="ml-1 text-sm text-muted-foreground">
            {unit}
          </span>
        )}
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        {title}
      </p>

    </div>
  );
}