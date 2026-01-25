import { GoogleGenAI } from "@google/genai";
import { VALID_WORDS } from "../constants";

// Helper to normalize strings (remove accents)
function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

/**
 * Validates if the word is roughly a valid 5-letter Spanish word.
 */
function isValidWord(word: string): boolean {
    return word.length === 5 && /^[A-ZÑ]+$/.test(word);
}

/**
 * Generates a pseudo-random number based on a string seed.
 * This ensures everyone with the same Room Code gets the same result.
 */
function seededRandom(seed: string): number {
    let h = 0xdeadbeef;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
    }
    return ((h ^ h >>> 16) >>> 0) / 4294967296;
}

/**
 * Get a word deterministically for multiplayer based on Room Code + Category + Date (optional)
 * This bypasses Gemini to ensure consistency across devices without a database.
 */
export function getMultiplayerWord(category: string, roomCode: string): string {
    // Create a unique seed combining the room and category
    // We append the date if we wanted a new word every day, but for a session based room,
    // just the code is fine. Let's make it consistent for the session.
    const seed = `${roomCode.toUpperCase()}-${category.toUpperCase()}`;
    const rng = seededRandom(seed);
    
    // Filter words if we had categorized lists locally, but since we have one big list:
    const words = Array.from(VALID_WORDS);
    
    // Pick word using the seeded random
    const index = Math.floor(rng * words.length);
    return words[index];
}

export async function getWordFromCategory(category: string): Promise<string> {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("No API_KEY found. Using fallback.");
    return getRandomFallbackWord();
  }

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera una única palabra de 5 letras en español relacionada con la categoría "${category}".
      Reglas:
      1. La palabra debe tener exactamente 5 letras.
      2. La palabra debe ser válida en español.
      3. No uses tildes ni acentos en la respuesta (ejemplo: usa "ARBOL" en vez de "ÁRBOL", "AVION" en vez de "AVIÓN").
      4. Si la palabra tiene 'Ñ', úsala.
      5. Responde ÚNICAMENTE con la palabra, sin explicaciones ni signos de puntuación.`,
    });

    const text = response.text?.trim().toUpperCase();
    if (text && isValidWord(text)) {
        return text;
    } else {
        console.warn("Gemini returned invalid format:", text);
        return getRandomFallbackWord();
    }

  } catch (error) {
    console.error("Error fetching word from Gemini:", error);
    return getRandomFallbackWord();
  }
}

function getRandomFallbackWord(): string {
  const words = Array.from(VALID_WORDS);
  return words[Math.floor(Math.random() * words.length)];
}

export async function checkWordValidity(word: string): Promise<boolean> {
    if (VALID_WORDS.has(word)) return true;
    return false;
}
