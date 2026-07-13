import type Phaser from "phaser";

const SFX = {
  step: "sfx-step",
  gather: "sfx-gather",
  encounter: "sfx-encounter",
  shrine: "sfx-shrine",
  craft: "sfx-craft",
} as const;

const MUSIC_GROVE = "music-grove-loop";

const STEP_COOLDOWN_MS = 220;
const MUTE_KEY = "poke-audio-muted";

let muted = localStorage.getItem(MUTE_KEY) === "1";
let lastStepAt = 0;
let music: Phaser.Sound.BaseSound | null = null;
let unlocked = false;

export function preloadGameAudio(scene: Phaser.Scene): void {
  // ponytail: short authored WAV stubs; swap for real mix when available
  scene.load.audio(SFX.step, "assets/audio/sfx-step.wav");
  scene.load.audio(SFX.gather, "assets/audio/sfx-gather.wav");
  scene.load.audio(SFX.encounter, "assets/audio/sfx-encounter.wav");
  scene.load.audio(SFX.shrine, "assets/audio/sfx-shrine.wav");
  scene.load.audio(SFX.craft, "assets/audio/sfx-craft.wav");
  scene.load.audio(MUSIC_GROVE, "assets/audio/music-grove-loop.wav");
}

export function isAudioMuted(): boolean {
  return muted;
}

export function setAudioMuted(next: boolean, scene?: Phaser.Scene): void {
  muted = next;
  localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  if (scene) {
    scene.sound.mute = muted;
  }
  if (muted) {
    music?.pause();
  } else if (music && !music.isPlaying) {
    music.resume();
  }
  syncMuteButton();
}

export function syncMuteButton(): void {
  const btn = document.getElementById("mute-audio-btn");
  if (btn) {
    btn.textContent = muted ? "Unmute" : "Mute";
    btn.setAttribute("aria-pressed", muted ? "true" : "false");
  }
}

/** Unlock WebAudio on first user gesture (browser autoplay policy). */
export function unlockAudioFromGesture(scene: Phaser.Scene): void {
  if (unlocked) {
    return;
  }
  unlocked = true;
  scene.sound.unlock();
  scene.sound.mute = muted;
  ensureGroveMusic(scene);
}

function playSfx(scene: Phaser.Scene, key: string, volume = 0.45): void {
  if (muted || !scene.cache.audio.exists(key)) {
    return;
  }
  scene.sound.play(key, { volume });
}

export function playStepSfx(scene: Phaser.Scene, nowMs: number): void {
  if (nowMs - lastStepAt < STEP_COOLDOWN_MS) {
    return;
  }
  lastStepAt = nowMs;
  playSfx(scene, SFX.step, 0.28);
}

export function playGatherSfx(scene: Phaser.Scene): void {
  playSfx(scene, SFX.gather, 0.4);
}

export function playEncounterSfx(scene: Phaser.Scene): void {
  playSfx(scene, SFX.encounter, 0.5);
}

export function playShrineSfx(scene: Phaser.Scene): void {
  playSfx(scene, SFX.shrine, 0.45);
}

export function playCraftSfx(scene: Phaser.Scene): void {
  playSfx(scene, SFX.craft, 0.45);
}

export function ensureGroveMusic(scene: Phaser.Scene): void {
  if (!scene.cache.audio.exists(MUSIC_GROVE)) {
    return;
  }
  if (!music) {
    music = scene.sound.add(MUSIC_GROVE, {
      loop: true,
      volume: 0.22,
    });
  }
  scene.sound.mute = muted;
  if (!muted && music && !music.isPlaying) {
    music.play();
  }
}

export function initMuteControl(scene: Phaser.Scene): void {
  syncMuteButton();
  const btn = document.getElementById("mute-audio-btn");
  if (!btn || btn.dataset.bound === "1") {
    return;
  }
  btn.dataset.bound = "1";
  btn.addEventListener("click", () => {
    unlockAudioFromGesture(scene);
    setAudioMuted(!muted, scene);
  });
}
