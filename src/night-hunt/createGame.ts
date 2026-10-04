import Phaser from "phaser";
import { NightHuntScene } from "./NightHuntScene";
import { ARENA, type HuntController, type HuntOptions } from "./types";

export default async function createHuntGame(
  parent: HTMLElement,
  options: HuntOptions,
): Promise<HuntController> {
  return new Promise((resolve, reject) => {
    try {
      const scene = new NightHuntScene(options, resolve);
      new Phaser.Game({
        type: Phaser.AUTO,
        parent,
        width: ARENA.width,
        height: ARENA.height,
        backgroundColor: "#101310",
        transparent: false,
        banner: false,
        antialias: true,
        roundPixels: false,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        input: { activePointers: 3, keyboard: true, mouse: true, touch: true },
        audio: { noAudio: true },
        render: { powerPreference: "high-performance", pixelArt: false },
        fps: { target: 60, forceSetTimeOut: false },
        scene,
      });
    } catch (error) {
      reject(error);
    }
  });
}
