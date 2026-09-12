import ActivityIcon from "./ActivityIcon";
import type { ActivityType } from "../types/Activity";

interface Props {
    type: ActivityType;
    title: string;
    subtitle: string;
    timestamp: string;
}

export default function ActivityItem({
    type,
    title,
    subtitle,
    timestamp,
}: Props) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 transition-all hover:shadow-sm">

            <div className="rounded-xl bg-primary/10 p-3">
                <ActivityIcon type={type} />
            </div>

            <div className="flex-1">

                <h4 className="font-medium">
                    {title}
                </h4>

                <p className="text-sm text-muted-foreground">
                    {subtitle}
                </p>

            </div>

            <span className="text-xs text-muted-foreground">
                {new Date(timestamp).toLocaleString()}
            </span>
        </div>
    );
}