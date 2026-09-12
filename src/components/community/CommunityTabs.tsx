import { Users, Newspaper, Compass, Calendar } from "lucide-react";

export type CommunityTab =
  | "feed"
  | "groups"
  | "discover"
  | "events";

interface Props {
  active: CommunityTab;
  onChange: (tab: CommunityTab) => void;
}

const tabs = [
  {
    id: "feed",
    label: "Feed",
    icon: Newspaper,
  },
  {
    id: "groups",
    label: "Groups",
    icon: Users,
  },
  {
    id: "discover",
    label: "Discover",
    icon: Compass,
  },
  {
    id: "events",
    label: "Events",
    icon: Calendar,
  },
] as const;

export default function CommunityTabs({
  active,
  onChange,
}: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto">

      {tabs.map((tab) => {
        const Icon = tab.icon;

        const selected = active === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              px-5
              py-3
              rounded-2xl
              flex
              items-center
              gap-2
              transition-all
              duration-300
              ${
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border hover:-translate-y-1"
              }
            `}
          >
            <Icon className="w-5 h-5" />
            {tab.label}
          </button>
        );
      })}

    </div>
  );
}