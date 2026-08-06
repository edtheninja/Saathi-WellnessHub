import { AnimatePresence, motion } from "framer-motion";
import { HeartHandshake, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SUPPORTS = [
  { emoji: "🫂", title: "Hug" },
  { emoji: "💙", title: "Care" },
  { emoji: "🌿", title: "Calm" },
  { emoji: "☀️", title: "Hope" },
  { emoji: "🌸", title: "Kindness" },
  { emoji: "🌈", title: "Better Days" },
  { emoji: "✨", title: "Strength" },
  { emoji: "🙏", title: "Prayers" },
];

interface Props {
  open: boolean;

  onClose(): void;

  onSend(
    support: {
      emoji: string;
      title: string;
    },
    note: string
  ): void;
}

export default function SuperReactSheet({
  open,
  onClose,
  onSend,
}: Props) {
  const [selected, setSelected] = useState(SUPPORTS[0]);
  const [note, setNote] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 250);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="
              fixed
              inset-0
              z-50
              flex
              items-end
              justify-center

              pointer-events-none
o

            "
          />

          {/* Floating Card */}
          
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
              scale: .92,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 30,
              scale: .96,
            }}
            transition={{
              type: "spring" as const,
              stiffness: 320,
              damping: 28,
            }}
            className="
              pointer-events-auto
              
              mb-6
              w-full
              max-w-md
              max-h-[88dvh]
              
              overflow-hidden

              rounded-[32px]

              border
              border-white/50

              bg-white/90
              dark:bg-slate-900/90

              backdrop-blur-3xl

              shadow-[0_25px_80px_rgba(0,0,0,.18)]
            "
          >
            {/* Header */}

            <div className="flex items-center justify-between px-6 pt-5">
              <div>
                <h3 className="text-lg font-semibold">
                  Send Support
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  A few kind words can make someone's day.
                </p>
              </div>

              <button
                onClick={onClose}
                className="
                  rounded-full

                  p-2

                  hover:bg-slate-100

                  transition
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* Emoji Grid */}

            <div className="grid grid-cols-4 gap-3 px-6 py-4">
              {SUPPORTS.map((item) => {
                const active =
                  selected.title === item.title;

                return (
                  <motion.button
                    key={item.title}
                    whileHover={{
                      scale: 1.08,
                      y: -2,
                    }}
                    whileTap={{
                      scale: .92,
                    }}
                    onClick={() =>
                      setSelected(item)
                    }
                    className={`
                      flex
                      flex-col
                      items-center

                      rounded-2xl

                      p-3

                      transition-all

                      ${
                        active
                          ? `
                          bg-sky-100
                          shadow-md
                        `
                          : `
                          hover:bg-slate-100
                        `
                      }
                    `}
                  >
                    <span className="text-3xl">
                      {item.emoji}
                    </span>

                    <span
                      className="
                        mt-2

                        text-[11px]

                        font-medium
                      "
                    >
                      {item.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Message */}

            <div className="px-6">
              <textarea
                ref={textareaRef}
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                rows={4}
                placeholder="Write something kind..."
                className="
                  w-full

                  resize-none

                  rounded-2xl

                  border

                  border-slate-200

                  bg-slate-50

                  p-4

                  text-sm

                  outline-none

                  focus:border-sky-400
                  focus:ring-2
                  focus:ring-sky-200
                "
              />
            </div>

            {/* Footer */}

            <div className="flex items-center justify-between px-6 py-4">
              <div
                className="
                  flex
                  items-center
                  gap-2

                  text-sm

                  text-slate-500
                "
              >
                <HeartHandshake size={16} />

                Support is private and encouraging.
              </div>

              <motion.button
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: .95,
                }}
                onClick={() => {
                  onSend(selected, note);

                  setNote("");

                  onClose();
                }}
                className="
                  rounded-full

                  bg-sky-500

                  px-6
                  py-2.5

                  font-medium

                  text-white

                  shadow-lg
                "
              >
                Send 💙
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}