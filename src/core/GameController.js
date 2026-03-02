import { GameConfig } from '../core/GameConfig.js';
import { GameEvents, EVENTS } from '../core/EventEmitter.js';
import { chance, delay, getRandomInt } from '../utils/utils.js';

const { GAME_STATE, WIN_CHANCE, BONUS_CHANCE, REGULAR_WIN_MIN, REGULAR_WIN_MAX, BONUS_WIN_MIN, BONUS_WIN_MAX, RESET_DELAY } = GameConfig;

export class GameController {
	/**
	 * @param {object} deps
	 * @param {import('../objects/Chest.js').Chest[]} deps.chests
	 * @param {import('../objects/PlayButton.js').PlayButton} deps.playButton
	 * @param {import('../screens/BonusScreen.js').BonusScreen} deps.bonusScreen
	 */
	constructor({ chests, playButton, bonusScreen }) {
		this._chests = chests;
		this._playButton = playButton;
		this._bonusScreen = bonusScreen;

		this._state = GAME_STATE.IDLE;
		this._openedCount = 0;
		this._combiendAmount = 0;

		this._listeners = [];
		this._bindEvents();
	}

	get state() {
		return this._state;
	}

	destroy() {
		this._combiendAmount = 0;
		this._listeners.forEach((remove) => remove());
		this._listeners = [];
	}

	_bindEvents() {
		this._listeners.push(
			GameEvents.on(EVENTS.PLAY_CLICKED, this._onPlayClicked.bind(this)),
			GameEvents.on(EVENTS.CHEST_CLICKED, this._onChestClicked.bind(this)),
			GameEvents.on(EVENTS.CHEST_OPEN_COMPLETE, this._onChestOpenComplete.bind(this)),
			GameEvents.on(EVENTS.BONUS_SCREEN_COMPLETE, this._onBonusScreenComplete.bind(this)),
		);
	}

	_onPlayClicked() {
		if (this._state !== GAME_STATE.IDLE) return;

		this._setState(GAME_STATE.PLAYING);
		this._openedCount = 0;

		this._playButton.disable();
		this._chests.forEach((chest) => chest.enable());
	}

	_onChestClicked({ id }) {
		if (this._state !== GAME_STATE.PLAYING) return;

		this._setState(GAME_STATE.CHEST_OPENING);

		this._chests.forEach((chest) => {
			if (chest.id !== id && !chest.isOpen) chest.disable();
		});

		const { resultType, amount } = this._resolveResult();

		this._chests[id].open(resultType, amount).catch((err) => {
			console.error('[GameController] Chest open animation failed:', err);
		});
	}

	_onChestOpenComplete({ id, resultType, amount }) {
		this._openedCount++;
		this._combiendAmount += amount;

		if (resultType === 'BONUS') {
			this._setState(GAME_STATE.BONUS_SCREEN);
			this._bonusScreen.show(amount).catch((err) => {
				console.error('[GameController] Bonus screen failed:', err);
				GameEvents.emit(EVENTS.BONUS_SCREEN_COMPLETE, { amount });
			});
		} else {
			this._resumeAfterOpen();
		}
	}

	_onBonusScreenComplete(params) {
		!params.isTotal && this._resumeAfterOpen();
	}

	/**
	 * After a chest is fully resolved (animation + bonus screen if any),
	 * decide whether to continue playing or reset.
	 */
	_resumeAfterOpen() {
		const allOpened = this._openedCount >= GameConfig.CHEST_COUNT;

		if (allOpened) {
			this._startReset();
		} else {
			this._setState(GAME_STATE.PLAYING);

			this._chests.forEach((chest) => {
				if (!chest.isOpen) chest.enable();
			});
		}
	}

	async _startReset() {
		this._setState(GAME_STATE.RESETTING);

		await this._bonusScreen.show(this._combiendAmount, true);

		await delay(RESET_DELAY)

    const resetPromises = this._chests.map((chest) => chest.reset());
    await Promise.all(resetPromises);

		this._combiendAmount = 0;
    this._openedCount = 0;
    this._setState(GAME_STATE.IDLE);
    this._playButton.enable();
	}

	/**
	 * Determine win/loss and amount for the opened chest
	 * @returns {{ resultType: 'WIN'|'BONUS'|'LOSE', amount: number }}
	 */
	_resolveResult() {
		const isWin = chance(WIN_CHANCE);

		if (!isWin) {
			return { resultType: 'LOSE', amount: 0 };
		}

		const isBonus = chance(BONUS_CHANCE);

		if (isBonus) {
			return {
				resultType: 'BONUS',
				amount: getRandomInt(BONUS_WIN_MIN, BONUS_WIN_MAX),
			};
		}

		return {
			resultType: 'WIN',
			amount: getRandomInt(REGULAR_WIN_MIN, REGULAR_WIN_MAX),
		};
	}

	_setState(newState) {
		const previous = this._state;
		this._state = newState;
		GameEvents.emit(EVENTS.STATE_CHANGED, { previous, current: newState });
	}
}
