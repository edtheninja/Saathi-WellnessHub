interface DeviceStatProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export default function DeviceStat({
  title,
  value,
  icon,
}: DeviceStatProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-background p-4 transition-all duration-200 hover:shadow-sm">

      <div className="mb-2 text-primary">
        {icon}
      </div>

      <p className="text-lg font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {title}
      </p>

    </div>
  );
}