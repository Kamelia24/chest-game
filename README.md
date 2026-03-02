# Treasure Quest — Treasure Chest Game

Interactive treasure chest game built with **PIXI.js** and **ES6 JavaScript**. Players reveal hidden prizes by opening chests, with animated win/lose/bonus outcomes and a dedicated bonus/total screen.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Game Flow](#game-flow)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Class Reference](#class-reference)
- [Production Deployment](#production-deployment)
- [Environment Requirements](#environment-requirements)
- [Known Limitations](#known-limitations)

---

## Overview

Treasure Quest is a browser-based mini-game featuring:

- **6 interactive treasure chests** arranged in a 3×2 grid
- **Animated chest opening** with win / lose / bonus outcomes
- **Particle burst effects** on chest reveal
- **Full-screen bonus overlay** for high-value wins
- **Procedurally generated graphics** — zero external image assets required
- **Responsive scaling** — fits any viewport while preserving aspect ratio

---

## Game Flow

```
[IDLE] :
  PLAY button enabled, chests non-interactive
[PLAYING] - when player clicks play button :
  PLAY disabled, all 6 chests become clickable
[CHEST_OPENING] - when player clicks on a chest :
  All other chests disabled
  RNG resolves: WIN / BONUS / LOSE
  Chest plays open animation + particles
  Result text shown
      -> resultType === 'BONUS'
        -> [BONUS_SCREEN]
              Full-screen bonus overlay
              Amount displayed with animation
              Auto-dismisses after 3.5s
      -> if there are more chests to be opened -> [PLAYING] : (re-enable unopened chests)
      -> if all chests are opened[RESETTING] -> show total win screen, reset chests, teturn to [IDLE]
```

---

## Project Structure

```
chest-game/
├── index.html                  # Entry HTML
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.js                 # creates Game, handles fatal errors
    ├── Game.js                 # wires all objects
    ├── core/
    │   ├── GameConfig.js       # Centralized config
    │   ├── GameController.js   # State machine — handles all transitions
    │   └── EventEmitter.js     # Event bus + event name constants
    ├── objects/
    │   ├── Chest.js            # Single chest: render, interaction, animation
    │   └── PlayButton.js       # Play button: render, pulse animation, click
    ├── screens/
    │   ├── BonusScreen.js      # Full-screen bonus/total overlay
    │   └── GameBackground.js   # Static + animated background
    └── utils/
        ├── ParticleSystem.js   # Particle burst emitter
        └── utils.js            # helpfull functions
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 16.x
- **npm** ≥ 8.x

### Installation

```bash
# Clone the repository
git clone https://your-repo-url/treasure-quest.git
cd chest-game

# Install dependencies
npm install
```

### Run

```bash
npm run dev
```