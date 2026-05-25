"use client";

import { useState, useCallback } from "react";
import type { EmotionalPalette } from "./api/feel/route";
import { FluidInterpretation } from "@/components/interpretations/fluid";
import { TypographicInterpretation } from "@/components/interpretations/typographic";
import { SpatialInterpretation } from "@/components/interpretations/spatial";
import { InputPortal } from "@/components/input-portal";

type InterpretationMode = "fluid" | "typographic" | "spatial";

const modeLabels: Record<InterpretationMode, { name: string; concept: string }> = {
  fluid: {
    name: "Fluid",
    concept: "Emotions as liquid organisms that breathe and respond to your presence"
  },
  typographic: {
    name: "Typographic", 
    concept: "Feelings expressed through words that float, fragment, and reform in space"
  },
  spatial: {
    name: "Spatial",
    concept: "An atmospheric environment you inhabit, with depth, particles, and ambient sound"
  },
};

export default function MoodboardPage() {
  const [mode, setMode] = useState<InterpretationMode>("fluid");
  const [palette, setPalette] = useState<EmotionalPalette | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentFeeling, setCurrentFeeling] = useState("");
  const [showInput, setShowInput] = useState(true);

  const generateMoodboard = useCallback(async (feeling: string) => {
    if (!feeling.trim()) return;
    
    setIsGenerating(true);
    setCurrentFeeling(feeling);
    
    try {
      const response = await fetch("/api/feel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeling }),
      });
      
      if (!response.ok) throw new Error("Failed to generate");
      
      const data = await response.json();
      setPalette(data);
      setShowInput(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const resetMoodboard = useCallback(() => {
    setPalette(null);
    setShowInput(true);
    setCurrentFeeling("");
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Mode selector - visible when palette is active */}
      {palette && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1 rounded-full bg-black/30 backdrop-blur-xl border border-white/10">
          {(Object.keys(modeLabels) as InterpretationMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-full text-sm font-[family-name:var(--font-space-grotesk)] transition-all duration-300 ${
                mode === m 
                  ? "bg-white/20 text-white" 
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {modeLabels[m].name}
            </button>
          ))}
        </div>
      )}

      {/* Concept display */}
      {palette && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md text-center">
          <p className="text-xs text-white/40 font-[family-name:var(--font-jetbrains)] tracking-wide">
            {modeLabels[mode].concept}
          </p>
        </div>
      )}

      {/* Reset button */}
      {palette && (
        <button
          onClick={resetMoodboard}
          className="fixed top-6 right-6 z-50 px-4 py-2 text-sm text-white/40 hover:text-white/80 font-[family-name:var(--font-space-grotesk)] transition-colors duration-300"
        >
          new feeling
        </button>
      )}

      {/* Current feeling display */}
      {palette && (
        <div className="fixed top-6 left-6 z-50 max-w-xs">
          <p className="text-xs text-white/30 font-[family-name:var(--font-jetbrains)] mb-1">
            feeling:
          </p>
          <p className="text-sm text-white/60 font-[family-name:var(--font-crimson)] italic leading-relaxed">
            &ldquo;{currentFeeling}&rdquo;
          </p>
        </div>
      )}

      {/* Input Portal */}
      {showInput && (
        <InputPortal 
          onSubmit={generateMoodboard} 
          isGenerating={isGenerating}
        />
      )}

      {/* Interpretations */}
      {palette && (
        <div className="absolute inset-0">
          {mode === "fluid" && <FluidInterpretation palette={palette} />}
          {mode === "typographic" && <TypographicInterpretation palette={palette} />}
          {mode === "spatial" && <SpatialInterpretation palette={palette} />}
        </div>
      )}
    </main>
  );
}
