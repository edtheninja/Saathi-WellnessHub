import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  title: string;
  description: string;
  icon: any;
  gradient: string;
  onClick?: () => void;
}

export default function CommunityCard({
  title,
  description,
  icon: Icon,
  gradient,
  onClick,
}: Props) {
  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="
      group
      relative
      overflow-hidden
      rounded-[32px]
      border
      bg-card
      p-8
      text-left
      shadow-lg
      hover:shadow-2xl
      transition-all
      duration-300
      w-full
    "
    >
      <div
        className={`
          w-20
          h-20
          rounded-[26px]
          flex
          items-center
          justify-center
          bg-gradient-to-br
          ${gradient}
          shadow-xl
          transition-all
          duration-300
          group-hover:scale-110
          group-hover:-translate-y-1
        `}
      >
        <Icon className="w-10 h-10 text-white" />
      </div>

      <h3 className="mt-8 text-2xl font-bold tracking-tight">
        {title}
      </h3>

      <p className="mt-3 text-muted-foreground leading-relaxed">
        {description}
      </p>

      <div className="flex justify-end mt-8">

        <div
          className="
          w-12
          h-12
          rounded-full
          border
          flex
          items-center
          justify-center
          transition-all
          duration-300
          group-hover:translate-x-2
          group-hover:scale-110
        "
        >
          <ArrowRight className="w-6 h-6" />
        </div>

      </div>
    </motion.button>
  );
}