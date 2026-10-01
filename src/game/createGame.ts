import Phaser from 'phaser';
import { GameScene, setSceneLowFx } from './GameScene';
import { H, W } from './config';
import type { AsmrSynth } from './AsmrSynth';
import type { GameCallbacks, RunConfig } from './types';

export interface GameHandle {
  destroy: () => void;
  pause: () => void;
  resume: () => void;
  setTouch: (grab: boolean, breath: boolean) => void;
  setLowFx: (v: boolean) => void;
}

/** Boots a Phaser 3 game (Matter.js physics) inside `parent` */
export function createGame(
  parent: HTMLElement,
  run: RunConfig,
  cb: GameCallbacks,
  synth: AsmrSynth,
): GameHandle {
  const scene = new GameScene(run, cb, synth);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: W,
    height: H,
    backgroundColor: '#1a0509',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'matter',
      matter: {
        gravity: { x: 0, y: 0.6 },
        debug: false,
        enableSleeping: false,
      },
    },
    scene: [scene],
    banner: false,
    disableContextMenu: true,
    render: { antialias: true },
  });

  return {
    destroy: () => {
      synth.stopLoops();
      synth.setPaused(false); // never leave the AudioContext suspended
      game.destroy(true);
    },
    setLowFx: (v: boolean) => setSceneLowFx(v),
    pause: () => {
      game.scene.pause('Game');
      synth.setPaused(true);
    },
    resume: () => {
      synth.setPaused(false);
      game.scene.resume('Game');
    },
    setTouch: (grab, breath) => scene.setTouch(grab, breath),
  };
}
