interface Props {
  mood: {
    status: string;
    emoji: string;
    color: string;
    message: string;
  };
}

export default function MoodCard({ mood }: Props) {

  return (

    <div className="rounded-3xl border border-border/40 bg-card p-6">

      <p className="text-sm text-muted-foreground">
        Today's Wellness
      </p>

      <div className="mt-4 flex items-center gap-4">

        <div className="text-5xl">
          {mood.emoji}
        </div>

        <div>

          <h2 className={`text-2xl font-bold ${mood.color}`}>
            {mood.status}
          </h2>

          <p className="mt-2 text-muted-foreground">
            {mood.message}
          </p>

        </div>

      </div>

    </div>

  );

}