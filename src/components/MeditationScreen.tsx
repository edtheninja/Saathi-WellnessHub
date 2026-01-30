import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Check, Volume2 } from 'lucide-react';
import { supabase } from '@/supabaseClient';

const MeditationScreen = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [selectedDuration, setSelectedDuration] = useState(5);

  const meditationIdRef = useRef<string | null>(null); // 🔑 track row
  const hasCompletedRef = useRef(false);

  const durations = [
    { label: '3 min', value: 3, seconds: 180 },
    { label: '5 min', value: 5, seconds: 300 },
    { label: '10 min', value: 10, seconds: 600 },
    { label: '15 min', value: 15, seconds: 900 },
    { label: '20 min', value: 20, seconds: 1200 }
  ];

  const sessions = [
    { title: "Morning Mindfulness", description: "Start your day with clarity and focus", duration: "10 min", category: "Focus" },
    { title: "Stress Relief", description: "Release tension and find peace", duration: "15 min", category: "Relaxation" },
    { title: "Sleep Preparation", description: "Wind down for restful sleep", duration: "20 min", category: "Sleep" },
    { title: "Anxiety Ease", description: "Calm your worried mind", duration: "8 min", category: "Anxiety" }
  ];

  /* -------------------- DATABASE -------------------- */

  const startMeditation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("meditation")
      .insert({
        user_id: user.id,
        duration: selectedDuration,
        completed: false
      })
      .select("id")
      .single();

    if (error) {
      console.error("Insert failed:", error);
      return;
    }

    meditationIdRef.current = data.id;
  };

  const markCompleted = async () => {
    if (!meditationIdRef.current) return;

    await supabase
      .from("meditation")
      .update({ completed: true })
      .eq("id", meditationIdRef.current);

    hasCompletedRef.current = true;
    setIsActive(false);
  };

  /* -------------------- TIMER -------------------- */

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    }

    if (timeLeft === 0 && isActive && !hasCompletedRef.current) {
      markCompleted(); // ⏱ auto complete
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDurationSelect = (d: typeof durations[0]) => {
    setSelectedDuration(d.value);
    setTimeLeft(d.seconds);
    setIsActive(false);
    meditationIdRef.current = null;
    hasCompletedRef.current = false;
  };

  const toggleTimer = async () => {
    if (!isActive && !meditationIdRef.current) {
      await startMeditation(); // 🔥 insert once
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    const d = durations.find(x => x.value === selectedDuration);
    setTimeLeft(d ? d.seconds : 300);
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen bg-gradient-peaceful p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">

        <Card className="shadow-floating border-0 bg-card/90 backdrop-blur">
          <CardContent className="p-8 text-center space-y-6">

            <div className={`w-48 h-48 mx-auto rounded-full bg-gradient-calm flex items-center justify-center ${isActive ? 'animate-breathe' : ''}`}>
              <div>
                <div className="text-4xl font-mono mb-2">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm">
                  {isActive ? 'Breathe...' : 'Ready'}
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button onClick={toggleTimer} size="lg" className="w-16 h-16 rounded-full">
                {isActive ? <Pause /> : <Play />}
              </Button>

              <Button onClick={resetTimer} size="lg" variant="outline" className="w-16 h-16 rounded-full">
                <RotateCcw />
              </Button>

              <Button
                onClick={markCompleted}
                size="lg"
                variant="outline"
                className="w-16 h-16 rounded-full border-green-500 text-green-600"
              >
                <Check />
              </Button>
            </div>

            <div className="flex justify-center space-x-2">
              {durations.map((d) => (
                <Button
                  key={d.value}
                  onClick={() => handleDurationSelect(d)}
                  size="sm"
                  variant={selectedDuration === d.value ? "default" : "outline"}
                  className="rounded-full"
                >
                  {d.label}
                </Button>
              ))}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MeditationScreen;
