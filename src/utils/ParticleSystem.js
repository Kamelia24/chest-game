import * as PIXI from 'pixi.js';
import gsap from 'gsap/all';
import { getRandomFloat, pickRandomElement } from './utils';

export class ParticleSystem {
  /**
   * @param {PIXI.Container} stage - parent container for particles
   */
  constructor(stage) {
    this._container = new PIXI.Container();
    stage.addChild(this._container);
  }

  /**
   * Emit a burst of particles at world position (x, y).
   * @param {number} x
   * @param {number} y
   * @param {number[]} colors
   * @param {number}  [count=30]
   */
  burst(x, y, colors, count = 30) {
    for (let i = 0; i < count; i++) {
      this._spawnParticle(x, y, colors);
    }
  }

  destroy() {
    gsap.killTweensOf(this._container.children);
    this._container.destroy({ children: true });
  }

  _spawnParticle(x, y, colors) {
    const gfx = new PIXI.Graphics();
    const color = pickRandomElement(colors);
    const radius = getRandomFloat(3, 8);
    gfx.beginFill(color);
    gfx.drawCircle(0, 0, radius);
    gfx.endFill();
    gfx.x = x;
    gfx.y = y;
    this._container.addChild(gfx);

    const angle = getRandomFloat(0, Math.PI * 2);
    const speed = getRandomFloat(120, 340);
    const lifetime = getRandomFloat(0.8, 1.4);

    const destX = x + Math.cos(angle) * speed;
    const destY = y + Math.sin(angle) * speed - getRandomFloat(60, 160);

    gsap.to(gfx, {
      x: destX,
      y: destY + getRandomFloat(60, 180),
      alpha: 0,
      duration: lifetime,
      ease: 'power1.out',
      onComplete: () => {
        if (gfx.parent) this._container.removeChild(gfx);
        gfx.destroy();
      },
    });

    gsap.to(gfx.scale, {
      x: 0.1,
      y: 0.1,
      duration: lifetime,
      ease: 'power2.in',
    });
  }
}
