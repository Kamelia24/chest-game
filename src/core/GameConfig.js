export const GameConfig = Object.freeze({
  // Canvas
  WIDTH: window.innerWidth,
  HEIGHT: window.innerHeight,
  BACKGROUND_COLOR: 0x0d0d2b,

  // Chest layout
  CHEST_COUNT: 6,
  CHEST_COLS: 2,
  CHEST_ROWS: 3,
  CHEST_H_SPACING: 300,
  CHEST_V_SPACING: 200,
  CHEST_START_X: window.innerWidth / 2 - 150,
  CHEST_START_Y: 210,

  // Chest size
  CHEST_WIDTH: 240,
  CHEST_LID_HEIGHT: 20,
  CHEST_BODY_HEIGHT: 90,

  // Win probabilities (0–1)
  WIN_CHANCE: 0.5,        // 50% chance chest is a winner
  BONUS_CHANCE: 0.35,     // 35% chance a win is a BONUS win

  // Win amounts
  REGULAR_WIN_MIN: 0.5,
  REGULAR_WIN_MAX: 500,
  BONUS_WIN_MIN: 1000,
  BONUS_WIN_MAX: 10000,

  // Animation durations (seconds)
  CHEST_OPEN_DURATION: 0.3,
  CHEST_BOUNCE_DURATION: 0.2,
  PARTICLE_LIFETIME: 0.6,
  BONUS_SCREEN_DURATION: 1.5,
  RESULT_DISPLAY_DURATION: 1,
  RESET_DELAY: 0.5,

  // Play button
  PLAY_BTN_RADIUS: 55,
  PLAY_BTN_X: window.innerWidth / 2,
  PLAY_BTN_Y: 800,

  // Colors
  COLORS: {
    CHEST_BODY: 0x8B4513,
    CHEST_LID: 0xA0522D,
    CHEST_TRIM: 0xDAA520,
    CHEST_LOCK: 0xFFD700,
    CHEST_OPEN_GLOW_WIN: 0xFFD700,
    CHEST_OPEN_GLOW_BONUS: 0xFF6B00,
    CHEST_OPEN_GLOW_LOSE: 0x4444AA,
    PLAY_BTN_IDLE: 0x22DD88,
    PLAY_BTN_DISABLED: 0x336655,
    BONUS_BG: 0x1a0a00,
    TEXT_PRIMARY: 0xFFFFFF,
    TEXT_WIN: 0xFFD700,
    TEXT_BONUS: 0xFF6B00,
    TEXT_LOSE: 0x8888CC,
    PARTICLE_WIN: [0xFFD700, 0xFFA500, 0xFF6B00, 0xFFFFFF],
    PARTICLE_BONUS: [0xFF6B00, 0xFF0000, 0xFFD700, 0xFFFFFF],
  },

  // Chest states
  CHEST_STATE: Object.freeze({
    IDLE: 'IDLE',
    ENABLED: 'ENABLED',
    OPENING: 'OPENING',
    OPEN_WIN: 'OPEN_WIN',
    OPEN_BONUS: 'OPEN_BONUS',
    OPEN_LOSE: 'OPEN_LOSE',
    DISABLED: 'DISABLED',
  }),

  // Game states
  GAME_STATE: Object.freeze({
    IDLE: 'IDLE',
    PLAYING: 'PLAYING',
    CHEST_OPENING: 'CHEST_OPENING',
    BONUS_SCREEN: 'BONUS_SCREEN',
    RESETTING: 'RESETTING',
  }),
});
