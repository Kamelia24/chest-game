import * as PIXI from 'pixi.js';
import { GameConfig } from './core/GameConfig.js';
import { GameController } from './core/GameController.js';
import { Chest } from './objects/Chest.js';
import { PlayButton } from './objects/PlayButton.js';
import { BonusScreen } from './screens/BonusScreen.js';
import { GameBackground } from './screens/GameBackground.js';

export class Game {
  constructor() {
    this._app = null;
    this._controller = null;
    this._chests = [];
    this._playButton = null;
    this._bonusScreen = null;
    this._background = null;
  }

  /**
   * Initialize the PIXI application and all game objects,
   * then attach the canvas to the given DOM element.
   * @param {HTMLElement} container
   */
  async init(container) {
    this._createApp(container);
    await this._loadAssets();
    this._buildScene();
    this._createController();
    this._setupResizeHandler(container);

    console.info('[Game] Initialized successfully.');
  }

  destroy() {
    this._controller?.destroy();
    this._chests.forEach(c => c.destroy());
    this._playButton?.destroy();
    this._bonusScreen?.destroy();
    this._background?.destroy();
    this._app?.destroy(true, { children: true });
    console.info('[Game] Destroyed.');
  }

  _createApp(container) {
    this._app = new PIXI.Application({
      width: GameConfig.WIDTH,
      height: GameConfig.HEIGHT,
      backgroundColor: GameConfig.BACKGROUND_COLOR,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });

    container.appendChild(this._app.view);
  }

  async _loadAssets() {
    // Currently no assets are being used
    return Promise.resolve();
  }

  _buildScene() {
    const stage = this._app.stage;
    stage.sortableChildren = true;

    this._background = new GameBackground(stage);
    this._chests = this._createChests(stage);
    this._playButton = new PlayButton(stage);
    this._bonusScreen = new BonusScreen(stage);
  }

  /**
   * Create 6 chests in a 3x2 grid.
   * @param {PIXI.Container} stage
   * @returns {Chest[]}
   */
  _createChests(stage) {
    const chests = [];
    const { CHEST_COUNT, CHEST_COLS, CHEST_H_SPACING, CHEST_V_SPACING,
      CHEST_START_X, CHEST_START_Y } = GameConfig;

    for (let i = 0; i < CHEST_COUNT; i++) {
      const col = i % CHEST_COLS;
      const row = Math.floor(i / CHEST_COLS);
      const x = CHEST_START_X + col * CHEST_H_SPACING;
      const y = CHEST_START_Y + row * CHEST_V_SPACING;

      chests.push(new Chest({ id: i, x, y, stage }));
    }

    return chests;
  }

  _createController() {
    this._controller = new GameController({
      chests: this._chests,
      playButton: this._playButton,
      bonusScreen: this._bonusScreen,
    });
  }

  /**
   * Scale canvas to fit the viewport while preserving aspect ratio.
   * @param {HTMLElement} container
   */
  _setupResizeHandler(container) {
    const resize = () => {
      const { WIDTH, HEIGHT } = GameConfig;
      const scaleX = window.innerWidth / WIDTH;
      const scaleY = window.innerHeight / HEIGHT;
      const scale = Math.min(scaleX, scaleY);

      this._app.view.style.width = `${WIDTH * scale}px`;
      this._app.view.style.height = `${HEIGHT * scale}px`;
    };

    resize();
    window.addEventListener('resize', resize);
    this._onResizeCleanup = () => window.removeEventListener('resize', resize);
  }
}
