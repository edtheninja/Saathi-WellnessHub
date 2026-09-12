import { motion } from "framer-motion";
import JourneyHeader from "./JourneyHeader";
import JourneyAchievement from "./JourneyAchievement";
import JourneyReflection from "./JourneyReflection";
import MoodBadge from "./MoodBadge";
import TagList from "./TagList";
import ReactionBar from "./ReactionBar";

export interface Journey {

    id: string;

    user: {

        name: string;

        avatar?: string;

    };

    mood: string;

    achievement: {

        icon: string;

        title: string;

        value: string;

    };

    reflection: string;

    tags: string[];

    createdAt: string;

}

interface Props {

    journey: Journey;

}

export default function JourneyCard({

    journey

}: Props) {

    return (

        <motion.article

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: .35 }}

            whileHover={{
                y: -6,
                scale: 1.01
            }}

            className="
                group
                rounded-[34px]
                border
                border-white/10
                bg-card/90
                backdrop-blur-xl
                p-7
                shadow-lg
                transition-all
                duration-300
                hover:shadow-2xl
            "

        >

            <JourneyHeader
                user={journey.user}
                createdAt={journey.createdAt}
            />

            <div className="mt-6">

                <MoodBadge
                    mood={journey.mood}
                />

            </div>

            <div className="mt-6">

                <JourneyAchievement
                    achievement={journey.achievement}
                />

            </div>

            <div className="mt-6">

                <JourneyReflection
                    reflection={journey.reflection}
                />

            </div>

            <div className="mt-6">

                <TagList
                    tags={journey.tags}
                />

            </div>

            <div className="mt-7 pt-5 border-t">

                <ReactionBar />

            </div>

        </motion.article>

    );

}