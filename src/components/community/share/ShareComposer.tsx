import { useState } from "react";
import {
    Heart,
    Globe,
    Lock,
    Sparkles,
    Send,
    X,
} from "lucide-react";

import MoodSelector from "./MoodSelector";
import VisibilitySelector from "./VisibilitySelector";
import AchievementCard from "./AchievementCard";
import ShareFooter from "./ShareFooter";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ShareComposerProps {
    onCancel: () => void;
    onPublish: (post: {
        title: string;
        body: string;
        mood: string;
        visibility: "community" | "private";
    }) => void;

    achievement?: {
        title: string;
        subtitle: string;
        icon: React.ReactNode;
    };
}

export default function ShareComposer({
    onCancel,
    onPublish,
    achievement,
}: ShareComposerProps) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [mood, setMood] = useState("😊");
    const [visibility, setVisibility] =
        useState<"community" | "private">("community");

    return (
        <div className= "space-y-8" >

        {/* Header */ }

        <div>

        <h2 className="text-3xl font-bold tracking-tight" >
            Share Your Journey
                </h2>

                < p className = "text-muted-foreground mt-2" >
                    Inspire others by sharing your wellness progress.
        </p>

                        </div>

    {/* Mood */ }

    <div className="space-y-3" >

        <label className="font-semibold" >
            Current Mood
                </label>

                < MoodSelector
    value = { mood }
    onChange = { setMood }
        />

        </div>

    {/* Title */ }

    <div className="space-y-3" >

        <label className="font-semibold" >
            Title
            </label>

            < Input
    value = { title }
    onChange = {(e) => setTitle(e.target.value)
}
placeholder = "Give your moment a title..."
    />

    </div>

{/* Reflection */ }

<div className="space-y-3" >

    <label className="font-semibold" >
        Reflection
        </label>

        < Textarea
rows = { 5}
value = { body }
onChange = {(e) => setBody(e.target.value)}
placeholder = "How are you feeling today?"
    />

    </div>

{/* Achievement */ }

{
    achievement && (
        <div className="space-y-3" >

            <label className="font-semibold" >
                Achievement
                </label>

                < AchievementCard
    title = { achievement.title }
    subtitle = { achievement.subtitle }
    icon = { achievement.icon }
        />

        </div>
      )
}

{/* Visibility */ }

<div className="space-y-3" >

    <label className="font-semibold" >
        Visibility
        </label>

        < VisibilitySelector
value = { visibility }
onChange = { setVisibility }
    />

    </div>

{/* Footer */ }

<ShareFooter
        onCancel={ onCancel }
onPublish = {() =>
onPublish({
    title,
    body,
    mood,
    visibility,
})
        }
      />

    </div>
  );
}