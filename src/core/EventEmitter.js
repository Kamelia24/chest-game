export class EventEmitter {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} listener
   * @returns {Function} Unsubscribe function
   */
  on(event, listener) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(listener);
    return () => this.off(event, listener);
  }

  /**
   * Subscribe once — auto-removes after first emit.
   * @param {string} event
   * @param {Function} listener
   */
  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  /**
   * Unsubscribe from an event.
   * @param {string} event
   * @param {Function} listener
   */
  off(event, listener) {
    this._listeners.get(event)?.delete(listener);
  }

  /**
   * Emit an event with optional payload.
   * @param {string} event
   * @param {...*} args
   */
  emit(event, ...args) {
    this._listeners.get(event)?.forEach(listener => {
      try {
        listener(...args);
      } catch (err) {
        console.error(`[EventEmitter] Error in listener for "${event}":`, err);
      }
    });
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    this._listeners.clear();
  }
}

export const GameEvents = new EventEmitter();

export const EVENTS = Object.freeze({
  PLAY_CLICKED: 'PLAY_CLICKED',
  CHEST_CLICKED: 'CHEST_CLICKED',
  CHEST_OPEN_COMPLETE: 'CHEST_OPEN_COMPLETE',
  BONUS_SCREEN_COMPLETE: 'BONUS_SCREEN_COMPLETE',
  ALL_CHESTS_OPENED: 'ALL_CHESTS_OPENED',
  RESET_COMPLETE: 'RESET_COMPLETE',
  STATE_CHANGED: 'STATE_CHANGED',
});
