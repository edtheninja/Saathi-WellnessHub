import { Users } from "lucide-react";

export default function CommunityHero() {
  return (
    <section
      className="
      relative
      overflow-hidden
      rounded-[36px]
      border
      bg-card
      p-10
      shadow-lg
    "
    >
      <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex items-center gap-6">

        <div
          className="
          w-24
          h-24
          rounded-[30px]
          bg-gradient-to-br
          from-indigo-500
          to-violet-600
          flex
          items-center
          justify-center
        "
        >
          <Users className="w-12 h-12 text-white" />
        </div>

        <div>

          <h1 className="text-4xl font-bold tracking-tight">
            Community
          </h1>

          <p className="text-lg mt-2 text-muted-foreground max-w-xl">
            A welcoming space where you can connect, share experiences,
            and support each other on your wellness journey.
          </p>

        </div>

      </div>
    </section>
  );
}