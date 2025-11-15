/**
 * Generate a short, memorable game ID
 * Format: 5 characters (letters + numbers), uppercase
 * Example: A3K9Z, B7R2M, etc.
 */
export function generateGameId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking: 0,O,1,I
  let id = '';

  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    id += chars[randomIndex];
  }

  return id;
}

/**
 * Validate game ID format
 */
export function isValidGameId(id: string): boolean {
  return /^[A-Z0-9]{5}$/.test(id);
}
