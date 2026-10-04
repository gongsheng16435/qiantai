import Phaser from "phaser";
import { HuntAudio } from "./audio";
import { createHuntRenderer } from "./renderer";
import {
  ARENA,
  type BossVisual,
  type FighterVisual,
  type HuntController,
  type HuntMode,
  type HuntOptions,
  type HuntSnapshot,
  type ParticleVisual,
  type TelegraphVisual,
} from "./types";

// All collision distances use the same foreshortened ground plane as the ink art.
const DEPTH = 0.55;
const BOSS_HEALTH = 5400;
const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, (a.y - b.y) / DEPTH);
const angleTo = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.atan2((b.y - a.y) / DEPTH, b.x - a.x);
const angleDifference = (a: number, b: number) =>
  Math.atan2(Math.sin(a - b), Math.cos(a - b));
type AttackKind = TelegraphVisual["kind"];
interface Attack extends TelegraphVisual {
  age: number;
  duration: number;
  resolved: boolean;
  damage: number;
}
interface Mote extends ParticleVisual {
  life: number;
  total: number;
  vx: number;
  vy: number;
}
interface Fighter extends FighterVisual {
  actionLeft: number;
}

/** A self-contained, asset-free arena encounter. Render and sound are replaceable. */
export class NightHuntScene extends Phaser.Scene {
  private readonly options: HuntOptions;
  private readonly onReady: (controller: HuntController) => void;
  private painter?: ReturnType<typeof createHuntRenderer>;
  private soundscape?: HuntAudio;
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {};
  private hunter!: Fighter;
  private beast!: Fighter & BossVisual;
  private mode: HuntMode = "playing";
  private stamina = 100;
  private posture = 0;
  private phase: 1 | 2 = 1;
  private phaseIntro = 0;
  private elapsed = 0;
  private clock = 0;
  private deaths = 0;
  private hits = 0;
  private parries = 0;
  private perfectDodges = 0;
  private message = "";
  private messageLeft = 0;
  private staminaDelay = 0;
  private invulnerable = 0;
  private parryWindow = 0;
  private dodgePerfect = false;
  private dodgeX = 0;
  private dodgeY = 0;
  private attackPending = false;
  private attackHolding = false;
  private slashResolved = true;
  private slashCombo = 0;
  private slowLeft = 0;
  private stopLeft = 0;
  private flash = 0;
  private deathTimer = 0;
  private snapshotTimer = 0;
  private bossWait = 1.9;
  private bossStagger = 0;
  private empowered = false;
  private attackIndex = 0;
  private comboLeft = 0;
  private lastPostureHit = 0;
  private attacks: Attack[] = [];
  private motes: Mote[] = [];
  private touchX = 0;
  private touchY = 0;
  private pointerAiming = false;
  private aimX = 900;
  private aimY = 520;
  private muted: boolean;
  private disposed = false;

  constructor(
    options: HuntOptions,
    onReady: (controller: HuntController) => void,
  ) {
    super({ key: "night-hunt" });
    this.options = options;
    this.onReady = onReady;
    this.muted = options.muted;
  }

  create() {
    this.painter = createHuntRenderer(this);
    this.soundscape = new HuntAudio();
    this.soundscape.setMuted(this.muted);
    void this.soundscape.start();
    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.keys = keyboard.addKeys(
        "W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,E",
      ) as Record<string, Phaser.Input.Keyboard.Key>;
      keyboard.addCapture([
        "W",
        "A",
        "S",
        "D",
        "UP",
        "DOWN",
        "LEFT",
        "RIGHT",
        "SPACE",
        "E",
      ]);
      keyboard.on("keydown-SPACE", (event: KeyboardEvent) => {
        if (!event.repeat) this.command("dodge");
      });
      keyboard.on("keydown-E", (event: KeyboardEvent) => {
        if (!event.repeat) this.command("parry");
      });
      keyboard.on("keydown", () => {
        void this.soundscape?.start();
      });
    }
    this.input.mouse?.disableContextMenu();
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.wasTouch) return;
      this.pointerAiming = true;
      this.aimX = pointer.x;
      this.aimY = pointer.y;
    });
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.wasTouch) return;
      this.aimX = pointer.x;
      this.aimY = pointer.y;
      this.pointerAiming = true;
      if (pointer.rightButtonDown()) this.command("parry");
      else if (pointer.leftButtonDown()) this.command("attack");
    });
    this.input.on("pointerup", () => {
      this.attackHolding = false;
    });
    this.input.on("pointerupoutside", () => {
      this.attackHolding = false;
    });
    window.addEventListener("blur", this.onBlur);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.teardown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.teardown, this);
    this.resetRun();
    this.onReady({
      pause: () => this.pauseRun(),
      resume: () => this.resumeRun(),
      restart: () => this.resetRun(),
      setMuted: (muted) => {
        this.muted = muted;
        this.soundscape?.setMuted(muted);
        this.publish();
      },
      destroy: () => this.game.destroy(true),
      input: (action, pressed = true) => {
        if (!pressed) {
          if (action === "attack") this.attackHolding = false;
          return;
        }
        this.command(action);
      },
      move: (x, y) => {
        this.touchX = Phaser.Math.Clamp(x, -1, 1);
        this.touchY = Phaser.Math.Clamp(y, -1, 1);
        if (x || y) this.pointerAiming = false;
      },
    });
  }

  private onBlur = () => this.pauseRun();
  private onVisibility = () => {
    if (document.hidden) this.pauseRun();
  };

  private teardown() {
    if (this.disposed) return;
    this.disposed = true;
    window.removeEventListener("blur", this.onBlur);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.painter?.destroy();
    this.soundscape?.destroy();
  }

  private resetRun() {
    this.hunter = {
      x: 430,
      y: 552,
      facing: 0,
      action: "idle",
      actionTime: 0,
      actionLeft: 0,
      health: 100,
    };
    this.beast = {
      x: 880,
      y: 510,
      facing: Math.PI,
      action: "idle",
      actionTime: 0,
      actionLeft: 0,
      health: BOSS_HEALTH,
      phase: 1,
      rage: 0,
    };
    this.mode = "playing";
    this.stamina = 100;
    this.posture = 0;
    this.phase = 1;
    this.phaseIntro = 0;
    this.elapsed = 0;
    this.hits = 0;
    this.parries = 0;
    this.perfectDodges = 0;
    this.attacks = [];
    this.motes = [];
    this.bossWait = 1.9;
    this.bossStagger = 0;
    this.empowered = false;
    this.attackIndex = 0;
    this.comboLeft = 0;
    this.invulnerable = 0;
    this.parryWindow = 0;
    this.dodgePerfect = false;
    this.slashCombo = 0;
    this.slashResolved = true;
    this.staminaDelay = 0;
    this.lastPostureHit = 0;
    this.stopLeft = 0;
    this.slowLeft = 0;
    this.flash = 0;
    this.clearInput();
    this.soundscape?.setPaused(false);
    this.soundscape?.setPhase(1);
    this.say(
      this.deaths ? "长夜未尽。再猎一次。" : "刀锋近身。听见风声，再闪避。",
      4,
    );
    this.publish();
  }

  private clearInput() {
    this.touchX = 0;
    this.touchY = 0;
    this.attackHolding = false;
    this.attackPending = false;
    this.input.keyboard?.resetKeys();
  }

  private pauseRun() {
    if (this.mode !== "playing") return;
    this.mode = "paused";
    this.clearInput();
    this.soundscape?.setPaused(true);
    this.publish();
  }

  private resumeRun() {
    if (this.mode !== "paused") return;
    this.mode = "playing";
    this.soundscape?.setPaused(false);
    void this.soundscape?.start();
    this.publish();
  }

  private command(action: "attack" | "dodge" | "parry") {
    if (this.mode !== "playing" || this.phaseIntro > 0) return;
    void this.soundscape?.start();
    if (action === "attack") {
      this.attackHolding = true;
      this.attackPending = true;
      return;
    }
    if (
      this.hunter.action === "hurt" ||
      this.hunter.action === "dodge" ||
      this.hunter.action === "parry"
    )
      return;
    // Defence may cancel the recovery of a slash, but not its opening frames.
    if (this.hunter.action === "attack" && this.hunter.actionTime < 0.12)
      return;
    const cost = action === "dodge" ? 25 : 18;
    if (this.stamina < cost) {
      this.say("精力不足，退后片刻。", 1);
      return;
    }
    this.stamina -= cost;
    this.staminaDelay = 0.42;
    this.attackPending = false;
    if (action === "dodge") {
      const move = this.movement();
      let x = move.x;
      let y = move.y;
      if (Math.hypot(x, y) < 0.1) {
        const away = angleTo(this.beast, this.hunter);
        x = Math.cos(away);
        y = Math.sin(away);
      }
      const length = Math.hypot(x, y) || 1;
      this.dodgeX = x / length;
      this.dodgeY = y / length;
      this.invulnerable = 0.32;
      this.dodgePerfect = false;
      this.setAction(this.hunter, "dodge", 0.38);
      this.soundscape?.cue("dodge");
      this.burst(this.hunter.x, this.hunter.y - 14, 8, 0xc7c7bc, 90);
    } else {
      if (!this.pointerAiming)
        this.hunter.facing = angleTo(this.hunter, this.beast);
      this.parryWindow = 0.22;
      this.setAction(this.hunter, "parry", 0.48);
      this.soundscape?.cue("slash");
      this.burst(
        this.hunter.x + Math.cos(this.hunter.facing) * 24,
        this.hunter.y - 36,
        5,
        0xd5c29b,
        45,
      );
    }
  }

  private movement() {
    const down = (name: string) => (this.keys[name]?.isDown ? 1 : 0);
    const x =
      this.touchX + down("D") + down("RIGHT") - down("A") - down("LEFT");
    const y = this.touchY + down("S") + down("DOWN") - down("W") - down("UP");
    const length = Math.max(1, Math.hypot(x, y));
    return { x: x / length, y: y / length };
  }

  update(_time: number, delta: number) {
    if (!this.hunter || this.disposed) return;
    const realDt = Math.min(delta / 1000, 0.05);
    if (this.mode === "dead") {
      this.deathTimer -= realDt;
      if (this.deathTimer <= 0) this.resetRun();
    }
    if (this.mode === "playing") {
      this.elapsed += realDt;
      this.stopLeft = Math.max(0, this.stopLeft - realDt);
      this.slowLeft = Math.max(0, this.slowLeft - realDt);
      const dt =
        realDt * (this.stopLeft > 0 ? 0.04 : this.slowLeft > 0 ? 0.34 : 1);
      this.clock += dt;
      this.messageLeft -= realDt;
      if (this.messageLeft <= 0) this.message = "";
      this.flash = Math.max(0, this.flash - realDt * 2.6);
      this.phaseIntro = Math.max(0, this.phaseIntro - dt);
      this.invulnerable = Math.max(0, this.invulnerable - dt);
      this.parryWindow = Math.max(0, this.parryWindow - dt);
      this.staminaDelay = Math.max(0, this.staminaDelay - dt);
      if (this.staminaDelay === 0 && this.hunter.action !== "dodge")
        this.stamina = Math.min(100, this.stamina + dt * 28);
      this.updateFighter(this.hunter, dt);
      this.updateFighter(this.beast, dt);
      this.updatePlayer(dt);
      this.updateBoss(dt);
      this.updateAttacks(dt);
      this.updateParticles(dt);
      if (this.clock - this.lastPostureHit > 5 && !this.bossStagger)
        this.posture = Math.max(0, this.posture - dt * 5);
    } else if (this.mode !== "paused") {
      this.clock += realDt;
      this.updateParticles(realDt);
      this.flash = Math.max(0, this.flash - realDt * 2.6);
    }
    this.painter?.render({
      time: this.clock,
      player: this.hunter,
      boss: this.beast,
      telegraphs: this.attacks,
      particles: this.motes,
      phase: this.phase,
      flash: this.options.reducedMotion ? 0 : this.flash,
      slow: this.slowLeft > 0,
      reducedMotion: this.options.reducedMotion,
    });
    this.snapshotTimer -= realDt;
    if (this.snapshotTimer <= 0) {
      this.snapshotTimer = 0.1;
      this.publish();
    }
  }

  private updateFighter(fighter: Fighter, dt: number) {
    fighter.actionTime += dt;
    fighter.actionLeft = Math.max(0, fighter.actionLeft - dt);
    if (
      !fighter.actionLeft &&
      !["idle", "move", "dead"].includes(fighter.action)
    )
      this.setAction(fighter, "idle", 0);
  }

  private updatePlayer(dt: number) {
    if (this.phaseIntro > 0) return;
    const hunter = this.hunter;
    const movement = this.movement();
    if (hunter.action === "dodge") {
      const speed = hunter.actionTime < 0.24 ? 650 : 190;
      hunter.x += this.dodgeX * speed * dt;
      hunter.y += this.dodgeY * speed * DEPTH * dt;
      if (Math.random() < 0.75)
        this.motes.push({
          x: hunter.x,
          y: hunter.y - 24,
          size: 5 + Math.random() * 9,
          alpha: 0.3,
          color: 0xb6bbb4,
          life: 0.25,
          total: 0.25,
          vx: -this.dodgeX * 25,
          vy: 0,
        });
    } else if (hunter.action !== "hurt") {
      const speed =
        hunter.action === "attack" ? 95 : hunter.action === "parry" ? 60 : 260;
      hunter.x += movement.x * speed * dt;
      hunter.y += movement.y * speed * DEPTH * dt;
      if (!hunter.actionLeft)
        hunter.action = movement.x || movement.y ? "move" : "idle";
      if (this.pointerAiming && hunter.action !== "attack")
        hunter.facing = angleTo(hunter, { x: this.aimX, y: this.aimY });
      else if ((movement.x || movement.y) && hunter.action !== "attack")
        hunter.facing = Math.atan2(movement.y, movement.x);
    }
    hunter.x = Phaser.Math.Clamp(hunter.x, ARENA.left, ARENA.right);
    hunter.y = Phaser.Math.Clamp(hunter.y, ARENA.top, ARENA.bottom);
    const separation = distance(hunter, this.beast);
    if (separation < 75 && hunter.action !== "dodge") {
      const angle = angleTo(this.beast, hunter);
      hunter.x += Math.cos(angle) * (75 - separation);
      hunter.y += Math.sin(angle) * (75 - separation) * DEPTH;
    }
    if ((this.attackPending || this.attackHolding) && !hunter.actionLeft)
      this.beginSlash();
    if (
      hunter.action === "attack" &&
      hunter.actionTime >= 0.085 &&
      !this.slashResolved
    )
      this.resolveSlash();
  }

  private beginSlash() {
    this.attackPending = false;
    if (this.stamina < 13) return;
    this.stamina -= 13;
    this.staminaDelay = 0.23;
    this.slashResolved = false;
    this.slashCombo = (this.slashCombo + 1) % 3;
    if (!this.pointerAiming)
      this.hunter.facing = angleTo(this.hunter, this.beast);
    this.setAction(this.hunter, "attack", this.slashCombo === 0 ? 0.43 : 0.36);
    this.soundscape?.cue("slash");
  }

  private resolveSlash() {
    this.slashResolved = true;
    if (this.beast.health <= 0 || this.phaseIntro > 0) return;
    const range = distance(this.hunter, this.beast);
    const angle = Math.abs(
      angleDifference(this.hunter.facing, angleTo(this.hunter, this.beast)),
    );
    if (range > 185 || angle > 1.6) return;
    const critical = this.empowered && this.bossStagger > 0;
    const damage = critical ? 180 : this.slashCombo === 0 ? 34 : 25;
    this.beast.health = Math.max(0, this.beast.health - damage);
    this.hits++;
    this.addPosture(critical ? 0 : 4);
    if (critical) {
      this.empowered = false;
      this.slowLeft = 0.36;
      this.say("破绽，一击。", 1.4);
    }
    this.stopLeft = critical ? 0.09 : 0.035;
    this.flash = critical ? 0.25 : 0.065;
    this.shake(critical ? 140 : 60, critical ? 0.007 : 0.002);
    this.soundscape?.cue(critical ? "slam" : "hit");
    this.burst(
      (this.hunter.x + this.beast.x) / 2,
      this.beast.y - 65,
      critical ? 45 : 16,
      critical ? 0xecd9a1 : 0x8f433c,
      critical ? 360 : 190,
    );
    this.burst(this.beast.x, this.beast.y - 40, 7, 0xe1d8b7, 160);
    if (this.beast.health <= 0) this.win();
    else if (this.beast.health <= BOSS_HEALTH / 2 && this.phase === 1)
      this.enterPhaseTwo();
  }

  private updateBoss(dt: number) {
    if (this.mode !== "playing" || this.beast.health <= 0) return;
    this.beast.rage = Phaser.Math.Linear(
      this.beast.rage,
      this.phase === 2 ? 1 : 0,
      Math.min(1, dt * 0.8),
    );
    if (this.phaseIntro > 0) return;
    if (this.bossStagger > 0) {
      this.bossStagger = Math.max(0, this.bossStagger - dt);
      if (!this.bossStagger) {
        this.empowered = false;
        this.posture = 0;
        this.bossWait = 0.7;
      }
      return;
    }
    if (
      this.attacks.some((attack) => attack.kind !== "wave" && !attack.resolved)
    )
      return;
    this.beast.facing = angleTo(this.beast, this.hunter);
    this.bossWait -= dt;
    const gap = distance(this.beast, this.hunter);
    if (this.bossWait <= 0 && (gap < 305 || this.comboLeft > 0)) {
      this.beginBossAttack();
      return;
    }
    if (gap > 148) {
      const speed = this.phase === 2 ? 108 : 86;
      this.beast.x += Math.cos(this.beast.facing) * speed * dt;
      this.beast.y += Math.sin(this.beast.facing) * speed * DEPTH * dt;
      this.beast.x = Phaser.Math.Clamp(
        this.beast.x,
        ARENA.left + 62,
        ARENA.right - 62,
      );
      this.beast.y = Phaser.Math.Clamp(
        this.beast.y,
        ARENA.top + 28,
        ARENA.bottom - 32,
      );
      if (!this.beast.actionLeft) this.beast.action = "move";
    } else if (!this.beast.actionLeft) this.beast.action = "idle";
  }

  private beginBossAttack() {
    const patterns: AttackKind[] =
      this.phase === 1
        ? ["sweep", "thrust", "sweep", "slam"]
        : ["sweep", "thrust", "slam", "sweep", "slam"];
    let kind = patterns[this.attackIndex % patterns.length];
    if (this.comboLeft > 0) {
      kind = "sweep";
      this.comboLeft--;
    } else {
      this.attackIndex++;
      if (this.phase === 2 && kind !== "slam") this.comboLeft = 1;
    }
    const angle = angleTo(this.beast, this.hunter);
    const duration =
      (kind === "slam" ? 1.08 : kind === "thrust" ? 0.77 : 0.86) *
      (this.phase === 2 ? 0.84 : 1);
    this.attacks.push({
      kind,
      x: this.beast.x,
      y: this.beast.y,
      radius: kind === "slam" ? 215 : kind === "thrust" ? 330 : 195,
      angle,
      progress: 0,
      active: false,
      parryable: kind !== "slam",
      age: 0,
      duration,
      resolved: false,
      damage: kind === "slam" ? 28 : this.phase === 2 ? 22 : 18,
    });
    this.beast.facing = angle;
    this.setAction(this.beast, "parry", duration);
    this.soundscape?.cue("windup");
    if (kind === "slam") this.say("月影落下。闪避，别接刀。", 1.1);
    this.bossWait = this.comboLeft > 0 ? 0.22 : this.phase === 2 ? 0.78 : 1.08;
  }

  private updateAttacks(dt: number) {
    for (const attack of this.attacks) {
      attack.age += dt;
      attack.progress = Math.min(1, attack.age / attack.duration);
      if (attack.kind === "wave") {
        attack.radius = 25 + Math.max(0, attack.age - attack.duration) * 290;
        attack.active = attack.age >= attack.duration;
        if (
          attack.active &&
          !attack.resolved &&
          Math.abs(distance(this.hunter, attack) - attack.radius) < 29
        ) {
          this.receiveAttack(attack);
          attack.resolved = true;
        }
        continue;
      }
      if (attack.age < attack.duration) {
        // Telegraphs commit their direction early enough to dodge deliberately.
        if (attack.progress < 0.48 && attack.kind === "thrust")
          attack.angle = angleTo(attack, this.hunter);
        continue;
      }
      attack.active = attack.age < attack.duration + 0.19;
      if (attack.resolved) continue;
      attack.resolved = true;
      this.setAction(this.beast, "attack", 0.3);
      this.soundscape?.cue(attack.kind === "slam" ? "slam" : "slash");
      this.shake(
        attack.kind === "slam" ? 190 : 65,
        attack.kind === "slam" ? 0.006 : 0.0015,
      );
      this.burst(
        attack.x,
        attack.y - 8,
        attack.kind === "slam" ? 35 : 9,
        0xa8a395,
        attack.kind === "slam" ? 245 : 120,
      );
      if (this.inAttack(attack)) this.receiveAttack(attack);
      if (this.phase === 2 && attack.kind === "slam") {
        this.attacks.push({
          ...attack,
          kind: "wave",
          radius: 25,
          progress: 0,
          active: false,
          age: 0,
          duration: 0.3,
          resolved: false,
          damage: 18,
          parryable: false,
        });
      }
    }
    this.attacks = this.attacks.filter((attack) =>
      attack.kind === "wave"
        ? attack.age < 3.4
        : attack.age < attack.duration + 0.32,
    );
  }

  private inAttack(attack: Attack) {
    const gap = distance(this.hunter, attack);
    const delta = Math.abs(
      angleDifference(angleTo(attack, this.hunter), attack.angle),
    );
    if (attack.kind === "slam") return gap < attack.radius + 13;
    if (attack.kind === "sweep")
      return gap < attack.radius + 16 && delta < 1.88;
    if (attack.kind === "thrust")
      return (
        gap < attack.radius + 16 &&
        (gap < 65 || Math.abs(Math.sin(delta) * gap) < 40) &&
        delta < Math.PI / 2
      );
    return false;
  }

  private receiveAttack(attack: Attack) {
    if (this.mode !== "playing") return;
    if (this.hunter.action === "dodge" && this.invulnerable > 0) {
      if (!this.dodgePerfect && this.hunter.actionTime < 0.2) {
        this.dodgePerfect = true;
        this.perfectDodges++;
        this.stamina = Math.min(100, this.stamina + 22);
        this.hunter.health = Math.min(100, this.hunter.health + 2);
        this.slowLeft = 0.24;
        this.soundscape?.cue("perfect");
        this.say("完美闪避 · 擦过月光。", 1.1);
        this.burst(this.hunter.x, this.hunter.y - 35, 18, 0xe0e6db, 155);
      }
      return;
    }
    if (this.invulnerable > 0) return;
    const facingBoss =
      Math.abs(
        angleDifference(this.hunter.facing, angleTo(this.hunter, this.beast)),
      ) < 1.6;
    if (this.parryWindow > 0 && attack.parryable && facingBoss) {
      this.parryWindow = 0;
      this.parries++;
      this.stamina = Math.min(100, this.stamina + 28);
      this.hunter.health = Math.min(100, this.hunter.health + 4);
      this.invulnerable = 0.16;
      this.stopLeft = 0.08;
      this.slowLeft = 0.2;
      this.flash = 0.21;
      this.soundscape?.cue("parry");
      this.shake(110, 0.004);
      this.burst(
        this.hunter.x + Math.cos(this.hunter.facing) * 34,
        this.hunter.y - 42,
        34,
        0xf0d6a0,
        320,
      );
      this.say("弹反 · 铮，架势动摇。", 1.2);
      this.addPosture(27);
      return;
    }
    this.hunter.health = Math.max(0, this.hunter.health - attack.damage);
    this.invulnerable = 0.76;
    this.parryWindow = 0;
    this.attackPending = false;
    this.attackHolding = false;
    this.setAction(this.hunter, "hurt", 0.36);
    const away = angleTo(this.beast, this.hunter);
    this.hunter.x = Phaser.Math.Clamp(
      this.hunter.x + Math.cos(away) * 38,
      ARENA.left,
      ARENA.right,
    );
    this.hunter.y = Phaser.Math.Clamp(
      this.hunter.y + Math.sin(away) * 20,
      ARENA.top,
      ARENA.bottom,
    );
    this.flash = 0.28;
    this.stopLeft = 0.05;
    this.shake(160, 0.007);
    this.soundscape?.cue("hurt");
    this.burst(this.hunter.x, this.hunter.y - 25, 23, 0x98453c, 190);
    if (this.hunter.health <= 0) {
      this.mode = "dead";
      this.deaths++;
      this.deathTimer = 0.95;
      this.setAction(this.hunter, "dead", 0);
      this.soundscape?.cue("death");
      this.say("倒下。然后，再起身。", 1);
      this.publish();
    }
  }

  private addPosture(amount: number) {
    if (this.bossStagger > 0) return;
    this.lastPostureHit = this.clock;
    this.posture = Math.min(100, this.posture + amount);
    if (this.posture >= 100) {
      this.bossStagger = 3;
      this.empowered = true;
      this.comboLeft = 0;
      this.attacks = [];
      this.setAction(this.beast, "hurt", 3);
      this.say("架势崩解。近身，追击。", 2.7);
      this.soundscape?.cue("perfect");
      this.burst(this.beast.x, this.beast.y - 75, 35, 0xddc98b, 270);
    }
  }

  private enterPhaseTwo() {
    this.phase = 2;
    this.beast.phase = 2;
    this.phaseIntro = 2.2;
    this.attacks = [];
    this.comboLeft = 0;
    this.bossStagger = 0;
    this.posture = 0;
    this.empowered = false;
    this.bossWait = 0.9;
    this.invulnerable = 2.6;
    this.stamina = 100;
    this.hunter.health = Math.min(100, this.hunter.health + 25);
    this.soundscape?.setPhase(2);
    this.soundscape?.cue("phase");
    this.setAction(this.beast, "attack", 2.2);
    this.flash = 0.3;
    this.shake(550, 0.004);
    this.burst(this.beast.x, this.beast.y - 50, 80, 0xaa443a, 330);
    this.say("第二幕 · 月蚀。祂听见了你的心跳。", 4);
    this.publish();
  }

  private win() {
    this.mode = "victory";
    this.attacks = [];
    this.clearInput();
    this.setAction(this.beast, "dead", 0);
    this.slowLeft = 0.8;
    this.soundscape?.cue("victory");
    this.burst(this.beast.x, this.beast.y - 80, 100, 0xd6c7a1, 280);
    this.say("天快亮了。长夜，到此为止。", 999);
    this.publish();
  }

  private setAction(
    fighter: Fighter,
    action: FighterVisual["action"],
    duration: number,
  ) {
    fighter.action = action;
    fighter.actionLeft = duration;
    fighter.actionTime = 0;
  }

  private say(message: string, duration: number) {
    this.message = message;
    this.messageLeft = duration;
  }

  private shake(duration: number, intensity: number) {
    if (!this.options.reducedMotion)
      this.cameras.main.shake(duration, intensity, false);
  }

  private burst(
    x: number,
    y: number,
    count: number,
    color: number,
    force: number,
  ) {
    const total = this.options.reducedMotion ? Math.ceil(count * 0.5) : count;
    for (let i = 0; i < total; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = force * (0.2 + Math.random() * 0.8);
      const life = 0.22 + Math.random() * 0.44;
      this.motes.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.7 - 35,
        color,
        size: 1 + Math.random() * 3.3,
        alpha: 1,
        life,
        total: life,
      });
    }
    if (this.motes.length > 320) this.motes.splice(0, this.motes.length - 320);
  }

  private updateParticles(dt: number) {
    for (const mote of this.motes) {
      mote.life -= dt;
      mote.alpha = Math.max(0, mote.life / mote.total);
      mote.x += mote.vx * dt;
      mote.y += mote.vy * dt;
      mote.vy += 145 * dt;
      mote.vx *= Math.max(0, 1 - dt * 1.8);
    }
    this.motes = this.motes.filter((mote) => mote.life > 0);
  }

  private publish() {
    if (!this.hunter || this.disposed) return;
    const snapshot: HuntSnapshot = {
      mode: this.mode,
      health: this.hunter.health,
      stamina: this.stamina,
      bossHealth: this.beast.health,
      bossMaxHealth: BOSS_HEALTH,
      posture: this.posture,
      phase: this.phase,
      elapsed: this.elapsed,
      deaths: this.deaths,
      hits: this.hits,
      parries: this.parries,
      perfectDodges: this.perfectDodges,
      message: this.message,
      muted: this.muted,
    };
    this.options.onSnapshot(snapshot);
  }
}
