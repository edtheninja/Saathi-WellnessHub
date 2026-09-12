import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type MoodNoteModalProps = {
  open: boolean;
  onClose: () => void;
  mood?: string;
  note: string;
  setNote: React.Dispatch<React.SetStateAction<string>>;
  onSave: () => Promise<void>;
};

export default function MoodNoteModal({
  open,
  onClose,
  mood,
  note,
  setNote,
  onSave,
}: MoodNoteModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent
            className="
              overflow-hidden
              rounded-3xl
              border-white/10
              bg-background/80
              backdrop-blur-2xl
              shadow-2xl
              max-w-md
              p-0
            "
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.92,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 20,
              }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 22,
              }}
              className="relative p-8"
            >
              {/* Decorative glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />

              {/* Floating Mood */}
              <motion.div
                initial={{
                  scale: 0,
                  rotate: -20,
                }}
                animate={{
                  scale: 1,
                  rotate: 0,
                  y: [0, -6, 0],
                }}
                transition={{
                  scale: {
                    type: "spring",
                    stiffness: 320,
                  },
                  y: {
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  },
                }}
                className="relative z-10 text-center text-7xl mb-6"
              >
                {mood ?? "😊"}
              </motion.div>

              <DialogHeader className="relative z-10 text-center space-y-2">
                <DialogTitle className="text-2xl font-bold">
                  How are you feeling?
                </DialogTitle>

                <p className="text-sm text-muted-foreground">
                  Every emotion deserves a safe place.
                </p>
              </DialogHeader>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.15,
                }}
                className="relative z-10 mt-6"
              >
                <Textarea
                  placeholder="Write what's on your mind..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="
                    min-h-[140px]
                    rounded-2xl
                    border-white/10
                    bg-background/40
                    backdrop-blur-xl
                    resize-none
                    focus:ring-2
                    focus:ring-primary/40
                    transition-all
                  "
                />
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.25,
                }}
                className="relative z-10 mt-6"
              >
                <Button
                  onClick={async () => {
                    await onSave();
                    setNote("");
                    onClose();
                  }}
                  className="
                    h-12
                    w-full
                    rounded-2xl
                    text-base
                    font-semibold
                  "
                  asChild={false}
                >
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                    className="w-full text-center"
                  >
                    Save Note
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}