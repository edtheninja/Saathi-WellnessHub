import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smile,
  Mic,
  SendHorizontal,
  X,
} from "lucide-react";
import EmojiPicker from "./EmojiPicker";

interface ReplyMessage {
  id: string;
  sender: string;
  text: string;
}

interface Props {
  onSend: (text: string) => void;
  onTyping?: (typing: boolean) => void;
  reply?: ReplyMessage | null;
  onCancelReply?: () => void;
}

export default function ChatComposer({
  onSend,
  onTyping,
  reply = null,
  onCancelReply,
}: Props) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "0px";

    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      140
    )}px`;
  };

  const handleSend = () => {
    if (!text.trim()) return;

    onSend(text.trim());
    onTyping?.(false);
    onCancelReply?.();

    setText("");
    setShowEmojiPicker(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
      textareaRef.current.focus();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newText =
      text.substring(0, start) +
      emoji +
      text.substring(end);

    setText(newText);

    requestAnimationFrame(() => {
      textarea.focus();

      const position = start + emoji.length;

      textarea.setSelectionRange(position, position);
      resize();
    });

    setShowEmojiPicker(false);
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative px-3 pb-4 pt-2 sm:px-4"
    >
      {/* ───────────────── Reply Preview ───────────────── */}

      <AnimatePresence>
        {reply && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="
              mb-2
              overflow-hidden
              rounded-2xl
              border
              border-border/60
              bg-card/80
              backdrop-blur-xl

              dark:border-white/[0.10]
              dark:bg-white/[0.04]
            "
          >
            <div className="flex items-start gap-3 px-4 py-3">
              <div className="mt-1 h-10 w-1 shrink-0 rounded-full bg-gradient-to-b from-sky-400 to-cyan-400" />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Replying to {reply.sender}
                </p>

                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                  {reply.text}
                </p>
              </div>

              <button
                type="button"
                onClick={onCancelReply}
                aria-label="Cancel reply"
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-muted-foreground
                  transition
                  hover:bg-muted
                  hover:text-foreground
                "
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────────── Composer ───────────────── */}

      <div
        className="
          relative
          flex
          min-h-[68px]
          items-end
          gap-2
          rounded-[30px]
          border
          border-border/70
          bg-background/85
          px-3
          py-2
          shadow-lg
          backdrop-blur-2xl
          transition-all
          duration-300

          focus-within:border-primary/50
          focus-within:shadow-xl

          dark:border-white/[0.12]
          dark:bg-white/[0.045]
          dark:focus-within:border-primary/50
          dark:focus-within:bg-white/[0.06]

          sm:gap-3
          sm:px-4
        "
      >
        {/* ───────────── Emoji Button ───────────── */}

        <div className="relative shrink-0">
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 8,
                }}
                transition={{ duration: 0.16 }}
                className="
                  absolute
                  bottom-14
                  left-0
                  z-50
                "
              >
                <EmojiPicker onSelect={handleEmojiSelect} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              setShowEmojiPicker((prev) => !prev)
            }
            whileTap={{ scale: 0.92 }}
            aria-label="Open emoji picker"
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              text-muted-foreground
              transition-all
              duration-200

              hover:bg-muted
              hover:text-foreground

              dark:hover:bg-white/[0.08]
            "
          >
            <Smile className="h-5 w-5" />
          </motion.button>
        </div>

        {/* ───────────── Input ───────────── */}

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          placeholder="Type a message..."
          onChange={(e) => {
            setText(e.target.value);
            onTyping?.(e.target.value.trim().length > 0);
            resize();
          }}
          onClick={() => setShowEmojiPicker(false)}
          onFocus={() => setShowEmojiPicker(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="
            min-h-[44px]
            max-h-[140px]
            flex-1
            resize-none
            overflow-y-auto
            bg-transparent
            py-2
            text-[15px]
            leading-6
            text-foreground
            outline-none
            placeholder:text-muted-foreground/70

            sm:text-base
          "
        />

        {/* ───────────── Right Action ───────────── */}

        <AnimatePresence mode="wait" initial={false}>
          {text.trim() ? (
            <motion.button
              key="send"
              type="button"
              onClick={handleSend}
              initial={{
                scale: 0.7,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.7,
                opacity: 0,
              }}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.9,
              }}
              aria-label="Send message"
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-primary
                to-violet-500
                text-primary-foreground
                shadow-lg
                shadow-primary/25
                transition-shadow

                hover:shadow-xl
                hover:shadow-primary/35
              "
            >
              <SendHorizontal className="h-5 w-5" />
            </motion.button>
          ) : (
            <motion.button
              key="mic"
              type="button"
              initial={{
                scale: 0.7,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.7,
                opacity: 0,
              }}
              whileTap={{
                scale: 0.92,
              }}
              aria-label="Voice message"
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                text-muted-foreground
                transition-all

                hover:bg-muted
                hover:text-foreground

                dark:hover:bg-white/[0.08]
              "
            >
              <Mic className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}