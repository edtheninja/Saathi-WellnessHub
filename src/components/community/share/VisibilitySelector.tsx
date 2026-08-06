interface Props {

    value: "community" | "private";

    onChange: (
        value: "community" | "private"
    ) => void;

}

export default function VisibilitySelector({

    value,

    onChange

}: Props) {

    return (

        <div className="flex gap-4">

            <button

                onClick={() => onChange("community")}

                className={`rounded-xl px-5 py-3 border ${
                    value==="community"
                        ? "bg-primary text-white"
                        : ""
                }`}

            >

                🌍 Community

            </button>

            <button

                onClick={() => onChange("private")}

                className={`rounded-xl px-5 py-3 border ${
                    value==="private"
                        ? "bg-primary text-white"
                        : ""
                }`}

            >

                🔒 Private

            </button>

        </div>

    );

}