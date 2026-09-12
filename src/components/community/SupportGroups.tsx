import { ArrowRight } from "lucide-react";

interface Group {
  id: string;
  title: string;
  members: number;
}

interface Props {
  groups: Group[];
  onOpen?: (id: string) => void;
}

export default function SupportGroups({
  groups,
  onOpen,
}: Props) {
  return (
    <section className="rounded-[32px] border bg-card p-8">
      <h2 className="mb-6 text-2xl font-bold text-foreground">
        Support Groups
      </h2>

      <div className="space-y-4">
        {groups.map((item) => (
          <button
            onClick={() => onOpen?.(item.id)}
            key={item.id}
            className="
              group
              w-full
              rounded-[28px]
              border
              border-border/60
              bg-card/70
              p-6
              text-left
              shadow-md
              backdrop-blur-xl
              transition-all
              duration-300

              hover:-translate-y-1
              hover:shadow-xl

              dark:border-white/[0.12]
              dark:bg-white/[0.06]
              dark:hover:bg-white/[0.09]
            "
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-xl text-white shadow-lg">
                  💙
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Safe conversations in a supportive community.
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {item.members} members
                  </p>
                </div>
              </div>

              <ArrowRight
                className="
                  h-5
                  w-5
                  text-foreground
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}