"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InputPortalProps {
  onSubmit: (feeling: string) => void;
  isGenerating: boolean;
}

const suggestions = [
  "the feeling of a Sunday afternoon ending",
  "nostalgia for a place you've never been",
  "the moment before a storm arrives",
  "the quiet after everyone leaves",
  "being seen by someone who really knows you",
  "the ache of outgrowing something you loved",
  "3am thoughts that vanish by morning",
  "the weight of an unsent message",
];

export function InputPortal({ onSubmit, isGenerating }: InputPortalProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    if (input.trim() && !isGenerating) {
      onSubmit(input.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-2xl px-6"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-crimson)] font-light text-white/80 leading-relaxed">
            Moodboard for a feeling
            <br />
            <span className="italic text-white/50">that doesn&apos;t have a name yet</span>
          </h1>
        </motion.div>

        {/* Input area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative"
        >
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (e.target.value) setShowSuggestions(false);
              }}
              onKeyDown={handleKeyDown}
              placeholder="describe a feeling..."
              disabled={isGenerating}
              rows={3}
              className="relative w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white/90 text-lg font-[family-name:var(--font-crimson)] placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all duration-300 resize-none disabled:opacity-50"
            />
          </div>

          {/* Submit hint */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
                  <span className="text-xs text-white/40 font-[family-name:var(--font-jetbrains)]">
                    translating feeling...
                  </span>
                </motion.div>
              ) : input.trim() ? (
                <motion.button
                  key="submit"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleSubmit}
                  className="px-3 py-1.5 text-xs text-white/60 hover:text-white/90 font-[family-name:var(--font-space-grotesk)] border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/5 transition-all duration-200"
                >
                  enter ↵
                </motion.button>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Suggestions */}
        <AnimatePresence>
          {showSuggestions && !input && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="mt-8"
            >
              <p className="text-xs text-white/30 font-[family-name:var(--font-jetbrains)] mb-4 text-center">
                or try one of these
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion, i) => (
                  <motion.button
                    key={suggestion}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.05, duration: 0.3 }}
                    onClick={() => selectSuggestion(suggestion)}
                    className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 font-[family-name:var(--font-crimson)] italic border border-white/5 rounded-full hover:border-white/15 hover:bg-white/[0.02] transition-all duration-300"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
