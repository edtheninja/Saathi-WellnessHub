import { motion } from "framer-motion";
import { useMascot } from "@/context/MascotContext";

export default function Mascot() {
  const { mood } = useMascot();

  if (mood === "idle") return null; // ✅ hides when no goal

  return (
    <motion.div
      initial={{ scale: 0, y: 40 }}
      animate={{ scale: 1, y: 0 }}
      className="fixed bottom-24 right-6 z-50"
    >
      <div className="text-4xl">
        {mood === "encouraging" && "🦊"}
        {mood === "celebrating" && "🎉🦊"}
      </div>
    </motion.div>
  );
}
