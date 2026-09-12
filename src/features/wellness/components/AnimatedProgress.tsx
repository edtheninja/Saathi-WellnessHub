import { motion } from "framer-motion";

interface AnimatedProgressProps {
  value?: number;
  className?: string;
}

export default function AnimatedProgress({
  value,
  className = "",
}: AnimatedProgressProps) {
  const progress = Math.max(0, Math.min(value ?? 0, 100));

  return (
    <div
      className={`w-full h-2 rounded-full bg-muted overflow-hidden ${className}`}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{
          duration: 1,
          ease: "easeOut",
        }}
        className="h-full rounded-full bg-primary"
      />
    </div>
  );
}