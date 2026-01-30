type Props = {
  title: string;
  subtitle: string;
  emoji: string;
};

export default function JourneyCard({ title, subtitle, emoji }: Props) {
  return (
    <div className="min-w-[260px] p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
      <p className="text-3xl">{emoji}</p>
      <h3 className="text-lg font-bold mt-2">{title}</h3>
      <p className="text-sm opacity-90">{subtitle}</p>
    </div>
  );
}