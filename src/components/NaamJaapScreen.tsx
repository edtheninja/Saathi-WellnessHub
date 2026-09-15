// src/screens/NaamJaapScreen.tsx

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, Sunrise, RotateCw, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import cycleBell from "@/assets/sounds/cycle-complete.mp3";

/* ------------------------------------------------------------------ */
/*  Decorative doodles — lotus / leaves / soft petals                  */
/*  Pure SVG, colored via currentColor so they inherit Tailwind text-* */
/* ------------------------------------------------------------------ */

function LotusDoodle({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 200 200" className={className} fill="none">
            <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                {/* center petals */}
                <path d="M100 60 C 92 90, 92 120, 100 150 C 108 120, 108 90, 100 60 Z" />
                <path d="M100 60 C 78 88, 66 118, 66 148 C 88 132, 100 100, 100 60 Z" />
                <path d="M100 60 C 122 88, 134 118, 134 148 C 112 132, 100 100, 100 60 Z" />
                <path d="M100 65 C 62 78, 40 100, 32 128 C 66 128, 92 108, 100 65 Z" />
                <path d="M100 65 C 138 78, 160 100, 168 128 C 134 128, 108 108, 100 65 Z" />
                {/* base line */}
                <path d="M30 150 C 60 168, 140 168, 170 150" />
            </g>
        </svg>
    );
}

function LeafDoodle({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 120 120" className={className} fill="none">
            <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M20 100 C 20 55, 55 20, 100 18 C 92 60, 60 92, 20 100 Z" />
                <path d="M28 92 C 50 72, 68 52, 88 28" />
            </g>
        </svg>
    );
}

function PetalFlowerDoodle({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
            <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <ellipse cx="50" cy="28" rx="10" ry="16" />
                <ellipse cx="50" cy="72" rx="10" ry="16" />
                <ellipse cx="28" cy="50" rx="16" ry="10" />
                <ellipse cx="72" cy="50" rx="16" ry="10" />
                <ellipse cx="33" cy="33" rx="10" ry="15" transform="rotate(-45 33 33)" />
                <ellipse cx="67" cy="67" rx="10" ry="15" transform="rotate(-45 67 67)" />
                <ellipse cx="67" cy="33" rx="10" ry="15" transform="rotate(45 67 33)" />
                <ellipse cx="33" cy="67" rx="10" ry="15" transform="rotate(45 33 67)" />
                <circle cx="50" cy="50" r="7" />
            </g>
        </svg>
    );
}

function SparkleDot({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
            <path d="M12 0 C 12.8 6.5, 17.5 11.2, 24 12 C 17.5 12.8, 12.8 17.5, 12 24 C 11.2 17.5, 6.5 12.8, 0 12 C 6.5 11.2, 11.2 6.5, 12 0 Z" />
        </svg>
    );
}

function DoodleBackground() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
            {/* soft color wash */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] via-background to-accent/[0.08]" />

            <LotusDoodle className="absolute -top-8 -left-10 w-44 h-44 text-primary/[0.09] rotate-[-8deg]" />
            <LotusDoodle className="absolute -bottom-14 -right-12 w-56 h-56 text-accent/[0.10] rotate-[10deg]" />

            <LeafDoodle className="absolute top-24 -right-6 w-24 h-24 text-primary/[0.10] rotate-[20deg]" />
            <LeafDoodle className="absolute bottom-40 -left-8 w-28 h-28 text-primary/[0.08] rotate-[-30deg] scale-x-[-1]" />

            <PetalFlowerDoodle className="absolute top-[38%] left-4 w-14 h-14 text-primary/[0.10]" />
            <PetalFlowerDoodle className="absolute top-[15%] right-10 w-10 h-10 text-accent/[0.12]" />

            <SparkleDot className="absolute top-16 left-1/3 w-3 h-3 text-primary/20" />
            <SparkleDot className="absolute bottom-1/3 right-8 w-4 h-4 text-accent/25" />
            <SparkleDot className="absolute top-1/2 right-1/4 w-2.5 h-2.5 text-primary/20" />
        </div>
    );
}

/* ------------------------------------------------------------------ */

export default function NaamJaapScreen() {
    const navigate = useNavigate();

    const chantingOptions = {
        Mantras: [
            "ॐ नमः शिवाय",
            "राधे कृष्ण",
            "हरे कृष्ण",
            "जय श्री राम",
            "ॐ गं गणपतये नमः",
            "ॐ",
        ],

        Prayers: [
            "Lord Jesus Christ",
            "Thank You Lord",
            "Hallelujah",
            "Kyrie Eleison",
        ],

        Affirmations: [
            "I am calm",
            "I am strong",
            "I choose peace",
            "I am grateful",
            "Everything will be okay",
        ],
    };

    const [selectedCategory, setSelectedCategory] =
        useState<keyof typeof chantingOptions>("Mantras");

    const [selectedMantra, setSelectedMantra] = useState(
        chantingOptions.Mantras[0]
    );

    const [count, setCount] = useState(0);
    const [cycleCount, setCycleCount] = useState(0);
    const [todayCount, setTodayCount] = useState(0);
    const [lifetimeCount, setLifetimeCount] = useState(0);

    // Audio instance created once, not on every render
    const bellAudioRef = useRef<HTMLAudioElement | null>(null);
    if (!bellAudioRef.current) {
        bellAudioRef.current = new Audio(cycleBell);
    }

    const [seconds, setSeconds] = useState(0);
    const [isChanting, setIsChanting] = useState(false);

    // brief pulse animation on every tap
    const [isPulsing, setIsPulsing] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isChanting) {
            interval = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isChanting]);

    const handleTap = () => {
        if (!isChanting) {
            setIsChanting(true);
        }

        let nextCount = count + 1;

        if (nextCount > 108) {
            nextCount = 1;

            setCycleCount((prev) => prev + 1);

            const bell = bellAudioRef.current;
            if (bell) {
                bell.currentTime = 0;
                bell.play();
            }
        }

        setCount(nextCount);
        setTodayCount((prev) => prev + 1);
        setLifetimeCount((prev) => prev + 1);

        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 150);
    };

    const handleDecrease = () => {
        if (count <= 0) return;

        setCount((prev) => prev - 1);

        setTodayCount((prev) => Math.max(prev - 1, 0));

        setLifetimeCount((prev) => Math.max(prev - 1, 0));
    };

    const progress = (count / 108) * 100;

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
            2,
            "0"
        )}:${String(secs).padStart(2, "0")}`;
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-background p-5 pb-24">
            <DoodleBackground />

            {/* everything below sits above the doodle layer */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="
              w-9 h-9
              rounded-full
              bg-card/70
              backdrop-blur
              shadow-soft
              flex items-center justify-center
              text-foreground
            "
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Mindful Chanting
                        </h1>
                        <Sparkles size={16} className="text-primary/60" />
                    </div>
                </div>

                {/* Timer */}
                <div className="flex justify-center mb-6">
                    <div
                        className="
              flex
              items-center
              gap-3
              px-5
              py-3
              rounded-full
              bg-card/70
              backdrop-blur
              shadow-soft
              border border-primary/10
              text-lg
              font-semibold
            "
                    >
                        <span className="tabular-nums">⏱ {formatTime(seconds)}</span>

                        <button
                            onClick={() => setIsChanting(!isChanting)}
                            className="
                w-8 h-8
                rounded-full
                bg-primary
                text-primary-foreground
                flex items-center justify-center
                transition-transform active:scale-90
              "
                        >
                            {isChanting ? (
                                <Pause size={16} />
                            ) : (
                                <Play size={16} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Selectors */}
                <div className="space-y-4 mb-8">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">
                            Practice Type
                        </label>

                        {/* pill / segmented tabs instead of a plain dropdown */}
                        <div
                            className="
                mt-2
                flex
                gap-2
                p-1
                rounded-2xl
                bg-card/60
                backdrop-blur
                border border-primary/10
                shadow-soft
              "
                        >
                            {Object.keys(chantingOptions).map((category) => {
                                const isActive = category === selectedCategory;

                                return (
                                    <button
                                        key={category}
                                        onClick={() => {
                                            const c = category as keyof typeof chantingOptions;
                                            setSelectedCategory(c);
                                            setSelectedMantra(chantingOptions[c][0]);
                                        }}
                                        className={`
                      flex-1
                      py-2
                      rounded-xl
                      text-sm
                      font-medium
                      transition-colors
                      ${isActive
                                                ? "bg-primary text-primary-foreground shadow-soft"
                                                : "text-muted-foreground hover:text-foreground"
                                            }
                    `}
                                    >
                                        {category}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">
                            Choose Chant
                        </label>

                        <select
                            value={selectedMantra}
                            onChange={(e) =>
                                setSelectedMantra(e.target.value)
                            }
                            className="
                w-full
                mt-2
                p-3
                rounded-2xl
                border border-primary/10
                bg-card/60
                backdrop-blur
                shadow-soft
                text-center
                font-medium
              "
                        >
                            {chantingOptions[selectedCategory].map(
                                (item) => (
                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            onClick={handleDecrease}
                            className="rounded-full border-primary/20"
                        >
                            -1 Count
                        </Button>
                    </div>
                </div>

                {/* Selected Chant */}
                <h2 className="text-center text-3xl font-bold mb-8 text-foreground">
                    {selectedMantra}
                </h2>

                {/* Counter Circle */}
                <div className="flex justify-center mb-10">
                    <div className="relative flex items-center justify-center">
                        {/* soft glow behind the circle */}
                        <div className="absolute w-[300px] h-[300px] rounded-full bg-primary/20 blur-3xl" />

                        {/* faint lotus resting behind the ring */}
                        <LotusDoodle className="absolute w-52 h-52 text-primary/[0.08]" />

                        <div
                            onClick={handleTap}
                            className={`
                relative
                w-[280px]
                h-[280px]
                rounded-full
                cursor-pointer
                flex
                items-center
                justify-center
                transition-transform
                duration-150
                ${isPulsing ? "scale-[0.97]" : "scale-100"}
              `}
                            style={{
                                background: `conic-gradient(
                  hsl(var(--primary)) ${progress}%,
                  rgba(120,120,120,.12) ${progress}%
                )`,
                            }}
                        >
                            <div
                                className="
                  absolute
                  w-[245px]
                  h-[245px]
                  rounded-full
                  bg-background
                  shadow-soft
                  flex
                  flex-col
                  items-center
                  justify-center
                "
                            >
                                <h1 className="text-5xl font-bold">
                                    {count}
                                </h1>

                                <p className="text-muted-foreground">
                                    / 108
                                </p>

                                <p className="mt-3 text-sm text-primary/70 flex items-center gap-1">
                                    <Sparkles size={12} /> Tap To Count
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <Card className="shadow-soft border border-primary/10 bg-card/70 backdrop-blur">
                    <CardContent className="p-5">
                        <div className="grid grid-cols-3 gap-4">

                            <div className="rounded-2xl bg-primary/10 p-4 flex flex-col items-center text-center">
                                <Sunrise size={16} className="text-primary mb-1" />
                                <h3 className="font-medium text-xs text-muted-foreground">
                                    Today
                                </h3>

                                <p className="text-2xl font-bold text-primary">
                                    {todayCount}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-accent/15 p-4 flex flex-col items-center text-center">
                                <RotateCw size={16} className="text-primary mb-1" />
                                <h3 className="font-medium text-xs text-muted-foreground">
                                    Cycles
                                </h3>

                                <p className="text-2xl font-bold text-primary">
                                    {cycleCount}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-primary/10 p-4 flex flex-col items-center text-center">
                                <Sparkles size={16} className="text-primary mb-1" />
                                <h3 className="font-medium text-xs text-muted-foreground">
                                    Lifetime
                                </h3>

                                <p className="text-2xl font-bold text-primary">
                                    {lifetimeCount}
                                </p>
                            </div>

                        </div>
                    </CardContent>
                </Card>

                <p className="text-center mt-4 text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                    <LeafDoodle className="w-4 h-4 text-primary/50" />
                    Every 108 repetitions = 1 Cycle
                    <LeafDoodle className="w-4 h-4 text-primary/50 scale-x-[-1]" />
                </p>
            </div>
        </div>
    );
}