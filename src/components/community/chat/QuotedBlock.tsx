interface Props {
  sender: string;
  text: string;
}

export default function QuotedBlock({
  sender,
  text,
}: Props) {
  return (
    <div
      className="
        mb-3

        rounded-2xl

        border-l-4
        border-sky-400

        bg-slate-100/80
        dark:bg-white/5

        px-4
        py-3
      "
    >
      <p
        className="
          text-xs
          font-semibold
          text-sky-600
        "
      >
        {sender}
      </p>

      <p
        className="
          mt-1
          text-sm
          text-muted-foreground
          line-clamp-2
        "
      >
        {text}
      </p>
    </div>
  );
}