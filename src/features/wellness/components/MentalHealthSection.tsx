interface Props {
  journalEntries: number;
  meditationMinutes: number;
}

export default function MentalHealthSection({
  journalEntries,
  meditationMinutes,
}: Props) {
  return (
    <div className="rounded-3xl border bg-card p-6">

      <h2 className="text-xl font-semibold mb-6">
        Mental Wellness
      </h2>

      <div className="space-y-5">

        <div className="flex justify-between">
          <span>Journal Entries</span>
          <span>{journalEntries}</span>
        </div>

        <div className="flex justify-between">
          <span>Meditation</span>
          <span>{meditationMinutes} min</span>
        </div>

      </div>

    </div>
  );
}