import * as PIXI from 'pixi.js';
import gsap from 'gsap/all';
import { GameConfig } from '../core/GameConfig.js';
import { GameEvents, EVENTS } from '../core/EventEmitter.js';
import { delay } from '../utils/utils.js';
import { ParticleSystem } from '../utils/ParticleSystem.js';

const { CHEST_STATE, COLORS } = GameConfig;

export class Chest {
	/**
	 * @param {object} opts
	 * @param {number} opts.id - Unique index (0-5)
	 * @param {number} opts.x - Center X position
	 * @param {number} opts.y - Center Y position
	 * @param {PIXI.Container} opts.stage
	 */
	constructor({ id, x, y, stage }) {

		this._state = CHEST_STATE.IDLE;
		this._container = new PIXI.Container();
		this._particleSystem = new ParticleSystem(stage);

		this.id = id;
		this._container.x = x;
		this._container.y = y;

		this._buildGraphics();
		this._setupInteraction();

		stage.addChild(this._container);
	}

	get state() {
		return this._state;
	}

	get isOpen() {
		return [CHEST_STATE.OPEN_WIN, CHEST_STATE.OPEN_BONUS, CHEST_STATE.OPEN_LOSE].includes(this._state);
	}

	enable() {
		gsap.killTweensOf(this._container);
		gsap.killTweensOf(this._container.scale);

		this._setState(CHEST_STATE.ENABLED);

		this._container.interactive = true;
		this._container.buttonMode = true;

		gsap.to(this._container, { alpha: 1, duration: 0.2, ease: 'power2.out' });

		this._setGlowEnabled(true);
	}

	disable() {
		gsap.killTweensOf(this._container);

		this._setState(CHEST_STATE.DISABLED);

		this._container.interactive = false;
		this._container.buttonMode = false;

		gsap.to(this._container, { alpha: 0.45, duration: 0.25, ease: 'power2.out' });

		this._setGlowEnabled(false);
	}

	idle() {
		gsap.killTweensOf(this._container);

		this._setState(CHEST_STATE.IDLE);

		this._container.interactive = false;
		this._container.buttonMode = false;

		gsap.to(this._container, { alpha: 1, duration: 0.2 });

		this._setGlowEnabled(false);
	}

	/**
	 * Animate the chest opening with the given result.
	 * @param {'WIN'|'BONUS'|'LOSE'} resultType
	 * @param {number} amount - Win amount (0 for lose)
	 */
	async open(resultType, amount) {
		this._setState(CHEST_STATE.OPENING);

		this._container.interactive = false;
		this._container.buttonMode = false;

		await this._animateOpen(resultType, amount);

		this._setState(resultType === 'WIN' ? CHEST_STATE.OPEN_WIN : resultType === 'BONUS' ? CHEST_STATE.OPEN_BONUS : CHEST_STATE.OPEN_LOSE);

		gsap.to(this._container, { alpha: 0.7, duration: 0.2, ease: 'power2.out' });

		GameEvents.emit(EVENTS.CHEST_OPEN_COMPLETE, { id: this.id, resultType, amount });
	}

	async reset() {
		gsap.killTweensOf(this._lid);
		gsap.killTweensOf(this._container);
		gsap.killTweensOf(this._container.scale);
		gsap.killTweensOf(this._resultText);
		gsap.killTweensOf(this._resultText.scale);

		const tl = gsap.timeline();

		tl.to(this._resultText, { alpha: 0, duration: 0.2, ease: 'power2.in' });

		tl.to(this._lid, { y: -GameConfig.CHEST_BODY_HEIGHT / 2 + 2, alpha: 1, duration: 0.5, ease: 'back.inOut(1.5)' }, '<0.1');

		tl.to(this._container, { alpha: 1, duration: 0.3, ease: 'power2.out' }, '<');

		await new Promise((resolve) => {
			tl.eventCallback('onComplete', resolve);
		});

		this._glowGraphic.clear();
		this._resultText.visible = false;
		this._resultText.alpha = 1;
		this._container.scale.set(1);

		this._setState(CHEST_STATE.IDLE);
	}

	destroy() {
		gsap.killTweensOf(this._container);
		gsap.killTweensOf(this._lid);
		gsap.killTweensOf(this._resultText);

		this._particleSystem.destroy();
		this._container.destroy({ children: true });
	}

	_setState(state) {
		this._state = state;
	}

	_buildGraphics() {
		const chestWidth = GameConfig.CHEST_WIDTH;
		const lidHeight = GameConfig.CHEST_LID_HEIGHT;
		const bodyHeight = GameConfig.CHEST_BODY_HEIGHT;

		// Glow
		this._glowGraphic = new PIXI.Graphics();
		this._container.addChild(this._glowGraphic);

		// Shadow
		const shadow = new PIXI.Graphics();
		shadow.beginFill(0x000000, 0.3);
		shadow.drawEllipse(0, bodyHeight / 2 + 8, chestWidth / 2 + 10, 14);
		shadow.endFill();
		this._container.addChild(shadow);

		// Body
		this._body = new PIXI.Graphics();
		this._drawBody(this._body, chestWidth, bodyHeight);
		this._container.addChild(this._body);

		// Lid
		this._lid = new PIXI.Container();
		this._lid.pivot.set(0, lidHeight);
		this._lid.y = -bodyHeight / 2 + lidHeight / 2;
		this._drawLid(this._lid, chestWidth, lidHeight);
		this._container.addChild(this._lid);

		// Result text
		this._resultText = new PIXI.Text('', {
			fontFamily: 'Georgia, serif',
			fontSize: 20,
			fontWeight: 'bold',
			fill: COLORS.TEXT_WIN,
			align: 'center',
			dropShadow: true,
			dropShadowColor: '#000000',
			dropShadowBlur: 4,
			dropShadowDistance: 2,
		});

		this._resultText.anchor.set(0.5, 0.5);
		this._resultText.y = -bodyHeight;
		this._resultText.visible = false;

		this._container.addChild(this._resultText);
	}

	_drawBody(gfx, chestWidth, bodyHeight) {
		// Main body
		gfx.beginFill(COLORS.CHEST_BODY);
		gfx.drawRoundedRect(-chestWidth / 2, -bodyHeight / 2, chestWidth, bodyHeight, 8);
		gfx.endFill();

		// Wood planks effect
		gfx.beginFill(0x000000, 0.1);
		for (let i = 0; i < 4; i++) {
			gfx.drawRect(-chestWidth / 2 + 2, -bodyHeight / 2 + 10 + i * 22, chestWidth - 4, 3);
		}
		gfx.endFill();

		// Horizontal band
		gfx.lineStyle(4, COLORS.CHEST_TRIM, 1);
		gfx.moveTo(-chestWidth / 2, 0);
		gfx.lineTo(chestWidth / 2, 0);
		gfx.lineStyle(0);

		// Corners
		gfx.beginFill(COLORS.CHEST_TRIM);
		const cornerSize = 12;

		// Top-left corner bracket
		gfx.drawRect(-chestWidth / 2, -bodyHeight / 2, cornerSize, 5);
		gfx.drawRect(-chestWidth / 2, -bodyHeight / 2, 5, cornerSize);
		// Top-right
		gfx.drawRect(chestWidth / 2 - cornerSize, -bodyHeight / 2, cornerSize, 5);
		gfx.drawRect(chestWidth / 2 - 5, -bodyHeight / 2, 5, cornerSize);
		// Bottom-left
		gfx.drawRect(-chestWidth / 2, bodyHeight / 2 - 5, cornerSize, 5);
		gfx.drawRect(-chestWidth / 2, bodyHeight / 2 - cornerSize, 5, cornerSize);
		// Bottom-right
		gfx.drawRect(chestWidth / 2 - cornerSize, bodyHeight / 2 - 5, cornerSize, 5);
		gfx.drawRect(chestWidth / 2 - 5, bodyHeight / 2 - cornerSize, 5, cornerSize);

		gfx.endFill();

		// Lock
		gfx.beginFill(COLORS.CHEST_LOCK);
		gfx.drawRoundedRect(-12, -12, 24, 22, 4);
		gfx.endFill();
		gfx.beginFill(COLORS.CHEST_BODY);
		gfx.drawCircle(0, -4, 7);
		gfx.endFill();
		gfx.beginFill(COLORS.CHEST_LOCK);
		gfx.drawCircle(0, -4, 4);
		gfx.endFill();
	}

	_drawLid(container, chestWidth, lidHeight) {
		const gfx = new PIXI.Graphics();

		// Lid body
		gfx.beginFill(COLORS.CHEST_LID);
		gfx.drawRoundedRect(-chestWidth / 2, -5, chestWidth, lidHeight + 2, 8);
		gfx.endFill();

		// Lid trim
		gfx.lineStyle(3, COLORS.CHEST_TRIM, 1);
		gfx.drawRoundedRect(-chestWidth / 2 + 2, -5, chestWidth - 4, lidHeight - 2, 6);
		gfx.lineStyle(0);

		// Lid metal corners
		gfx.beginFill(COLORS.CHEST_TRIM);
		gfx.drawRect(-chestWidth / 2, 12, 10, 4);
		gfx.drawRect(-chestWidth / 2, 5, 4, 10);
		gfx.drawRect(chestWidth / 2 - 10, 12, 10, 4);
		gfx.drawRect(chestWidth / 2 - 4, 5, 4, 10);
		gfx.endFill();

		container.addChild(gfx);
	}

	_setupInteraction() {
		this._container.interactive = false;
		this._container.buttonMode = false;
		this._container.cursor = 'pointer';

		this._container.on('pointerover', this._onHover.bind(this));
		this._container.on('pointerout', this._onHoverEnd.bind(this));
		this._container.on('pointerdown', this._onPointerDown.bind(this));
		this._container.on('pointerup', this._onPointerUp.bind(this));
	}

	_onHover() {
		if (this._state !== CHEST_STATE.ENABLED) return;

		gsap.killTweensOf(this._container.scale);
		gsap.to(this._container.scale, { x: 1.07, y: 1.07, duration: 0.18, ease: 'power2.out' });
	}

	_onHoverEnd() {
		if (this._state !== CHEST_STATE.ENABLED) return;

		gsap.killTweensOf(this._container.scale);
		gsap.to(this._container.scale, { x: 1, y: 1, duration: 0.22, ease: 'power2.out' });
	}

	_onPointerDown() {
		if (this._state !== CHEST_STATE.ENABLED) return;

		gsap.killTweensOf(this._container.scale);
		gsap.to(this._container.scale, { x: 0.94, y: 0.94, duration: 0.1, ease: 'power2.in' });
	}

	_onPointerUp() {
		if (this._state !== CHEST_STATE.ENABLED) return;

		gsap.killTweensOf(this._container.scale);
		gsap.to(this._container.scale, { x: 1, y: 1, duration: 0.1, ease: 'power2.out' });

		GameEvents.emit(EVENTS.CHEST_CLICKED, { id: this.id });
	}

	async _animateOpen(resultType, amount) {
		const glowColor =
			resultType === 'WIN'
				? COLORS.CHEST_OPEN_GLOW_WIN
				: resultType === 'BONUS'
					? COLORS.CHEST_OPEN_GLOW_BONUS
					: COLORS.CHEST_OPEN_GLOW_LOSE;

		// Bounce (anticipation)
		await new Promise((resolve) => {
			gsap
				.timeline({ onComplete: resolve })
				.to(this._container.scale, { x: 1.1, y: 0.92, duration: 0.1, ease: 'power2.in' })
				.to(this._container.scale, { x: 0.92, y: 1.1, duration: 0.1, ease: 'power2.out' })
				.to(this._container.scale, { x: 1, y: 1, duration: 0.15, ease: 'elastic.out(1, 0.5)' });
		});

		// Lid opens
		const glowProxy = { progress: 0 };

		await new Promise((resolve) => {
			gsap
				.timeline({ onComplete: resolve })
				.to(this._lid, {
					y: -50,
					alpha: 0,
					duration: GameConfig.CHEST_OPEN_DURATION / 1000,
					ease: 'back.out(1.2)',
				})
				.to(
					glowProxy,
					{
						progress: 1,
						duration: GameConfig.CHEST_OPEN_DURATION / 1000,
						ease: 'power2.out',
						onUpdate: () => {
							const p = glowProxy.progress;
							this._glowGraphic.clear();
							this._glowGraphic.beginFill(glowColor, 0.18 * p);
							this._glowGraphic.drawCircle(0, 0, 85 + p * 35);
							this._glowGraphic.endFill();
						},
					},
					'<',
				);
		});

		// Particles burst
		const chestWidth = GameConfig.CHEST_WIDTH;
		const colors = resultType === 'WIN' ? COLORS.PARTICLE_WIN : resultType === 'BONUS' ? COLORS.PARTICLE_BONUS : COLORS.PARTICLE_LOSE;

		const worldPos = this._container.getGlobalPosition();
		resultType !== 'LOSE' && this._particleSystem.burst(worldPos.x, worldPos.y - GameConfig.CHEST_BODY_HEIGHT / 2, colors, 35);

		// Show result
		this._resultText.style.fill = resultType === 'BONUS' ? COLORS.TEXT_BONUS : resultType === 'WIN' ? COLORS.TEXT_WIN : COLORS.TEXT_LOSE;

		this._resultText.text = resultType === 'LOSE' ? 'No Win' : resultType === 'BONUS' ? `BONUS!` : `+$${amount}`;

		this._resultText.visible = true;
		this._resultText.alpha = 0;
		this._resultText.scale.set(0.5);

		await new Promise((resolve) => {
			gsap
				.timeline({ onComplete: resolve })
				.to(this._resultText, { alpha: 1, duration: 0.25, ease: 'power2.out' })
				.to(this._resultText.scale, { x: 1, y: 1, duration: 0.45, ease: 'elastic.out(1, 0.4)' }, '<');
		});

		await delay(GameConfig.RESULT_DISPLAY_DURATION);
	}

	_setGlowEnabled(enabled) {
		if (!enabled) {
			this._glowGraphic.clear();
		} else {
			this._glowGraphic.clear();
			this._glowGraphic.beginFill(0xffffff, 0.06);
			this._glowGraphic.drawCircle(0, 0, 90);
			this._glowGraphic.endFill();
		}
	}
}
