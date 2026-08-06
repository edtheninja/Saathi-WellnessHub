import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smile,
  Mic,
  SendHorizonal,
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

  reply?: ReplyMessage | null;

  onCancelReply?: () => void;
}

export default function ChatComposer({
  onSend,
  reply = null,
  onCancelReply,
}: Props) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 140) + "px";
  };
  const handleSend = () => {
    if (!text.trim()) return;

    onSend(text.trim());

    onCancelReply?.();

    setText("");

    // Close emoji picker
    setShowEmojiPicker(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
      textareaRef.current.focus();
    }
  };
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="px-4 pb-4 pt-2"
    >
      {/* Emoji Picker */}
      <AnimatePresence>
        {reply && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: .18 }}

            className="
        border-b
        border-border/50
        bg-muted/40
        backdrop-blur-xl
      "
          >
            <div className="flex items-start px-5 py-3">

              <div className="w-1 rounded-full bg-sky-400 mr-4" />

              <div className="flex-1">

                <p className="text-sm font-semibold">
                  Replying to {reply.sender}
                </p>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {reply.text}
                </p>

              </div>

              <button
                onClick={onCancelReply}
                className="
            rounded-full
            p-2
            hover:bg-muted
          "
              >
                <X className="w-4 h-4" />
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="
      rounded-[32px]
      overflow-hidden
      border
      border-white/40
      bg-background/80
      backdrop-blur-2xl
      shadow-xl
    "
      ></div>
      <div
        className="
          rounded-[30px]
          border
          border-white/40
          bg-background/80
          backdrop-blur-2xl
          shadow-xl
          px-4
          py-3
        "
      >
        <div className="flex items-end gap-3">

          {/* Emoji */}

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="
              h-10
              w-10
              rounded-full
              hover:bg-muted
              transition
              flex
              items-center
              justify-center
            "
          >

            <AnimatePresence>
              {showEmojiPicker && (
                <EmojiPicker
                  onSelect={(emoji) => {
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

                      const pos = start + emoji.length;

                      textarea.setSelectionRange(pos, pos);
                    });
                    setShowEmojiPicker(false);
                    requestAnimationFrame(() => {
                      textareaRef.current?.focus();
                    });
                  }}
                />
              )}
            </AnimatePresence>

            <Smile className="w-5 h-5" />
          </button>
          {/* Input */}

          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            placeholder="Type a message..."
            onChange={(e) => {
              setText(e.target.value);
              resize();
            }}
            onClick={() => setShowEmojiPicker(false)}
            className="
              flex-1
              resize-none
              bg-transparent
              outline-none
              leading-6
              min-h-[44px]
              max-h-[140px]
              overflow-y-auto
              py-2
            "
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {/* Right Button */}

          <AnimatePresence mode="wait">

            {text.trim() ? (

              <motion.button
                key="send"
                initial={{ scale: .7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: .7, opacity: 0 }}
                transition={{ duration: .18 }}
                whileTap={{ scale: .9 }}
                onClick={handleSend}
                className="
                  h-11
                  w-11
                  rounded-full
                  bg-primary
                  text-primary-foreground
                  shadow-lg
                  flex
                  items-center
                  justify-center
                "
              >
                <SendHorizonal className="w-5 h-5" />
              </motion.button>

            ) : (
              <motion.button
                key="mic"
                initial={{ scale: .7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: .7, opacity: 0 }}
                className="
                  h-11
                  w-11
                  rounded-full
                  hover:bg-muted
                  transition
                  flex
                  items-center
                  justify-center
                "
              >
                <Mic className="w-5 h-5" />
              </motion.button>

            )}

          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  );
}