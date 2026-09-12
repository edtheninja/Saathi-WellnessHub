// src/screens/NaamJaapScreen.tsx

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import cycleBell from "@/assets/sounds/cycle-complete.mp3";

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

    const bellAudio = new Audio(cycleBell);

    const [seconds, setSeconds] = useState(0);
    const [isChanting, setIsChanting] = useState(false);

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

            bellAudio.currentTime = 0;
            bellAudio.play();
        }

        setCount(nextCount);
        setTodayCount((prev) => prev + 1);
        setLifetimeCount((prev) => prev + 1);
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
        <div className="min-h-screen bg-background p-5 pb-24">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <ArrowLeft
                    className="cursor-pointer"
                    onClick={() => navigate(-1)}
                />

                <h1 className="text-2xl font-bold">
                    Mindful Chanting
                </h1>
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
            bg-primary/10
            text-lg
            font-semibold
          "
                >
                    <span>⏱ {formatTime(seconds)}</span>

                    <button
                        onClick={() => setIsChanting(!isChanting)}
                        className="
              w-8 h-8
              rounded-full
              bg-primary
              text-primary-foreground
              flex items-center justify-center
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
                    <label className="text-sm font-medium">
                        Practice Type
                    </label>

                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            const category =
                                e.target.value as keyof typeof chantingOptions;

                            setSelectedCategory(category);
                            setSelectedMantra(
                                chantingOptions[category][0]
                            );
                        }}
                        className="
              w-full
              mt-2
              p-3
              rounded-xl
              border
              bg-background
            "
                    >
                        {Object.keys(chantingOptions).map((category) => (
                            <option
                                key={category}
                                value={category}
                            >
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-sm font-medium">
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
              rounded-xl
              border
              bg-background
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
                    >
                        -1 Count
                    </Button>
                </div>
            </div>

            {/* Selected Chant */}
            <h2 className="text-center text-3xl font-bold mb-8">
                {selectedMantra}
            </h2>

            {/* Counter Circle */}
            <div className="flex justify-center mb-10">
                <div
                    onClick={handleTap}
                    className="
            relative
            w-[280px]
            h-[280px]
            rounded-full
            cursor-pointer
            flex
            items-center
            justify-center
          "
                    style={{
                        background: `conic-gradient(
              hsl(var(--primary)) ${progress}%,
              rgba(120,120,120,.15) ${progress}%
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

                        <p className="mt-3 text-sm">
                            Tap To Count
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <Card className="shadow-soft border-0">
                <CardContent className="p-5">
                    <div className="grid grid-cols-3 gap-4">

                        <div className="rounded-2xl bg-primary/10 p-4">
                            <h3 className="font-medium text-sm">
                                Today's Count
                            </h3>

                            <p className="text-2xl font-bold text-primary">
                                {todayCount}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-primary/10 p-4">
                            <h3 className="font-medium text-sm">
                                Completed Cycles
                            </h3>

                            <p className="text-2xl font-bold text-primary">
                                {cycleCount}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-primary/10 p-4">
                            <h3 className="font-medium text-sm">
                                Lifetime Count
                            </h3>

                            <p className="text-2xl font-bold text-primary">
                                {lifetimeCount}
                            </p>
                        </div>

                    </div>
                </CardContent>
            </Card>

            <p className="text-center mt-4 text-sm text-muted-foreground">
                Every 108 repetitions = 1 Cycle
            </p>
        </div>
    );
}