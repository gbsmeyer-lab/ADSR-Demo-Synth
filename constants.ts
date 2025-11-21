
// C Minor Pentatonic Scale: C, Eb, F, G, Bb, C
// Frequencies calculated for C4 to G5 range
export const KEYS: Record<string, number> = {
  'a': 261.63, // C4
  'w': 261.63, // C4 (mapped for convenience)
  's': 311.13, // Eb4
  'e': 311.13, // Eb4
  'd': 349.23, // F4
  'f': 392.00, // G4
  't': 392.00, // G4
  'g': 466.16, // Bb4
  'y': 466.16, // Bb4
  'h': 523.25, // C5
  'u': 523.25, // C5
  'j': 622.25, // Eb5
  'k': 698.46, // F5
  'o': 698.46, // F5
  'l': 783.99, // G5
};

export const NOTE_NAMES: Record<string, string> = {
  'a': 'C4', 's': 'Eb4', 'd': 'F4', 'f': 'G4', 
  'g': 'Bb4', 'h': 'C5', 'j': 'Eb5', 'k': 'F5', 'l': 'G5'
};
