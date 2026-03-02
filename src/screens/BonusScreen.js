import * as PIXI from 'pixi.js';
import gsap from 'gsap/all';
import { GameConfig } from '../core/GameConfig.js';
import { GameEvents, EVENTS } from '../core/EventEmitter.js';
import { delay } from '../utils/utils.js';
import { ParticleSystem } from '../utils/ParticleSystem.js';

const { COLORS, WIDTH, HEIGHT } = GameConfig;

export class BonusScreen {
  /**
   * @param {PIXI.Container} stage
   */
  constructor(stage) {
    this._stage = stage;
    this._container = new PIXI.Container();
    this._container.visible = false;
    this._container.zIndex = 100;

    this._buildUI();

    stage.addChild(this._container);
  }

  /**
   * Show the bonus screen for the given amount, then emit BONUS_SCREEN_COMPLETE.
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async show(amount, isTotal) {
    this._bonusLabel.text = `${isTotal ? '✦✦✦ TOTAL WON ✦✦✦' : '✦ BONUS! ✦'}`
    this._amountText.text = `$${amount.toLocaleString()}`;
    this._container.visible = true;
    this._amountText.alpha = 0;
    this._subtitle.alpha = isTotal ? 0 : 1;
    this._container.alpha = 0;
    this._container.scale.set(1);

    // Fade in
    await new Promise(resolve => {
      gsap.to(this._container, {
        alpha: 1,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: resolve,
      });
    });

    await new Promise(resolve => {
      gsap.timeline({ onComplete: resolve })
        .to(this._bonusLabel, { alpha: 1, duration: 0.2, ease: 'power2.out' })
        .to(this._bonusLabel.scale, {
          x: 1, y: 1,
          duration: 0.7,
          ease: 'elastic.out(1, 0.35)',
        }, '<');
    });

    // Burst particles
    for (let i = 0; i < 6; i++) {
      gsap.delayedCall(i * 0.18, () => {
        this._particleSystem.burst(
          WIDTH  / 2 + (Math.random() - 0.5) * 400,
          HEIGHT / 2 + (Math.random() - 0.5) * 220,
          COLORS.PARTICLE_BONUS,
          50,
        );
      });
    }

    // Animate amount
    await new Promise(resolve => {
      gsap.timeline({ onComplete: resolve })
        .to(this._amountText, { alpha: 1, duration: 0.3, ease: 'power2.out' })
        .to(this._amountText.scale, {
          x: 1, y: 1,
          duration: 0.55,
          ease: 'back.out(2)',
        }, '<');
    });

    await delay(GameConfig.BONUS_SCREEN_DURATION);

    // Fade out
    await new Promise(resolve => {
      gsap.to(this._container, {
        alpha: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: resolve,
      });
    });

    this._container.visible = false;

    GameEvents.emit(EVENTS.BONUS_SCREEN_COMPLETE, { amount, isTotal: !!isTotal });
  }

  destroy() {
    gsap.killTweensOf(this._container);
    gsap.killTweensOf(this._bonusLabel);
    gsap.killTweensOf(this._bonusLabel.scale);
    gsap.killTweensOf(this._amountText);
    gsap.killTweensOf(this._amountText.scale);

    this._particleSystem.destroy();
    this._container.destroy({ children: true });
  }

  _buildUI() {
    // Fade
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.95);
    overlay.drawRect(0, 0, WIDTH, HEIGHT);
    overlay.endFill();
    this._container.addChild(overlay);

    // Radial gradient-ish background glow
    const bgGlow = new PIXI.Graphics();
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    for (let r = 300; r > 0; r -= 30) {
      bgGlow.beginFill(0xFF4400, (0.3 - r / 300 * 0.3) * 0.15);
      bgGlow.drawCircle(cx, cy, r);
      bgGlow.endFill();
    }
    this._container.addChild(bgGlow);

    this._particleSystem = new ParticleSystem(this._container);

    // Decorative ring
    this._ring = new PIXI.Graphics();
    this._ring.x = WIDTH / 2;
    this._ring.y = HEIGHT / 2;
    this._container.addChild(this._ring);

    this._drawRing();

    // Label
    this._bonusLabel = new PIXI.Text('✦ BONUS! ✦', {
      fontFamily: 'Georgia, serif',
      fontSize: 72,
      fontWeight: 'bold',
      fill: ['#FF6B00', '#FFD700'],
      fillGradientType: PIXI.TEXT_GRADIENT.LINEAR_VERTICAL,
      stroke: '#FF2200',
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: '#FF0000',
      dropShadowBlur: 20,
      dropShadowDistance: 0,
      align: 'center',
    });

    this._bonusLabel.anchor.set(0.5, 0.5);
    this._bonusLabel.x = WIDTH / 2;
    this._bonusLabel.y = HEIGHT / 2 - 80;
    this._container.addChild(this._bonusLabel);

    // Amount text
    this._amountText = new PIXI.Text('', {
      fontFamily: 'Georgia, serif',
      fontSize: 100,
      fontWeight: 'bold',
      fill: ['#FFFFFF', '#FFD700'],
      fillGradientType: PIXI.TEXT_GRADIENT.LINEAR_VERTICAL,
      stroke: '#FF6B00',
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: '#FF6B00',
      dropShadowBlur: 20,
      dropShadowDistance: 0,
      align: 'center',
    });

    this._amountText.anchor.set(0.5, 0.5);
    this._amountText.x = WIDTH / 2;
    this._amountText.y = HEIGHT / 2 + 100;
    this._container.addChild(this._amountText);

    // Subtitle
    this._subtitle = new PIXI.Text('YOU WON', {
      fontFamily: 'Georgia, serif',
      fontSize: 28,
      letterSpacing: 8,
      fill: 0xFFAA44,
      align: 'center',
    });

    this._subtitle.anchor.set(0.5, 0.5);
    this._subtitle.x = WIDTH / 2;
    this._subtitle.y = HEIGHT / 2 + 10;
    this._container.addChild(this._subtitle);
  }

  _drawRing() {
    this._ring.clear();
    this._ring.lineStyle(3, 0xFFD700, 0.6);
    this._ring.drawCircle(0, 0, 400);
    this._ring.lineStyle(1.5, 0xFF6B00, 0.4);
    this._ring.drawCircle(0, 0, 415);
  }
}
