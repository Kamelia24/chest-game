import * as PIXI from 'pixi.js';
import { GameConfig } from '../core/GameConfig.js';
import { GameEvents, EVENTS } from '../core/EventEmitter.js';
import gsap from 'gsap/all';

const { COLORS } = GameConfig;

export class PlayButton {
  /**
   * @param {PIXI.Container} stage
   */
  constructor(stage) {
    this._enabled = true;
    this._container = new PIXI.Container();
    this._container.x = GameConfig.PLAY_BTN_X;
    this._container.y = GameConfig.PLAY_BTN_Y;

    this._buildGraphics();
    this._setupInteraction();
    this._startIdlePulse();

    stage.addChild(this._container);
  }

  enable() {
    this._enabled = true;
    this._container.interactive = true;
    this._container.buttonMode = true;
    this._label.text = 'PLAY';

    this._updateColors(COLORS.PLAY_BTN_IDLE,0xFFFFFF);

    gsap.killTweensOf(this._container);
    gsap.to(this._container, { alpha: 1, duration: 0.3, ease: 'power2.out' });

    this._startIdlePulse();
  }

  disable() {
    this._enabled = false;
    this._container.interactive = false;
    this._container.buttonMode = false;

    this._stopIdlePulse();

    gsap.killTweensOf(this._container);
    gsap.to(this._container, { alpha: 0.55, duration: 0.25, ease: 'power2.out' });

    this._label.text = '···';
    this._updateColors(COLORS.PLAY_BTN_DISABLED, 0xAABBAA);

  }

  destroy() {
    this._stopIdlePulse();
    gsap.killTweensOf(this._container);
    this._container.destroy({ children: true });
  }

  _buildGraphics() {
    const R = GameConfig.PLAY_BTN_RADIUS;

    // Outer ring / glow
    this._glowRing = new PIXI.Graphics();
    this._container.addChild(this._glowRing);

    // Shadow
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.35);
    shadow.drawEllipse(0, R + 6, R + 4, 10);
    shadow.endFill();
    this._container.addChild(shadow);

    // Main circle
    this._circle = new PIXI.Graphics();
    this._container.addChild(this._circle);

    // Inner highlight
    this._highlight = new PIXI.Graphics();
    this._container.addChild(this._highlight);

    this._drawCircle(COLORS.PLAY_BTN_IDLE);

    // Label
    this._label = new PIXI.Text('PLAY', {
      fontFamily: 'Georgia, serif',
      fontSize: 22,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      letterSpacing: 3,
      dropShadow: true,
      dropShadowColor: '#003300',
      dropShadowBlur: 6,
      dropShadowDistance: 1,
    });
    this._label.anchor.set(0.5, 0.5);
    this._container.addChild(this._label);
  }

  _drawCircle(color) {
    const R = GameConfig.PLAY_BTN_RADIUS;

    this._circle.clear();
    this._circle.beginFill(color);
    this._circle.drawCircle(0, 0, R);
    this._circle.endFill();

    // Rim
    this._circle.lineStyle(3, 0xFFFFFF, 0.2);
    this._circle.drawCircle(0, 0, R - 2);
    this._circle.lineStyle(0);
  }

  _updateColors(bgColor, textColor) {
    this._drawCircle(bgColor);
    this._label.style.fill = textColor;
  }

  _setupInteraction() {
    this._container.interactive = true;
    this._container.buttonMode = true;
    this._container.cursor = 'pointer';
    this._container.hitArea = new PIXI.Circle(0, 0, GameConfig.PLAY_BTN_RADIUS + 10);

    this._container.on('pointerover', this._onHover.bind(this));
    this._container.on('pointerout', this._onHoverEnd.bind(this));
    this._container.on('click', this._onPress.bind(this));
  }

  _onHover() {
    if (!this._enabled) return;

    if (this._pulseTween) this._pulseTween.pause();
    if (this._glowTween) this._glowTween.pause();

    gsap.killTweensOf(this._container.scale);
    gsap.to(this._container.scale, { x: 1.1, y: 1.1, duration: 0.18, ease: 'power2.out' });
  }

  _onHoverEnd() {
    if (!this._enabled) return;

    gsap.killTweensOf(this._container.scale);
    gsap.to(this._container.scale, {
      x: 1, y: 1, duration: 0.2, ease: 'power2.out',
      onComplete: () => { if (this._enabled) this._startIdlePulse(); },
    });
  }

  _onPress() {
    if (!this._enabled) return;

    this._enabled = false;

    gsap.killTweensOf(this._container.scale);

    gsap.to(this._container.scale, {
      x: 1, y: 1,
      duration: 0.35,
      ease: 'elastic.out(1, 0.4)',
      onComplete: () => GameEvents.emit(EVENTS.PLAY_CLICKED),
    });
  }

_startIdlePulse() {
    this._stopIdlePulse();

    this._pulseTween = gsap.to(this._container.scale, {
      x: 1.035,
      y: 1.035,
      duration: 1.1,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    const proxy = { t: 0 };
    this._glowTween = gsap.to(proxy, {
      t: 1,
      duration: 1.1,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      onUpdate: () => {
        const R = GameConfig.PLAY_BTN_RADIUS;
        const alpha = 0.08 + proxy.t * 0.22;
        const radius = R + 8 + proxy.t * 8;
        this._glowRing.clear();
        this._glowRing.beginFill(COLORS.PLAY_BTN_IDLE, alpha);
        this._glowRing.drawCircle(0, 0, radius);
        this._glowRing.endFill();
      },
    });
  }

  _stopIdlePulse() {
    if (this._pulseTween) { this._pulseTween.kill(); this._pulseTween = null; }
    if (this._glowTween)  { this._glowTween.kill();  this._glowTween  = null; }
    this._glowRing.clear();
  }
}
