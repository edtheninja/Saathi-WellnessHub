type Props = {
  title: string;
  value: string;
  icon: string;
};

export default function HighlightCard({ title, value, icon }: Props) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}