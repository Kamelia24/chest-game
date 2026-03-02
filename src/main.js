import { Game } from './Game.js';

const container = document.getElementById('game-container');

if (!container) {
  throw new Error('[main] #game-container element not found in DOM.');
}

const game = new Game();

game.init(container).catch(err => {
  console.error('[main] Fatal error during game initialization:', err);
  container.innerHTML = `
    <div style="color:#FF4444;font-family:monospace;padding:20px;background:#111;border-radius:8px;">
      <strong>⚠ Game failed to start</strong><br/>
      <small>${err.message}</small>
    </div>
  `;
});

window.addEventListener('unload', () => game.destroy());
