"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EmotionalPalette } from "@/app/api/feel/route";

interface TypographicInterpretationProps {
  palette: EmotionalPalette;
}

interface FloatingWord {
  id: string;
  word: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  speed: number;
  driftX: number;
  driftY: number;
}

// INTERPRETATION 2: TYPOGRAPHIC
// Concept: Feelings expressed through words that float, fragment, and reform in space
// Words become physical objects with weight and presence, occasionally dissolving and reforming

export function TypographicInterpretation({ palette }: TypographicInterpretationProps) {
  const [floatingWords, setFloatingWords] = useState<FloatingWord[]>([]);
  const [fragmentedNarrative, setFragmentedNarrative] = useState<string[]>([]);
  const [narrativeVisible, setNarrativeVisible] = useState(true);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Weight mapping
  const weightMap: Record<string, number> = {
    thin: 200,
    light: 300,
    regular: 400,
    medium: 500,
    bold: 700,
  };

  // Spacing mapping
  const spacingMap: Record<string, string> = {
    tight: "-0.02em",
    normal: "0em",
    wide: "0.1em",
    vast: "0.3em",
  };

  // Size mapping based on style
  const sizeMap: Record<string, string> = {
    whispered: "text-lg md:text-xl",
    spoken: "text-2xl md:text-3xl",
    declared: "text-4xl md:text-5xl",
    shouted: "text-6xl md:text-8xl",
  };

  // Initialize floating words
  useEffect(() => {
    const words = [...palette.words];
    const narrativeWords = palette.narrative.split(" ");
    
    const initialWords: FloatingWord[] = words.map((word, i) => ({
      id: `word-${i}`,
      word,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      scale: 0.8 + Math.random() * 0.6,
      rotation: (Math.random() - 0.5) * 20,
      opacity: 0.3 + Math.random() * 0.4,
      speed: 0.5 + Math.random() * 1.5,
      driftX: (Math.random() - 0.5) * 30,
      driftY: (Math.random() - 0.5) * 30,
    }));

    setFloatingWords(initialWords);
    setFragmentedNarrative(narrativeWords);
  }, [palette]);

  // SURPRISE: Double-click on any word to make it explode into letters
  const handleWordDoubleClick = useCallback((wordId: string, word: string) => {
    const letters = word.split("");
    const baseWord = floatingWords.find(w => w.id === wordId);
    if (!baseWord) return;

    // Remove original word and add letter fragments
    setFloatingWords(prev => {
      const filtered = prev.filter(w => w.id !== wordId);
      const letterFragments: FloatingWord[] = letters.map((letter, i) => ({
        id: `letter-${wordId}-${i}-${Date.now()}`,
        word: letter,
        x: baseWord.x + (i - letters.length / 2) * 3,
        y: baseWord.y,
        scale: baseWord.scale * 0.8,
        rotation: (Math.random() - 0.5) * 60,
        opacity: 0.6,
        speed: 1 + Math.random(),
        driftX: (Math.random() - 0.5) * 50,
        driftY: (Math.random() - 0.5) * 50,
      }));
      return [...filtered, ...letterFragments];
    });

    // After a delay, reform the word in a new position
    setTimeout(() => {
      setFloatingWords(prev => {
        const filtered = prev.filter(w => !w.id.startsWith(`letter-${wordId}`));
        return [...filtered, {
          ...baseWord,
          id: `word-reformed-${Date.now()}`,
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
          rotation: (Math.random() - 0.5) * 20,
        }];
      });
    }, 3000);
  }, [floatingWords]);

  // Toggle narrative visibility on click
  const handleNarrativeClick = useCallback(() => {
    setNarrativeVisible(prev => !prev);
  }, []);

  // Animation duration based on motion speed
  const baseDuration = palette.motion.speed === "glacial" ? 20 :
                       palette.motion.speed === "slow" ? 15 :
                       palette.motion.speed === "gentle" ? 10 :
                       palette.motion.speed === "moderate" ? 7 :
                       palette.motion.speed === "quick" ? 5 : 3;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: palette.colors.background }}
    >
      {/* Background texture based on atmosphere */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: palette.atmosphere.density === "sparse" 
            ? "none"
            : `radial-gradient(${palette.colors.secondary}20 1px, transparent 1px)`,
          backgroundSize: palette.atmosphere.density === "thick" ? "20px 20px" : "40px 40px",
        }}
      />

      {/* Central narrative */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center p-8 cursor-pointer"
        onClick={handleNarrativeClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <AnimatePresence mode="wait">
          {narrativeVisible ? (
            <motion.div
              key="narrative"
              className="max-w-3xl text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1 }}
            >
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-2">
                {fragmentedNarrative.map((word, i) => (
                  <motion.span
                    key={`narrative-${i}`}
                    className={`${sizeMap[palette.typography.style]} font-[family-name:var(--font-crimson)] inline-block`}
                    style={{
                      color: palette.colors.text,
                      fontWeight: weightMap[palette.typography.weight],
                      letterSpacing: spacingMap[palette.typography.spacing],
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 0.7,
                      y: 0,
                    }}
                    transition={{ 
                      delay: i * 0.1,
                      duration: 0.6,
                    }}
                    whileHover={{
                      scale: 1.1,
                      opacity: 1,
                      color: palette.colors.accent,
                      transition: { duration: 0.2 },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
              <motion.p
                className="mt-6 text-xs font-[family-name:var(--font-jetbrains)] opacity-30"
                style={{ color: palette.colors.text }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: fragmentedNarrative.length * 0.1 + 0.5 }}
              >
                click to dissolve
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="dissolved"
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
            >
              <p 
                className="text-sm font-[family-name:var(--font-jetbrains)]"
                style={{ color: palette.colors.text }}
              >
                click to reform
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating words */}
      {floatingWords.map((fw) => (
        <motion.div
          key={fw.id}
          className="absolute cursor-pointer select-none"
          style={{
            left: `${fw.x}%`,
            top: `${fw.y}%`,
            fontWeight: weightMap[palette.typography.weight],
            letterSpacing: spacingMap[palette.typography.spacing],
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: hoveredWord === fw.id ? 0.9 : fw.opacity,
            scale: hoveredWord === fw.id ? fw.scale * 1.3 : fw.scale,
            rotate: fw.rotation,
            x: [0, fw.driftX, 0],
            y: [0, fw.driftY, 0],
          }}
          transition={{
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 },
            x: { duration: baseDuration * fw.speed, repeat: Infinity, ease: "easeInOut" },
            y: { duration: baseDuration * fw.speed * 1.2, repeat: Infinity, ease: "easeInOut" },
          }}
          onMouseEnter={() => setHoveredWord(fw.id)}
          onMouseLeave={() => setHoveredWord(null)}
          onDoubleClick={() => handleWordDoubleClick(fw.id, fw.word)}
        >
          <span
            className="text-2xl md:text-4xl font-[family-name:var(--font-crimson)] italic whitespace-nowrap"
            style={{ 
              color: hoveredWord === fw.id ? palette.colors.accent : palette.colors.text,
              textShadow: hoveredWord === fw.id ? `0 0 30px ${palette.colors.accent}40` : "none",
              transition: "color 0.3s, text-shadow 0.3s",
            }}
          >
            {fw.word}
          </span>
        </motion.div>
      ))}

      {/* Atmosphere overlay based on time of day */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: palette.atmosphere.time === "dawn" 
            ? `linear-gradient(to top, ${palette.colors.primary}10, transparent)`
            : palette.atmosphere.time === "dusk"
            ? `linear-gradient(to top, ${palette.colors.secondary}20, transparent)`
            : palette.atmosphere.time === "night" || palette.atmosphere.time === "void"
            ? `radial-gradient(circle at 50% 50%, transparent 30%, ${palette.colors.background}80)`
            : "none",
        }}
      />

      {/* Instructions hint */}
      <motion.div
        className="absolute bottom-24 right-8 text-right"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 3, duration: 1 }}
      >
        <p 
          className="text-xs font-[family-name:var(--font-jetbrains)]"
          style={{ color: palette.colors.text }}
        >
          hover words to illuminate
          <br />
          double-click to fragment
        </p>
      </motion.div>
    </div>
  );
}
