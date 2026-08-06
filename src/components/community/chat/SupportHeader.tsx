interface Props {
  emoji: string;
  title: string;
}

export default function SupportHeader({
  emoji,
  title,
}: Props) {
  return (
    <div
      className="
        mb-3

        flex
        items-center
        gap-3

        rounded-2xl

        bg-emerald-50
        dark:bg-emerald-500/10

        border
        border-emerald-200/60

        px-4
        py-3
      "
    >
      <span className="text-2xl">
        {emoji}
      </span>

      <div>

        <p
          className="
            text-xs
            uppercase
            tracking-wide

            text-emerald-600
          "
        >
          Support
        </p>

        <p className="font-semibold">
          {title}
        </p>

      </div>
    </div>
  );
}