"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import type { EmotionalPalette } from "@/app/api/feel/route";

interface FluidInterpretationProps {
  palette: EmotionalPalette;
}

interface Blob {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  phase: number;
}

// INTERPRETATION 1: FLUID
// Concept: Emotions as liquid organisms that breathe and respond to your presence
// The interface becomes a living petri dish where feelings pool, merge, and react to cursor movement

export function FluidInterpretation({ palette }: FluidInterpretationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; time: number }[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastClickRef = useRef<number>(0);

  // Motion speed mapping
  const speedMap = useMemo(() => ({
    glacial: 0.0002,
    slow: 0.0005,
    gentle: 0.001,
    moderate: 0.002,
    quick: 0.004,
    frantic: 0.008,
  }), []);

  const speed = speedMap[palette.motion.speed];

  // Initialize blobs
  useEffect(() => {
    const colors = [palette.colors.primary, palette.colors.secondary, palette.colors.accent];
    const initialBlobs: Blob[] = [];
    const count = palette.atmosphere.density === "sparse" ? 3 : 
                  palette.atmosphere.density === "breathable" ? 5 : 
                  palette.atmosphere.density === "thick" ? 8 : 12;

    for (let i = 0; i < count; i++) {
      initialBlobs.push({
        id: i,
        x: Math.random(),
        y: Math.random(),
        size: 0.15 + Math.random() * 0.25,
        color: colors[i % colors.length],
        velocity: { 
          x: (Math.random() - 0.5) * speed * 10, 
          y: (Math.random() - 0.5) * speed * 10 
        },
        phase: Math.random() * Math.PI * 2,
      });
    }
    setBlobs(initialBlobs);
  }, [palette, speed]);

  // Animate blobs
  useEffect(() => {
    const animate = () => {
      setBlobs(prev => prev.map(blob => {
        // Move towards/away from mouse based on temperature
        const dx = mousePos.x - blob.x;
        const dy = mousePos.y - blob.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const attraction = palette.atmosphere.temperature === "frozen" ? -0.0001 :
                          palette.atmosphere.temperature === "cool" ? -0.00005 :
                          palette.atmosphere.temperature === "warm" ? 0.00005 :
                          palette.atmosphere.temperature === "burning" ? 0.0001 : 0;

        let newVx = blob.velocity.x + (dist > 0.01 ? (dx / dist) * attraction : 0);
        let newVy = blob.velocity.y + (dist > 0.01 ? (dy / dist) * attraction : 0);

        // Add organic movement
        newVx += Math.sin(blob.phase + Date.now() * speed) * speed * 0.5;
        newVy += Math.cos(blob.phase + Date.now() * speed * 0.7) * speed * 0.5;

        // Damping
        newVx *= 0.99;
        newVy *= 0.99;

        let newX = blob.x + newVx;
        let newY = blob.y + newVy;

        // Soft boundaries
        if (newX < 0.1) newVx += 0.001;
        if (newX > 0.9) newVx -= 0.001;
        if (newY < 0.1) newVy += 0.001;
        if (newY > 0.9) newVy -= 0.001;

        return {
          ...blob,
          x: Math.max(0, Math.min(1, newX)),
          y: Math.max(0, Math.min(1, newY)),
          velocity: { x: newVx, y: newVy },
        };
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mousePos, palette, speed]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  // SURPRISE: Click creates ripples that push blobs away
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const now = Date.now();
    if (now - lastClickRef.current < 300) return;
    lastClickRef.current = now;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    // Add ripple
    setRipples(prev => [...prev, { id: now, x: clickX, y: clickY, time: now }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== now));
    }, 2000);

    // Push blobs away
    setBlobs(prev => prev.map(blob => {
      const dx = blob.x - clickX;
      const dy = blob.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.3 && dist > 0.01) {
        return {
          ...blob,
          velocity: {
            x: blob.velocity.x + (dx / dist) * 0.02,
            y: blob.velocity.y + (dy / dist) * 0.02,
          }
        };
      }
      return blob;
    }));
  }, []);

  // Breathing animation speed
  const breathDuration = palette.motion.speed === "glacial" ? 8 :
                         palette.motion.speed === "slow" ? 6 :
                         palette.motion.speed === "gentle" ? 4 :
                         palette.motion.speed === "moderate" ? 3 :
                         palette.motion.speed === "quick" ? 2 : 1.5;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden fluid-cursor"
      style={{ backgroundColor: palette.colors.background }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Ambient glow layer */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${palette.colors.primary}40 0%, transparent 50%)`,
          transition: "background 0.3s ease-out",
        }}
      />

      {/* Blobs */}
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className="absolute rounded-full"
          style={{
            left: `${blob.x * 100}%`,
            top: `${blob.y * 100}%`,
            width: `${blob.size * 50}vmin`,
            height: `${blob.size * 50}vmin`,
            background: `radial-gradient(circle at 30% 30%, ${blob.color}90, ${blob.color}40, transparent)`,
            filter: `blur(${palette.geometry.edges === "dissolving" ? 60 : palette.geometry.edges === "soft" ? 40 : 20}px)`,
            transform: "translate(-50%, -50%)",
            mixBlendMode: "screen",
          }}
          animate={{
            scale: [1, 1 + palette.motion.intensity * 0.15, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: breathDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: blob.phase,
          }}
        />
      ))}

      {/* Ripples from clicks */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${ripple.x * 100}%`,
            top: `${ripple.y * 100}%`,
            transform: "translate(-50%, -50%)",
            border: `1px solid ${palette.colors.accent}`,
          }}
          initial={{ width: 0, height: 0, opacity: 0.8 }}
          animate={{ width: "40vmin", height: "40vmin", opacity: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      ))}

      {/* Narrative whisper */}
      <motion.div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-lg text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1, duration: 2 }}
      >
        <p 
          className="text-lg font-[family-name:var(--font-crimson)] italic leading-relaxed"
          style={{ color: palette.colors.text }}
        >
          {palette.narrative}
        </p>
      </motion.div>

      {/* Floating words */}
      {palette.words.map((word, i) => (
        <motion.span
          key={word}
          className="absolute text-sm font-[family-name:var(--font-jetbrains)] pointer-events-none select-none"
          style={{
            color: palette.colors.text,
            opacity: 0.2,
            left: `${15 + (i * 12) % 70}%`,
            top: `${20 + (i * 17) % 60}%`,
          }}
          animate={{
            y: [0, -10, 5, 0],
            x: [0, 5, -5, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        >
          {word}
        </motion.span>
      ))}

      {/* Custom cursor */}
      <motion.div
        className="fixed w-6 h-6 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{
          left: mousePos.x * (containerRef.current?.clientWidth || 0),
          top: mousePos.y * (containerRef.current?.clientHeight || 0),
          backgroundColor: palette.colors.accent,
          transform: "translate(-50%, -50%)",
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}
