const moods = [
    "😊",
    "😌",
    "🤩",
    "😔",
    "😴",
    "😤",
];

interface Props {

    value: string;

    onChange: (mood: string) => void;

}

export default function MoodSelector({
    value,
    onChange
}: Props) {

    return (

        <div className="flex gap-3">

            {moods.map(mood => (

                <button
                    key={mood}
                    onClick={() => onChange(mood)}
                    className={`
                    w-12
                    h-12
                    rounded-full
                    text-2xl
                    transition-all
                    ${
                        value === mood
                            ? "bg-primary scale-110"
                            : "bg-secondary hover:scale-105"
                    }
                    `}
                >
                    {mood}
                </button>

            ))}

        </div>

    );

}