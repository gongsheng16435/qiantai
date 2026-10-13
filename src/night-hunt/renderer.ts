import Phaser from "phaser";
import { ARENA } from "./types";
import { drawHunter, drawBoss } from "./fighters";
import type { HuntVisual, TelegraphVisual } from "./types";

// Original artwork, drawn here rather than fetched: charcoal, scratched paper,
// ruined masonry and a creature assembled from a cracked bell and weathered bone.
const W = 1280,
  H = 720;
const CHALK = 0xdad4c4,
  PAPER = 0xf2ebd9;
type Point = [number, number];
type G = Phaser.GameObjects.Graphics;

function random(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}
function polygon(
  g: G,
  points: Point[],
  fill: number,
  alpha = 1,
  stroke = CHALK,
  lineAlpha = 0.55,
  width = 1,
) {
  g.fillStyle(fill, alpha).fillPoints(
    points.map(([x, y]) => ({ x, y })),
    true,
  );
  if (lineAlpha)
    g.lineStyle(width, stroke, lineAlpha).strokePoints(
      points.map(([x, y]) => ({ x, y })),
      true,
    );
}
function line(g: G, points: Point[], color = CHALK, alpha = 0.6, width = 1) {
  g.lineStyle(width, color, alpha).strokePoints(
    points.map(([x, y]) => ({ x, y })),
    false,
  );
}
function canvasPath(
  c: CanvasRenderingContext2D,
  p: Point[],
  fill?: string,
  stroke?: string,
  width = 1,
) {
  c.beginPath();
  p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  if (fill) {
    c.closePath();
    c.fillStyle = fill;
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.stroke();
  }
}

function paintMoon(c: CanvasRenderingContext2D) {
  const rnd = random(7193);
  const glow = c.createRadialGradient(810, 174, 10, 810, 174, 425);
  glow.addColorStop(0, "#ddd8cc22");
  glow.addColorStop(0.5, "#c7c8cc0c");
  glow.addColorStop(1, "#c7c8cc00");
  c.fillStyle = glow;
  c.fillRect(0, 0, W, H);
  // A huge engraved moon, with fine irregular contour lines and crater shading.
  c.save();
  c.beginPath();
  c.arc(821, 181, 132, 0, Math.PI * 2);
  c.clip();
  const moon = c.createLinearGradient(700, 60, 930, 310);
  moon.addColorStop(0, "#bec2c0");
  moon.addColorStop(0.6, "#999e9d");
  moon.addColorStop(1, "#626c73");
  c.fillStyle = moon;
  c.fillRect(685, 40, 275, 280);
  // Uneven lunar seas soften the regular hatch marks into worn stone.
  c.save();
  c.filter = "blur(4px)";
  for (let i = 0; i < 35; i++) {
    const cluster = i % 3;
    const x = [764, 832, 861][cluster] + (rnd() - 0.5) * 60;
    const y = [133, 234, 148][cluster] + (rnd() - 0.5) * 65;
    c.fillStyle = `rgba(28,39,49,${0.025 + rnd() * 0.05})`;
    c.beginPath();
    c.ellipse(x, y, 10 + rnd() * 29, 7 + rnd() * 20, -0.4, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
  c.lineWidth = 0.6;
  for (let i = 0; i < 1350; i++) {
    const x = 685 + rnd() * 280,
      y = 45 + rnd() * 274;
    c.strokeStyle = `rgba(43,46,51,${0.03 + rnd() * 0.12})`;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + 6 + rnd() * 30, y - 2 - rnd() * 9);
    c.stroke();
  }
  for (let i = 0; i < 46; i++) {
    const x = 711 + rnd() * 228,
      y = 58 + rnd() * 240,
      r = 3 + rnd() * 24;
    c.strokeStyle = `rgba(52,57,64,${0.035 + rnd() * 0.08})`;
    c.lineWidth = 0.8;
    c.beginPath();
    c.ellipse(x, y, r, r * 0.58, -0.6, 0, Math.PI * 2);
    c.stroke();
    for (let j = 0; j < 7; j++)
      canvasPath(
        c,
        [
          [x - r + j * 3, y],
          [x - r + j * 3 + 7, y - 7],
        ],
        undefined,
        "#353b4514",
        0.7,
      );
  }
  c.restore();
  c.strokeStyle = "#eee8dc55";
  c.lineWidth = 0.6;
  c.beginPath();
  c.arc(821, 181, 133.5, 0.1, Math.PI * 1.92);
  c.stroke();
}

function paintWorld(c: CanvasRenderingContext2D, backdrop?: CanvasImageSource) {
  if (!backdrop) {
    paintFallbackWorld(c);
    return;
  }
  // Raise the illustrated horizon to the walkable ground plane. The illustration
  // remains local; the engraved moon and all playable silhouettes are drawn here.
  c.drawImage(backdrop, -W * 0.085, -H * 0.17, W * 1.17, H * 1.17);
  c.fillStyle = "#080b0e60";
  c.fillRect(0, 0, W, H);
  const ground = c.createLinearGradient(0, H * 0.47, 0, H);
  ground.addColorStop(0, "#080a0c00");
  ground.addColorStop(0.5, "#080a0c45");
  ground.addColorStop(1, "#06080b8c");
  c.fillStyle = ground;
  c.fillRect(0, 0, W, H);
  paintMoon(c);
  // Silvery spill ties the moon to the wet stone without lifting the whole image.
  const spill = c.createRadialGradient(813, 450, 5, 813, 450, 340);
  spill.addColorStop(0, "#dbdfd20b");
  spill.addColorStop(1, "#dbdfd200");
  c.fillStyle = spill;
  c.fillRect(0, 350, W, H - 350);
  const edge = c.createRadialGradient(
    W * 0.52,
    H * 0.5,
    H * 0.27,
    W * 0.52,
    H * 0.5,
    W * 0.65,
  );
  edge.addColorStop(0, "#080a0c00");
  edge.addColorStop(0.6, "#080a0c05");
  edge.addColorStop(1, "#06080b99");
  c.fillStyle = edge;
  c.fillRect(0, 0, W, H);
}

function paintFallbackWorld(c: CanvasRenderingContext2D) {
  const rnd = random(4173);
  const sky = c.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#101719");
  sky.addColorStop(0.47, "#303737");
  sky.addColorStop(0.72, "#202727");
  sky.addColorStop(1, "#0d1314");
  c.fillStyle = sky;
  c.fillRect(0, 0, W, H);
  paintMoon(c);

  // A distant skyline, mostly lost in the damp air.
  for (let i = 0; i < 28; i++) {
    const x = i * 52 - 50,
      h = 35 + rnd() * 80,
      base = 423 + rnd() * 17;
    canvasPath(
      c,
      [
        [x, base],
        [x, base - h],
        [x + 12, base - h],
        [x + 23, base - h - 31],
        [x + 34, base - h],
        [x + 41, base - h],
        [x + 43, base],
      ],
      "#242d2dc0",
      "#91a09112",
    );
    canvasPath(
      c,
      [
        [x + 22, base - h - 30],
        [x + 22, base - h - 47],
      ],
      undefined,
      "#71817a33",
    );
    for (let j = 0; j < 3; j++)
      canvasPath(
        c,
        [
          [x + 10 + j * 10, base - 12],
          [x + 10 + j * 10, base - h + 14],
        ],
        undefined,
        "#a0a48c10",
      );
  }
  // The remaining columns of an open-air chapel. Pointed vaults are deliberately
  // uneven: the line work reads as an illustration rather than a tiled backdrop.
  const arch = (
    x: number,
    y: number,
    width: number,
    height: number,
    opacity: number,
  ) => {
    c.save();
    c.globalAlpha = opacity;
    c.fillStyle = "#111a1b";
    c.beginPath();
    c.moveTo(x - 16, 492);
    c.lineTo(x - 16, y);
    c.bezierCurveTo(
      x - 10,
      y - height * 0.45,
      x + width * 0.24,
      y - height * 0.78,
      x + width * 0.5,
      y - height,
    );
    c.bezierCurveTo(
      x + width * 0.8,
      y - height * 0.8,
      x + width + 18,
      y - height * 0.39,
      x + width + 19,
      y,
    );
    c.lineTo(x + width + 19, 492);
    c.lineTo(x + width - 7, 492);
    c.lineTo(x + width - 7, y);
    c.bezierCurveTo(
      x + width - 13,
      y - height * 0.4,
      x + width * 0.7,
      y - height * 0.65,
      x + width * 0.5,
      y - height + 30,
    );
    c.bezierCurveTo(
      x + width * 0.3,
      y - height * 0.63,
      x + 12,
      y - height * 0.35,
      x + 10,
      y,
    );
    c.lineTo(x + 10, 492);
    c.closePath();
    c.fill();
    c.strokeStyle = "#aab0a043";
    c.lineWidth = 1;
    c.stroke();
    for (let i = 0; i < 16; i++) {
      const ay = y + i * 18;
      if (ay < 490) {
        canvasPath(
          c,
          [
            [x - 14, ay],
            [x + 8, ay - 1],
          ],
          undefined,
          "#b0b09c25",
        );
        canvasPath(
          c,
          [
            [x + width - 6, ay + 6],
            [x + width + 17, ay + 4],
          ],
          undefined,
          "#b0b09c25",
        );
      }
    }
    for (let i = 0; i < 50; i++) {
      const ay = y + rnd() * (490 - y),
        ax = rnd() > 0.5 ? x : x + width;
      canvasPath(
        c,
        [
          [ax - 7 + rnd() * 12, ay],
          [ax - 1 + rnd() * 12, ay - 7],
        ],
        undefined,
        "#bec2ab1b",
        0.7,
      );
    }
    c.restore();
  };
  arch(194, 304, 166, 148, 0.67);
  arch(367, 325, 154, 139, 0.44);
  arch(1015, 280, 187, 207, 0.88);
  arch(1161, 309, 172, 199, 0.9);
  // Broken belfry at the far left, framing the light instead of enclosing it.
  canvasPath(
    c,
    [
      [0, 484],
      [0, 0],
      [55, 0],
      [61, 110],
      [93, 112],
      [97, 166],
      [121, 180],
      [111, 212],
      [119, 291],
      [139, 313],
      [146, 486],
    ],
    "#101819",
    "#a3a99444",
  );
  canvasPath(
    c,
    [
      [55, 0],
      [53, 102],
      [80, 132],
      [70, 192],
      [91, 252],
      [84, 331],
      [110, 392],
    ],
    undefined,
    "#babaa142",
    1.2,
  );
  for (let i = 0; i < 110; i++) {
    const x = 10 + rnd() * 103,
      y = rnd() * 480;
    canvasPath(
      c,
      [
        [x, y],
        [x + 8 + rnd() * 9, y - 12 - rnd() * 13],
      ],
      undefined,
      "#afb49b1b",
      0.8,
    );
  }
  // A suspended, silent bell, its cords nearly erased by the moonlight.
  canvasPath(
    c,
    [
      [274, 168],
      [274, 248],
    ],
    undefined,
    "#b9c0ac45",
    0.8,
  );
  canvasPath(
    c,
    [
      [264, 247],
      [267, 233],
      [280, 232],
      [283, 246],
      [290, 253],
      [257, 253],
      [264, 247],
    ],
    "#29302e",
    "#b9c0ac46",
  );
  canvasPath(
    c,
    [
      [273, 253],
      [274, 260],
    ],
    undefined,
    "#c6c6ad55",
    1.3,
  );

  const mist = c.createLinearGradient(0, 360, 0, 565);
  mist.addColorStop(0, "#a5b2a300");
  mist.addColorStop(0.48, "#a5b2a30d");
  mist.addColorStop(1, "#a5b2a300");
  c.fillStyle = mist;
  c.fillRect(0, 340, W, 250);
  // Wet flagstones recede toward the chapel. No regular checkerboard pattern.
  for (let i = 0; i < 190; i++) {
    const y = 425 + rnd() * 275,
      depth = (y - 400) / 320,
      x = rnd() * W,
      w = 8 + depth * (18 + rnd() * 85);
    canvasPath(
      c,
      [
        [x, y],
        [x + w * 0.67, y - 2],
        [x + w, y + depth * 5],
      ],
      undefined,
      `rgba(167,179,158,${0.03 + rnd() * 0.12})`,
      0.5 + depth * 0.4,
    );
    if (rnd() > 0.64)
      canvasPath(
        c,
        [
          [x, y],
          [x - 10 * depth, y + 8 * depth],
        ],
        undefined,
        "#b1b8a012",
        0.7,
      );
  }
  for (let i = 0; i < 30; i++) {
    const x = 260 + rnd() * 780,
      y = 452 + rnd() * 210;
    c.beginPath();
    c.ellipse(x, y, 15 + rnd() * 55, 1 + rnd() * 3, -0.02, 0, Math.PI * 2);
    c.fillStyle = "#aab7a208";
    c.fill();
  }
  // Bare branches and patches of wiry grass occupy only the frame edges.
  for (let i = 0; i < 45; i++) {
    const x = rnd() > 0.5 ? rnd() * 170 : 1110 + rnd() * 170,
      y = 480 + rnd() * 240;
    const h = 6 + rnd() * 26;
    canvasPath(
      c,
      [
        [x - 8, y],
        [x - 4, y - h * 0.64],
        [x, y],
        [x + 4, y - h],
        [x + 7, y],
      ],
      undefined,
      "#b1b99e32",
      0.8,
    );
  }
  canvasPath(
    c,
    [
      [0, 579],
      [66, 568],
      [79, 527],
      [103, 522],
      [108, 554],
      [129, 542],
      [141, 569],
      [179, 577],
      [182, 610],
      [0, 655],
    ],
    "#0c1415",
  );
  canvasPath(
    c,
    [
      [1163, 678],
      [1181, 625],
      [1200, 611],
      [1204, 574],
      [1224, 565],
      [1241, 603],
      [1280, 602],
      [1280, 720],
    ],
    "#0c1415",
  );
  // Paper grain is baked into the background, never animated or downloaded.
  for (let i = 0; i < 9500; i++) {
    c.fillStyle = rnd() > 0.5 ? "#d7dcc70a" : "#00000010";
    c.fillRect(rnd() * W, rnd() * H, rnd() > 0.8 ? 2 : 1, 1);
  }
  const vignette = c.createRadialGradient(650, 355, 190, 650, 355, 760);
  vignette.addColorStop(0, "#060b0d00");
  vignette.addColorStop(0.6, "#060b0d12");
  vignette.addColorStop(1, "#060b0dc9");
  c.fillStyle = vignette;
  c.fillRect(0, 0, W, H);
}

function drawTelegraph(g: G, t: TelegraphVisual, time: number) {
  const color = t.parryable ? 0xe6dfd0 : 0xd48a73;
  const alpha = t.active ? 0.9 : 0.24 + t.progress * 0.5;
  const r = t.radius;
  const ellipse = (radius: number) =>
    g
      .lineStyle(5, 0x080a0c, alpha * 0.65)
      .strokeEllipse(t.x, t.y, radius * 2, radius * 1.1)
      .lineStyle(t.active ? 2 : 1, color, alpha)
      .strokeEllipse(t.x, t.y, radius * 2, radius * 1.1);
  if (t.kind === "slam" || t.kind === "wave") {
    ellipse(r);
    g.lineStyle(0.6, color, alpha * 0.45).strokeEllipse(
      t.x,
      t.y,
      (r + 5) * 2,
      (r + 5) * 1.1,
    );
    if (t.kind === "slam") {
      g.fillStyle(color, 0.016 + t.progress * 0.025).fillEllipse(
        t.x,
        t.y,
        r * 2,
        r * 1.1,
      );
      ellipse(Math.max(8, r * (1 - t.progress)));
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        line(
          g,
          [
            [t.x + Math.cos(a) * (r - 8), t.y + Math.sin(a) * (r - 8) * 0.55],
            [t.x + Math.cos(a) * (r + 8), t.y + Math.sin(a) * (r + 8) * 0.55],
          ],
          color,
          alpha,
        );
      }
    }
  } else if (t.kind === "thrust") {
    const nx = Math.cos(t.angle),
      ny = Math.sin(t.angle),
      w = 40;
    const pts: Point[] = [
      [t.x - ny * w, t.y + nx * w * 0.55],
      [t.x + nx * r - ny * w, t.y + (ny * r + nx * w) * 0.55],
      [t.x + nx * r + ny * w, t.y + (ny * r - nx * w) * 0.55],
      [t.x + ny * w, t.y - nx * w * 0.55],
    ];
    polygon(g, pts, 0x080a0c, 0.18, 0x080a0c, alpha * 0.6, 4);
    polygon(g, pts, color, 0.025 + t.progress * 0.035, color, alpha, 1.2);
    line(
      g,
      [
        [t.x, t.y],
        [t.x + nx * r * t.progress, t.y + ny * r * t.progress * 0.55],
      ],
      color,
      alpha * 0.65,
      2,
    );
  } else {
    const spread = 1.88,
      pts: Point[] = [[t.x, t.y]];
    for (let i = 0; i <= 30; i++) {
      const a = t.angle - spread + (i / 30) * spread * 2;
      pts.push([t.x + Math.cos(a) * r, t.y + Math.sin(a) * r * 0.55]);
    }
    polygon(g, pts, 0x080a0c, 0.18, 0x080a0c, alpha * 0.6, 4);
    polygon(g, pts, color, 0.022 + t.progress * 0.028, color, alpha, 1.2);
    const progress: Point[] = [];
    for (let i = 0; i <= 30 * t.progress; i++) {
      const a = t.angle - spread + (i / 30) * spread * 2;
      progress.push([
        t.x + Math.cos(a) * (r - 4),
        t.y + Math.sin(a) * (r - 4) * 0.55,
      ]);
    }
    if (progress.length > 1) line(g, progress, color, alpha * 0.9, 2);
  }
  // Small crossed warning marks are readable even without hue perception.
  if (t.progress > 0.65 && !t.active) {
    const y = t.y - 102 - Math.sin(time * 9) * 2,
      a = (t.progress - 0.65) / 0.35;
    line(
      g,
      [
        [t.x, y - 7],
        [t.x + 7, y],
        [t.x, y + 7],
        [t.x - 7, y],
        [t.x, y - 7],
      ],
      color,
      a,
      1.2,
    );
    if (!t.parryable)
      line(
        g,
        [
          [t.x - 5, y - 5],
          [t.x + 5, y + 5],
        ],
        color,
        a,
        1.4,
      );
  }
}

export function createHuntRenderer(scene: Phaser.Scene) {
  const key = `night-hunt-etching-${Math.random().toString(36).slice(2)}`;
  const texture = scene.textures.createCanvas(key, W, H);
  if (texture) {
    paintWorld(
      texture.context,
      scene.textures.exists("hunt-courtyard")
        ? (scene.textures
            .get("hunt-courtyard")
            .getSourceImage() as HTMLImageElement)
        : undefined,
    );
    texture.refresh();
  }
  const backdrop = scene.add
    .image(ARENA.width / 2, ARENA.height / 2, key)
    .setDisplaySize(ARENA.width, ARENA.height)
    .setDepth(0);
  const eclipse = scene.add
    .graphics()
    .setScale(ARENA.width / W, ARENA.height / H)
    .setDepth(1);
  const lunarShadow = scene.add
    .graphics()
    .setScale(ARENA.width / W, ARENA.height / H)
    .setDepth(2);
  const lunarDisk = scene.make.graphics({ x: 0, y: 0 });
  lunarDisk
    .setScale(ARENA.width / W, ARENA.height / H)
    .fillStyle(0xffffff)
    .fillCircle(821, 181, 132);
  const lunarMask = lunarDisk.createGeometryMask();
  lunarShadow.setMask(lunarMask);
  // Soft, cached ink washes move between the floor and the foreground, keeping
  // the expensive atmospheric texture generation out of the animation loop.
  const fogKey = `${key}-mist`;
  const fogTexture = scene.textures.createCanvas(fogKey, 512, 128);
  if (fogTexture) {
    const c = fogTexture.context;
    for (let i = 0; i < 8; i++) {
      const x = 25 + i * 65,
        y = 58 + Math.sin(i * 2.1) * 22;
      const wash = c.createRadialGradient(x, y, 0, x, y, 90);
      wash.addColorStop(0, "#c9ccd435");
      wash.addColorStop(1, "#c9ccd400");
      c.fillStyle = wash;
      c.fillRect(0, 0, 512, 128);
    }
    fogTexture.refresh();
  }
  const groundMist = scene.add
    .image(ARENA.width / 2, 550, fogKey)
    .setDisplaySize(ARENA.width * 1.2, 170)
    .setDepth(25)
    .setAlpha(0.24);
  const foregroundMist = scene.add
    .image(ARENA.width / 2, 795, fogKey)
    .setDisplaySize(ARENA.width * 1.5, 140)
    .setDepth(ARENA.height + 100)
    .setAlpha(0.17);
  const shadows = scene.add.graphics().setDepth(30);
  const marks = scene.add.graphics().setDepth(40);
  const hunter = scene.add.graphics();
  const boss = scene.add.graphics();
  const atmosphere = scene.add.graphics().setDepth(ARENA.height + 200);
  const flashes = scene.add.graphics().setDepth(ARENA.height + 300);
  let phaseMix = 0,
    lastTime = 0;
  return {
    render(v: HuntVisual) {
      const dt = Math.min(0.05, Math.max(0, v.time - lastTime));
      lastTime = v.time;
      phaseMix = Phaser.Math.Clamp(
        phaseMix + (v.phase === 2 ? dt * 0.45 : -dt),
        0,
        1,
      );
      const drift = v.reducedMotion ? 0 : Math.sin(v.time * 0.08) * 30;
      groundMist.setX(ARENA.width / 2 + drift);
      foregroundMist.setX(ARENA.width / 2 - drift * 0.7);
      groundMist.setTint(v.phase === 2 ? 0xc8a9a0 : 0xd5d8df);
      foregroundMist.setTint(v.phase === 2 ? 0xbda296 : 0xc9cdd8);
      eclipse.clear();
      lunarShadow.clear();
      if (phaseMix > 0) {
        eclipse.fillStyle(0x652817, 0.11 * phaseMix).fillRect(0, 0, W, H);
        lunarShadow
          .fillStyle(0x14171b, 0.97 * phaseMix)
          .fillCircle(793, 167, 126);
        eclipse
          .lineStyle(1.4, 0xb7805b, 0.6 * phaseMix)
          .strokeCircle(821, 181, 134);
        line(
          eclipse,
          [
            [872, 65],
            [852, 110],
            [865, 142],
            [842, 185],
            [860, 211],
            [845, 244],
            [856, 295],
          ],
          0x684331,
          0.6 * phaseMix,
          2,
        );
        line(
          eclipse,
          [
            [867, 140],
            [897, 152],
            [910, 175],
          ],
          0x784b36,
          0.5 * phaseMix,
          1,
        );
      }
      shadows.clear();
      for (const f of [v.boss, v.player]) {
        const isBoss = f === v.boss,
          w = isBoss ? 143 : 56;
        shadows
          .fillStyle(0x050b0c, 0.19)
          .fillEllipse(f.x, f.y + 5, w + 25, isBoss ? 27 : 15);
        shadows
          .fillStyle(0x050b0c, 0.42)
          .fillEllipse(f.x, f.y + 3, w, isBoss ? 18 : 9);
        shadows
          .lineStyle(0.6, CHALK, 0.04)
          .lineBetween(f.x - w * 0.4, f.y + 13, f.x + w * 0.3, f.y + 13);
      }
      marks.clear();
      v.telegraphs.forEach((t) =>
        drawTelegraph(marks, t, v.reducedMotion ? 0 : v.time),
      );
      drawHunter(hunter, v.player, v.time, v.reducedMotion);
      drawBoss(boss, v.boss, v.time, v.reducedMotion);
      atmosphere.clear();
      const t = v.reducedMotion ? 0 : v.time;
      for (let i = 0; i < 46; i++) {
        const x = (i * 197.13 + t * (3 + (i % 5) * 1.4)) % ARENA.width,
          y =
            (i * 113.47 - t * (1.5 + (i % 4)) + ARENA.height * 10) %
            ARENA.height;
        const a = 0.08 + Math.sin(i * 2.7 + t * 0.7) * 0.055;
        atmosphere
          .lineStyle(i % 7 === 0 ? 1.5 : 0.7, CHALK, a)
          .lineBetween(x, y, x + 2 + (i % 3), y - 1);
      }
      if (phaseMix > 0.05)
        for (let i = 0; i < 23; i++) {
          const x = (i * 197.6 + Math.sin(t * 0.6 + i) * 17) % ARENA.width,
            y =
              ARENA.height -
              ((i * 71 + t * (12 + (i % 5) * 4)) % (ARENA.height * 0.76));
          atmosphere
            .lineStyle(0.9, 0xd59c70, (0.18 + (i % 3) * 0.07) * phaseMix)
            .lineBetween(x, y, x + 1, y - 3);
        }
      for (const p of v.particles) {
        atmosphere
          .fillStyle(p.color, p.alpha)
          .fillEllipse(
            p.x,
            p.y,
            Math.max(1, p.size * 1.05),
            Math.max(0.7, p.size * 0.38),
          );
        if (p.size > 1.5)
          atmosphere
            .lineStyle(0.7, p.color, p.alpha * 0.6)
            .lineBetween(
              p.x,
              p.y,
              p.x - (p.vx ?? 0) * 0.035,
              p.y - (p.vy ?? 0) * 0.035,
            );
      }
      flashes.clear();
      if (v.flash > 0.01)
        flashes
          .fillStyle(PAPER, Math.min(0.24, v.flash * 0.22))
          .fillRect(0, 0, ARENA.width, ARENA.height);
      if (v.slow && !v.reducedMotion) {
        flashes
          .lineStyle(0.5, CHALK, 0.1)
          .strokeRect(17, 17, ARENA.width - 34, ARENA.height - 34);
      }
    },
    destroy() {
      backdrop.destroy();
      eclipse.destroy();
      lunarShadow.clearMask().destroy();
      lunarMask.destroy();
      lunarDisk.destroy();
      groundMist.destroy();
      foregroundMist.destroy();
      shadows.destroy();
      marks.destroy();
      hunter.destroy();
      boss.destroy();
      atmosphere.destroy();
      flashes.destroy();
      scene.textures.remove(key);
      scene.textures.remove(fogKey);
    },
  };
}
