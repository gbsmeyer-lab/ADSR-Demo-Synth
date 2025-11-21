
// C Blues Scale: C, Eb, F, Gb, G, Bb, C
// Frequencies calculated for C4 to C5 range
export const KEYS: Record<string, number> = {
  'a': 261.63, // C4
  'w': 261.63, // C4 (mapped for convenience)
  's': 311.13, // Eb4
  'e': 311.13, // Eb4
  'd': 349.23, // F4
  'f': 369.99, // Gb4 (Blue note)
  't': 369.99, // Gb4
  'g': 392.00, // G4
  'y': 392.00, // G4
  'h': 466.16, // Bb4
  'u': 466.16, // Bb4
  'j': 523.25, // C5
  'k': 622.25, // Eb5
  'o': 622.25, // Eb5
  'l': 698.46, // F5
};

export const NOTE_NAMES: Record<string, string> = {
  'a': 'C4', 's': 'Eb4', 'd': 'F4', 'f': 'Gb4', 
  'g': 'G4', 'h': 'Bb4', 'j': 'C5', 'k': 'Eb5', 'l': 'F5'
};
