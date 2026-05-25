"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import type { EmotionalPalette } from "@/app/api/feel/route";

interface SpatialInterpretationProps {
  palette: EmotionalPalette;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

// INTERPRETATION 3: SPATIAL
// Concept: An atmospheric environment you inhabit, with depth, particles, and ambient sound
// The feeling becomes a space you exist within, complete with audio that responds to the emotion

export function SpatialInterpretation({ palette }: SpatialInterpretationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [depth, setDepth] = useState(0.5);
  const [audioStarted, setAudioStarted] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Depth layers create parallax effect
  const layerCount = useMemo(() => {
    return palette.atmosphere.density === "sparse" ? 2 :
           palette.atmosphere.density === "breathable" ? 3 :
           palette.atmosphere.density === "thick" ? 4 : 5;
  }, [palette.atmosphere.density]);

  // Initialize particles
  useEffect(() => {
    const colors = [palette.colors.primary, palette.colors.secondary, palette.colors.accent];
    const particleCount = palette.atmosphere.density === "sparse" ? 30 :
                          palette.atmosphere.density === "breathable" ? 60 :
                          palette.atmosphere.density === "thick" ? 100 : 150;

    const initialParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      initialParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random(), // 0 = far, 1 = near
        size: 2 + Math.random() * 6,
        speed: 0.2 + Math.random() * 0.8,
        opacity: 0.2 + Math.random() * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setParticles(initialParticles);
  }, [palette]);

  // Animate particles and breathing
  useEffect(() => {
    let startTime = Date.now();
    
    const breathDuration = palette.motion.speed === "glacial" ? 10000 :
                           palette.motion.speed === "slow" ? 7000 :
                           palette.motion.speed === "gentle" ? 5000 :
                           palette.motion.speed === "moderate" ? 4000 :
                           palette.motion.speed === "quick" ? 3000 : 2000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const phase = (Math.sin(elapsed / breathDuration * Math.PI * 2) + 1) / 2;
      setBreathPhase(phase);

      setParticles(prev => prev.map(p => {
        // Particles drift based on motion style
        let newX = p.x;
        let newY = p.y;
        
        const moveSpeed = p.speed * 0.02 * (1 - p.z * 0.5); // Far particles move slower

        switch (palette.motion.style) {
          case "floating":
            newY -= moveSpeed;
            newX += Math.sin(elapsed / 3000 + p.id) * 0.02;
            break;
          case "flowing":
            newX += moveSpeed * 2;
            newY += Math.sin(elapsed / 2000 + p.id) * 0.01;
            break;
          case "pulsing":
            // Particles move outward then inward from center
            const dx = p.x - 50;
            const dy = p.y - 50;
            const angle = Math.atan2(dy, dx);
            const pulse = Math.sin(elapsed / 1000) * 0.02;
            newX += Math.cos(angle) * pulse;
            newY += Math.sin(angle) * pulse;
            break;
          case "spiraling":
            const spiralAngle = Math.atan2(p.y - 50, p.x - 50) + moveSpeed * 0.1;
            const dist = Math.sqrt((p.x - 50) ** 2 + (p.y - 50) ** 2);
            newX = 50 + Math.cos(spiralAngle) * dist;
            newY = 50 + Math.sin(spiralAngle) * dist;
            break;
          case "trembling":
            newX += (Math.random() - 0.5) * 0.3;
            newY += (Math.random() - 0.5) * 0.3;
            break;
          case "dissolving":
            newY -= moveSpeed * 0.5;
            p.opacity -= 0.0005;
            break;
          default:
            newY -= moveSpeed;
        }

        // Wrap around edges
        if (newY < -5) newY = 105;
        if (newY > 105) newY = -5;
        if (newX < -5) newX = 105;
        if (newX > 105) newX = -5;

        return { ...p, x: newX, y: newY };
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [palette.motion.speed, palette.motion.style]);

  // SURPRISE: Ambient sound that responds to the emotional palette
  const startAudio = useCallback(() => {
    if (audioStarted || typeof window === "undefined") return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // Create oscillators based on palette soundscape
      const baseFreq = palette.soundscape.baseFrequency;
      const harmonics = palette.soundscape.harmonics;

      // Master gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 2);
      masterGain.connect(ctx.destination);

      // Base drone
      const baseOsc = ctx.createOscillator();
      baseOsc.type = "sine";
      baseOsc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      
      const baseGain = ctx.createGain();
      baseGain.gain.setValueAtTime(0.5, ctx.currentTime);
      
      baseOsc.connect(baseGain);
      baseGain.connect(masterGain);
      baseOsc.start();

      oscillatorsRef.current.push(baseOsc);
      gainNodesRef.current.push(baseGain);

      // Harmonic oscillators
      harmonics.forEach((multiplier, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(baseFreq * multiplier, ctx.currentTime);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2 / (i + 2), ctx.currentTime);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();

        oscillatorsRef.current.push(osc);
        gainNodesRef.current.push(gain);
      });

      // Rhythm modulation based on palette
      if (palette.soundscape.rhythm !== "none") {
        const rhythmInterval = palette.soundscape.rhythm === "heartbeat" ? 800 :
                               palette.soundscape.rhythm === "breath" ? 4000 :
                               palette.soundscape.rhythm === "waves" ? 6000 :
                               palette.soundscape.rhythm === "pulse" ? 500 : 2000;

        const modulateGain = () => {
          if (!audioContextRef.current) return;
          const now = audioContextRef.current.currentTime;
          gainNodesRef.current.forEach((gain, i) => {
            const currentVal = gain.gain.value;
            const targetVal = currentVal * (0.8 + Math.random() * 0.4);
            gain.gain.setValueAtTime(currentVal, now);
            gain.gain.linearRampToValueAtTime(targetVal, now + rhythmInterval / 2000);
          });
        };

        const rhythmIntervalId = setInterval(modulateGain, rhythmInterval);
        
        // Store for cleanup
        (audioContextRef.current as AudioContext & { rhythmIntervalId?: ReturnType<typeof setInterval> }).rhythmIntervalId = rhythmIntervalId;
      }

      setAudioStarted(true);
    } catch (e) {
      console.log("[v0] Audio not supported:", e);
    }
  }, [audioStarted, palette.soundscape]);

  // Cleanup audio
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch { /* ignore */ }
      });
      if (audioContextRef.current) {
        const ctx = audioContextRef.current as AudioContext & { rhythmIntervalId?: ReturnType<typeof setInterval> };
        if (ctx.rhythmIntervalId) {
          clearInterval(ctx.rhythmIntervalId);
        }
        ctx.close();
      }
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  // Scroll changes depth
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setDepth(prev => Math.max(0, Math.min(1, prev + e.deltaY * 0.001)));
  }, []);

  // Calculate ambient glow position based on time of day
  const glowPosition = useMemo(() => {
    switch (palette.atmosphere.time) {
      case "dawn": return { x: 30, y: 80 };
      case "morning": return { x: 70, y: 70 };
      case "noon": return { x: 50, y: 20 };
      case "afternoon": return { x: 70, y: 40 };
      case "dusk": return { x: 80, y: 70 };
      case "night": return { x: 50, y: 50 };
      case "void": return { x: 50, y: 50 };
      default: return { x: 50, y: 50 };
    }
  }, [palette.atmosphere.time]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden cursor-crosshair"
      style={{ 
        backgroundColor: palette.colors.background,
        perspective: "1000px",
      }}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      onClick={startAudio}
    >
      {/* Depth fog layers */}
      {Array.from({ length: layerCount }).map((_, i) => (
        <div
          key={`fog-${i}`}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at ${glowPosition.x}% ${glowPosition.y}%, ${palette.colors.primary}${Math.floor((i + 1) * 8).toString(16).padStart(2, '0')}, transparent 70%)`,
            transform: `translateZ(${(i - layerCount / 2) * 50 * (1 - depth)}px)`,
            opacity: 0.3 + breathPhase * 0.2,
          }}
        />
      ))}

      {/* Particles with depth */}
      {particles.map((p) => {
        const depthScale = 0.3 + p.z * 0.7;
        const blur = (1 - p.z) * 3;
        const parallaxX = (mousePos.x - 0.5) * (1 - p.z) * 30;
        const parallaxY = (mousePos.y - 0.5) * (1 - p.z) * 30;
        
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size * depthScale,
              height: p.size * depthScale,
              backgroundColor: p.color,
              opacity: p.opacity * (0.5 + p.z * 0.5) * (0.8 + breathPhase * 0.2),
              filter: `blur(${blur}px)`,
              transform: `translate(${parallaxX}px, ${parallaxY}px)`,
              boxShadow: p.z > 0.7 ? `0 0 ${p.size * 2}px ${p.color}40` : "none",
            }}
          />
        );
      })}

      {/* Central void/light based on geometry */}
      {palette.geometry.shape === "voids" && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "30vmin",
            height: "30vmin",
            background: `radial-gradient(circle, ${palette.colors.background} 0%, transparent 70%)`,
            boxShadow: `0 0 100px 50px ${palette.colors.background}`,
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 0.9, 0.8],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Narrative as atmospheric text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center p-12 pointer-events-none"
        style={{
          transform: `translateZ(${50 * (1 - depth)}px)`,
        }}
      >
        <p
          className="text-center text-2xl md:text-4xl font-[family-name:var(--font-crimson)] italic leading-relaxed max-w-2xl"
          style={{
            color: palette.colors.text,
            opacity: 0.3 + breathPhase * 0.15,
            textShadow: `0 0 40px ${palette.colors.primary}30`,
          }}
        >
          {palette.narrative}
        </p>
      </motion.div>

      {/* Words as distant constellations */}
      {palette.words.map((word, i) => {
        const angle = (i / palette.words.length) * Math.PI * 2;
        const radius = 35 + (i % 3) * 10;
        const x = 50 + Math.cos(angle) * radius;
        const y = 50 + Math.sin(angle) * radius;
        const wordDepth = 0.2 + (i % 4) * 0.2;
        
        return (
          <motion.span
            key={word}
            className="absolute text-xs font-[family-name:var(--font-jetbrains)] pointer-events-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              color: palette.colors.text,
              opacity: 0.1 + wordDepth * 0.2,
              transform: `translate(-50%, -50%) scale(${0.8 + wordDepth * 0.4})`,
              filter: `blur(${(1 - wordDepth) * 2}px)`,
            }}
            animate={{
              opacity: [0.1 + wordDepth * 0.2, 0.2 + wordDepth * 0.3, 0.1 + wordDepth * 0.2],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {word}
          </motion.span>
        );
      })}

      {/* Temperature indicator */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: palette.atmosphere.temperature === "frozen" 
            ? `linear-gradient(to bottom, ${palette.colors.secondary}10, transparent 30%)`
            : palette.atmosphere.temperature === "burning"
            ? `linear-gradient(to top, ${palette.colors.primary}15, transparent 40%)`
            : "none",
        }}
      />

      {/* Audio prompt */}
      {!audioStarted && (
        <motion.div
          className="absolute bottom-24 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <p 
            className="text-xs font-[family-name:var(--font-jetbrains)] text-center"
            style={{ color: palette.colors.text }}
          >
            click anywhere to begin ambient sound
            <br />
            <span className="opacity-50">scroll to shift depth</span>
          </p>
        </motion.div>
      )}

      {/* Depth indicator */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 h-32 w-1 rounded-full overflow-hidden opacity-20">
        <div 
          className="absolute bottom-0 w-full rounded-full transition-all duration-300"
          style={{ 
            height: `${depth * 100}%`,
            backgroundColor: palette.colors.accent,
          }}
        />
      </div>
    </div>
  );
}
