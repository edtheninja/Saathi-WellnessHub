import ReactionChip from "./ReactionChip";

interface Reaction {
  emoji: string;
  label: string;
  count: number;
}

interface Props {
  reactions: Reaction[];
  onSelect?: (reaction: Reaction) => void;
}

export default function ReactionSummary({
  reactions,
  onSelect,
}: Props) {
  if (!reactions.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {reactions.map((reaction) => (
        <ReactionChip
          key={reaction.label}
          {...reaction}
          onClick={() => onSelect?.(reaction)}
        />
      ))}
    </div>
  );
}