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

      <h2 className="text-2xl font-bold mb-6">
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
              border-white/40
              bg-white/60
              backdrop-blur-xl
              p-6
              text-left
              shadow-md
              hover:-translate-y-1
              hover:shadow-xl
              transition-all
              duration-300
              "
          >

            <div className="flex justify-between items-center">

              <div className="flex items-center gap-5">

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white text-xl shadow-lg">

                  💙

                </div>

                <div>

                  <h3 className="font-semibold text-lg">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Safe conversations in a supportive community.
                  </p>
                  <p className="text-muted-foreground">
                    {item.members} members
                  </p>

                </div>

              </div>

              <ArrowRight className="group-hover:translate-x-1 transition" />

            </div>

          </button>

        ))}

      </div>

    </section>
  );
}