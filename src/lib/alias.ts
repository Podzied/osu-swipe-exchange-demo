// Adjectives (colors)
const ADJECTIVES = [
  "Red",
  "Blue",
  "Green",
  "Gold",
  "Silver",
  "Purple",
  "Orange",
  "Crimson",
  "Scarlet",
  "Gray",
  "Black",
  "White",
  "Coral",
  "Teal",
  "Navy",
  "Amber",
];

// Nouns (animals, mascot-themed)
const NOUNS = [
  "Buckeye",
  "Cardinal",
  "Falcon",
  "Eagle",
  "Hawk",
  "Bear",
  "Wolf",
  "Lion",
  "Tiger",
  "Panther",
  "Fox",
  "Owl",
  "Raven",
  "Phoenix",
  "Dragon",
  "Sparrow",
];

/**
 * Generate a random pickup alias like "Blue Falcon 42"
 */
export function generatePickupAlias(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 99) + 1;

  return `${adjective} ${noun} ${number}`;
}

/**
 * Check if an alias matches the expected format
 */
export function isValidAlias(alias: string): boolean {
  const parts = alias.split(" ");
  if (parts.length !== 3) return false;

  const [adjective, noun, numberStr] = parts;
  const number = parseInt(numberStr, 10);

  return (
    ADJECTIVES.includes(adjective) &&
    NOUNS.includes(noun) &&
    !isNaN(number) &&
    number >= 1 &&
    number <= 99
  );
}
