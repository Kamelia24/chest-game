import { gsap } from 'gsap';

  /**
   * Returns a Promise that resolves after given amount of seconds.
   * @param {number} seconds
   * @returns {Promise<void>}
   */
  export function delay(seconds) {
    return new Promise(resolve => gsap.delayedCall(seconds, resolve));
  }

  /**
   * Returns true with the given probability (0–1).
   * @param {number} probability
   * @returns {boolean}
   */
  export function chance(probability) {
    return Math.random() < probability;
  }

  /**
   * Returns a random integer between min and max (inclusive).
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Picks a random element from an array.
   * @template T
   * @param {T[]} array
   * @returns {T}
   */
  export function pickRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Returns a random float between min and max.
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  export function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }