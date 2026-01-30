import { motion } from "framer-motion";
import { useMascot } from "@/context/MascotContext";

export default function FoxMascot() {
  const { mood } = useMascot();
  const message: string = "";

  if (mood === "idle") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-24 right-6 z-50 flex items-end gap-2"
    >
      {/* Speech bubble */}
      <div className="bg-background border rounded-xl px-4 py-2 shadow text-sm max-w-[220px]">
        {message}
      </div>

      {/* Fox */}
      <div className="text-4xl">
        {mood === "encouraging" && "🦊"}
        {mood === "celebrating" && "🎉🦊"}
        {(mood as string) === "late" && "😴🦊"}
      </div>
    </motion.div>
  );
}
