export const ARENA = {
  width: 1280,
  height: 720,
  left: 100,
  right: 1180,
  top: 380,
  bottom: 640,
};
export type HuntMode = "playing" | "paused" | "dead" | "victory";
export type HuntCue =
  | "slash"
  | "hit"
  | "dodge"
  | "perfect"
  | "parry"
  | "hurt"
  | "windup"
  | "slam"
  | "phase"
  | "death"
  | "victory";
export interface HuntSnapshot {
  mode: HuntMode;
  health: number;
  stamina: number;
  bossHealth: number;
  bossMaxHealth: number;
  posture: number;
  phase: 1 | 2;
  elapsed: number;
  deaths: number;
  hits: number;
  parries: number;
  perfectDodges: number;
  message: string;
  muted: boolean;
}
export interface FighterVisual {
  x: number;
  y: number;
  facing: number;
  action: "idle" | "move" | "attack" | "dodge" | "parry" | "hurt" | "dead";
  actionTime: number;
  health: number;
}
export interface BossVisual extends FighterVisual {
  phase: 1 | 2;
  rage: number;
}
export interface TelegraphVisual {
  kind: "sweep" | "slam" | "thrust" | "wave";
  x: number;
  y: number;
  radius: number;
  angle: number;
  progress: number;
  active: boolean;
  parryable: boolean;
}
export interface ParticleVisual {
  x: number;
  y: number;
  size: number;
  alpha: number;
  color: number;
  vx?: number;
  vy?: number;
}
export interface HuntVisual {
  time: number;
  player: FighterVisual;
  boss: BossVisual;
  telegraphs: TelegraphVisual[];
  particles: ParticleVisual[];
  phase: 1 | 2;
  flash: number;
  slow: boolean;
  reducedMotion: boolean;
}
export interface HuntOptions {
  onSnapshot: (snapshot: HuntSnapshot) => void;
  reducedMotion: boolean;
  muted: boolean;
}
export interface HuntController {
  pause: () => void;
  resume: () => void;
  restart: () => void;
  setMuted: (muted: boolean) => void;
  destroy: () => void;
  input: (action: "attack" | "dodge" | "parry", pressed?: boolean) => void;
  move: (x: number, y: number) => void;
}
