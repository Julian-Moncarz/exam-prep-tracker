import confetti from 'canvas-confetti';

// Create audio instance for the celebration sound
const celebrationSound = new Audio('/goodresult-82807.mp3');

/**
 * Triggers a celebratory confetti animation from the top-center of the screen
 * Medium celebration style (1-2 seconds) with random bright colors
 * Also plays a sparkle/whoosh sound effect
 */
export function triggerConfetti() {
  // Play the celebration sound - whoosh!
  celebrationSound.currentTime = 0; // reset to start in case it's already playing
  celebrationSound.play().catch(err => {
    // Silently fail if sound can't play (e.g., user hasn't interacted with page yet)
    console.debug('Could not play celebration sound:', err);
  });

  // Fire confetti from top-center with a spread
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.3 }, // top-center-ish of screen
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500'], // bright rainbow colors
    ticks: 200, // ~2 seconds at 60fps
    gravity: 1,
    scalar: 1.2, // slightly bigger particles
  });

  // Add a second burst slightly delayed for more dramatic effect
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { x: 0.5, y: 0.3 },
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500'],
      ticks: 150,
      gravity: 1,
      scalar: 1.0,
    });
  }, 150);
}
