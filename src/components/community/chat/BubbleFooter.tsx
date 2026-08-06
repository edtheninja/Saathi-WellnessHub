import { motion } from "framer-motion";
import { Check, CheckCheck, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BubbleFooterProps {
  timestamp: string;
  isMine: boolean;
  status?: "sending" | "sent" | "delivered" | "read";
}

export default function BubbleFooter({
  timestamp,
  isMine,
  status = "sent",
}: BubbleFooterProps) {
  const renderStatus = () => {
    if (!isMine) return null;

    switch (status) {
      case "sending":
        return <Clock3 className="h-3.5 w-3.5 opacity-60" />;

      case "sent":
        return <Check className="h-3.5 w-3.5 opacity-60" />;

      case "delivered":
        return <CheckCheck className="h-3.5 w-3.5 opacity-60" />;

      case "read":
        return (
          <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 28,
      }}
      className={cn(
        "mt-3 flex items-center gap-1.5 text-[11px] font-medium",
        isMine ? "justify-end" : "justify-end",
        "text-slate-500 dark:text-slate-400"
      )}
    >
      <span className="select-none tracking-wide">
        {timestamp}
      </span>

      {renderStatus()}
    </motion.div>
  );
}