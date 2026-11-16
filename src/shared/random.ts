// This helper makes a repeatable random source from a seed value.
// It is useful when a daily puzzle or board must stay the same for the same input.
export function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

// FNV-1a hash. It changes a text into a 32-bit number, so a puzzle ID or a key can be a seed.
export function seedOf(text: string): number {
  let hash = 0x81_1c_9d_c5;
  for (const byte of new TextEncoder().encode(text)) {
    hash = Math.imul(hash ^ byte, 0x01_00_01_93);
  }
  return hash >>> 0;
}

// This helper selects one item of a list. It gives undefined for an empty list.
// The default random source is "Math.random". A test can give a source from "makeRandom".
export function pickOne<Item>(
  items: readonly Item[],
  random: () => number = Math.random,
): Item | undefined {
  return items[Math.floor(random() * items.length)];
}
