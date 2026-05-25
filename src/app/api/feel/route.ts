import { generateText, Output } from "ai";
import { z } from "zod";

const EmotionalPaletteSchema = z.object({
  colors: z.object({
    primary: z.string().describe("Hex color that captures the core feeling"),
    secondary: z.string().describe("Hex color for supporting emotional tone"),
    accent: z.string().describe("Hex color for highlights and emphasis"),
    background: z.string().describe("Hex color for the base atmosphere"),
    text: z.string().describe("Hex color for readable text on this background"),
  }),
  motion: z.object({
    speed: z.enum(["glacial", "slow", "gentle", "moderate", "quick", "frantic"]),
    style: z.enum(["floating", "pulsing", "flowing", "trembling", "expanding", "dissolving", "spiraling"]),
    intensity: z.number().min(0).max(1).describe("0-1 scale of motion intensity"),
  }),
  typography: z.object({
    weight: z.enum(["thin", "light", "regular", "medium", "bold"]),
    spacing: z.enum(["tight", "normal", "wide", "vast"]),
    style: z.enum(["whispered", "spoken", "declared", "shouted"]),
  }),
  atmosphere: z.object({
    density: z.enum(["sparse", "breathable", "thick", "suffocating"]),
    temperature: z.enum(["frozen", "cool", "neutral", "warm", "burning"]),
    time: z.enum(["dawn", "morning", "noon", "afternoon", "dusk", "night", "void"]),
  }),
  words: z.array(z.string()).describe("5-8 evocative words that orbit this feeling"),
  soundscape: z.object({
    baseFrequency: z.number().min(100).max(800).describe("Hz for ambient drone"),
    harmonics: z.array(z.number()).describe("2-4 frequency multipliers for overtones"),
    rhythm: z.enum(["heartbeat", "breath", "waves", "static", "pulse", "none"]),
  }),
  geometry: z.object({
    shape: z.enum(["circles", "fragments", "waves", "threads", "voids", "clusters"]),
    edges: z.enum(["sharp", "soft", "dissolving", "fractured"]),
    scale: z.enum(["microscopic", "intimate", "human", "vast", "cosmic"]),
  }),
  narrative: z.string().describe("A single sentence that the feeling might whisper to itself"),
});

export type EmotionalPalette = z.infer<typeof EmotionalPaletteSchema>;

export async function POST(req: Request) {
  try {
    const { feeling } = await req.json();

    if (!feeling || typeof feeling !== "string") {
      return Response.json({ error: "No feeling provided" }, { status: 400 });
    }

    const result = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      output: Output.object({ schema: EmotionalPaletteSchema }),
      prompt: `You are an emotional synesthete—you experience feelings as colors, shapes, movements, and sounds simultaneously. 

A human has described this feeling to you:
"${feeling}"

Translate this feeling into a sensory palette. Don't describe the feeling in words—translate it into pure aesthetic qualities.

Consider:
- What colors would this feeling bleed into a room?
- How would it move? Fast or slow? Pulsing or flowing?
- What visual density does it have? Sparse and lonely, or thick and overwhelming?
- What temperature is it?
- What time of day does it belong to?
- What shapes emerge from it?
- What words orbit around it without quite touching it?
- If it made a sound, what frequency would hum?

Be specific and unexpected. Avoid clichés. Find the unique visual/sonic signature of THIS particular feeling.`,
    });

    return Response.json(result.output);
  } catch (error) {
    console.error("Error generating emotional palette:", error);
    return Response.json(
      { error: "Failed to generate emotional palette" },
      { status: 500 }
    );
  }
}
