import {
    HeartPulse,
    Footprints,
    Moon,
    BookOpen,
    Brain,
    Target,
    Smartphone,
    RefreshCcw,
} from "lucide-react";

interface Props {
    type:
    | "heart"
    | "steps"
    | "sleep"
    | "journal"
    | "meditation"
    | "goal"
    | "device"
    | "sync";
}

export default function ActivityIcon({ type }: Props) {
    switch (type) {
        case "heart":
            return <HeartPulse size={18} className="text-red-500" />;

        case "steps":
            return <Footprints size={18} className="text-blue-500" />;

        case "sleep":
            return <Moon size={18} className="text-indigo-500" />;

        case "journal":
            return <BookOpen size={18} className="text-amber-500" />;

        case "meditation":
            return <Brain size={18} className="text-violet-500" />;
        case "device":
            return <Smartphone size={18} className="text-sky-500" />;

        case "sync":
            return <RefreshCcw size={18} className="text-emerald-500" />;
        default:
            return <Target size={18} className="text-green-500" />;
    }
}