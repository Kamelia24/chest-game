import * as PIXI from 'pixi.js';
import gsap from 'gsap/all';
import { GameConfig } from '../core/GameConfig.js';

const { WIDTH, HEIGHT } = GameConfig;

export class GameBackground {
  /**
   * @param {PIXI.Container} stage
   */
  constructor(stage) {
    this._container = new PIXI.Container();
    this._tweens = [];

    this._build();
    stage.addChild(this._container);
  }

  destroy() {
    this._stopStarTwinkle();
    this._tweens.forEach(t => t.kill());
    this._tweens = [];
    this._container.destroy({ children: true });
  }

  _build() {
    this._drawGradientBG();
    this._drawStars();
    this._chestsBackground();
    this._drawTitle();
    this._drawColumnDecorations();
  }

  _drawGradientBG() {
    const bands = 10;
    const topColor = { r: 0x0d, g: 0x0d, b: 0x2b };
    const botColor = { r: 0x1a, g: 0x08, b: 0x05 };

    for (let i = 0; i < bands; i++) {
      const t = i / bands;
      const r = Math.round(topColor.r + (botColor.r - topColor.r) * t);
      const g = Math.round(topColor.g + (botColor.g - topColor.g) * t);
      const b = Math.round(topColor.b + (botColor.b - topColor.b) * t);
      const color = (r << 16) | (g << 8) | b;

      const band = new PIXI.Graphics();
      band.beginFill(color);
      band.drawRect(0, (i / bands) * HEIGHT, WIDTH, HEIGHT / bands + 1);
      band.endFill();
      this._container.addChild(band);
    }
  }

  _drawStars() {
    this._stars = [];

    for (let i = 0; i < 90; i++) {
      const baseAlpha = Math.random() * 0.45 + 0.25;
      const gfx = new PIXI.Graphics();
      gfx.beginFill(0xFFFFFF);
      gfx.drawCircle(0, 0, Math.random() * 1.6 + 0.3);
      gfx.endFill();
      gfx.x = Math.random() * WIDTH;
      gfx.y = Math.random() * HEIGHT * 0.62;
      gfx.alpha = baseAlpha;
      this._container.addChild(gfx);

      this._stars.push({
        gfx,
        baseAlpha,
        amplitude: Math.random() * 0.4 + 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.6 + 0.3,
      });
    }

    this._startStarTwinkle();
  }

  /**
   * GSAP ticker callback that updates all star alphas.
   */
  _startStarTwinkle() {
    let elapsed = 0;

    this._starTickerCallback = (time, deltaTime) => {
      elapsed += deltaTime / 1000;
      for (const star of this._stars) {
        star.gfx.alpha = star.baseAlpha + Math.sin(elapsed * star.speed + star.phase) * star.amplitude;
      }
    };

    gsap.ticker.add(this._starTickerCallback);
  }

  _stopStarTwinkle() {
    if (this._starTickerCallback) {
      gsap.ticker.remove(this._starTickerCallback);
      this._starTickerCallback = null;
    }
  }

  _chestsBackground() {
    const platform = new PIXI.Graphics();
    platform.beginFill(0x1a1030, 0.7);
    platform.drawRoundedRect(40, 120, WIDTH - 80, 550, 20);
    platform.endFill();

    platform.lineStyle(2, 0x4444AA, 0.3);
    platform.drawRoundedRect(40, 120, WIDTH - 80, 550, 20);
    platform.lineStyle(0);

    platform.beginFill(0x000000, 0.15);
    platform.drawRect(42, 121, WIDTH - 84, 16);
    platform.endFill();

    this._container.addChild(platform);
  }

  _drawTitle() {
    const title = new PIXI.Text('TREASURE QUEST', {
      fontFamily: 'Georgia, serif',
      fontSize: 48,
      fontWeight: 'bold',
      fill: ['#FFD700', '#FF8C00'],
      fillGradientType: PIXI.TEXT_GRADIENT.LINEAR_VERTICAL,
      stroke: '#5C3A00',
      strokeThickness: 3,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 12,
      dropShadowDistance: 3,
      letterSpacing: 6,
    });

    title.anchor.set(0.5, 0.5);
    title.x = WIDTH / 2;
    title.y = 72;
    this._container.addChild(title);

    // Decorative divider
    const divider = new PIXI.Graphics();
    divider.lineStyle(1, 0xDAA520, 0.5);
    divider.moveTo(WIDTH / 2 - 300, 102);
    divider.lineTo(WIDTH / 2 + 300, 102);
    divider.lineStyle(0);

    // Diamond accents
    divider.beginFill(0xDAA520, 0.7);

    divider.drawPolygon([
      WIDTH / 2 - 300, 102,
      WIDTH / 2 - 295, 97,
      WIDTH / 2 - 290, 102,
      WIDTH / 2 - 295, 107,
    ]);

    divider.drawPolygon([
      WIDTH / 2 + 300, 102,
      WIDTH / 2 + 295, 97,
      WIDTH / 2 + 290, 102,
      WIDTH / 2 + 295, 107,
    ]);

    divider.endFill();

    this._container.addChild(divider);
  }

  _drawColumnDecorations() {
    const gfx = new PIXI.Graphics();
    [[55, 140, 55, 650], [WIDTH - 55, 140, WIDTH - 55, 650]].forEach(([x1, y1, x2, y2]) => {
      gfx.lineStyle(1, 0x4444AA, 0.25);
      gfx.moveTo(x1, y1);
      gfx.lineTo(x2, y2);
    });
    gfx.lineStyle(0);

    const corners = [[60, 150], [WIDTH - 60, 145], [60, 655], [WIDTH - 60, 655]];
    corners.forEach(([x, y]) => {
      gfx.beginFill(0xDAA520, 0.3);
      gfx.drawCircle(x, y, 5);
      gfx.endFill();
    });

    this._container.addChild(gfx);
  }
}
