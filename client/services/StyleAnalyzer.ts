import { Item, Outfit } from "@/types";

const STYLE_VIBES = [
  "giving girl boss on her way to dominate the upper east side",
  "channeling Ibiza vibes getting high with your friends",
  "serving beachy mermaid realness",
  "embodying Blair Waldorf's Manhattan elite energy",
  "radiating coastal grandmother chic",
  "bringing Y2K butterfly princess energy",
  "serving corporate girlboss meets street style icon",
];

export function generateStyleDescription(
  colors: string[],
  items: Item[],
  outfits: Outfit[]
): string {
  // In a real implementation, you'd use more sophisticated logic
  // to analyze the style based on colors, items, and outfits
  return STYLE_VIBES[Math.floor(Math.random() * STYLE_VIBES.length)];
}
