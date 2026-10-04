import Phaser from "phaser";
import type {
  FighterVisual,
  HuntVisual,
  BossVisual,
  TelegraphVisual,
} from "./types";

// Original artwork, drawn here rather than fetched: charcoal, scratched paper,
// ruined masonry and a creature assembled from a cracked bell and weathered bone.
const W = 1280,
  H = 720;
const CHALK = 0xdad4c4,
  PAPER = 0xf2ebd9,
  ASH = 0x777971,
  INK = 0x171b1b;
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
function bone(g: G, points: Point[], width = 5, light = CHALK) {
  line(g, points, INK, 1, width + 5);
  line(g, points, light, 0.72, width);
  line(
    g,
    points.map(([x, y]) => [x + 1.5, y + 1.5]),
    0x494c46,
    0.8,
    Math.max(1, width - 3),
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

function paintWorld(c: CanvasRenderingContext2D) {
  const rnd = random(4173);
  const sky = c.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#101719");
  sky.addColorStop(0.47, "#303737");
  sky.addColorStop(0.72, "#202727");
  sky.addColorStop(1, "#0d1314");
  c.fillStyle = sky;
  c.fillRect(0, 0, W, H);
  const glow = c.createRadialGradient(810, 174, 10, 810, 174, 425);
  glow.addColorStop(0, "#c2c6b026");
  glow.addColorStop(0.5, "#9ca99c0c");
  glow.addColorStop(1, "#83918700");
  c.fillStyle = glow;
  c.fillRect(0, 0, W, H);
  // A huge engraved moon, with fine irregular contour lines and crater shading.
  c.save();
  c.beginPath();
  c.arc(821, 181, 132, 0, Math.PI * 2);
  c.clip();
  const moon = c.createLinearGradient(700, 60, 930, 310);
  moon.addColorStop(0, "#d3d4bf");
  moon.addColorStop(0.6, "#b4bbaa");
  moon.addColorStop(1, "#828e83");
  c.fillStyle = moon;
  c.fillRect(685, 40, 275, 280);
  c.lineWidth = 0.6;
  for (let i = 0; i < 1350; i++) {
    const x = 685 + rnd() * 280,
      y = 45 + rnd() * 274;
    c.strokeStyle = `rgba(43,58,55,${0.03 + rnd() * 0.12})`;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + 6 + rnd() * 30, y - 2 - rnd() * 9);
    c.stroke();
  }
  for (let i = 0; i < 46; i++) {
    const x = 711 + rnd() * 228,
      y = 58 + rnd() * 240,
      r = 3 + rnd() * 24;
    c.strokeStyle = `rgba(56,72,65,${0.035 + rnd() * 0.08})`;
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
        "#3c4d4214",
        0.7,
      );
  }
  c.restore();
  c.strokeStyle = "#e5e3cf44";
  c.lineWidth = 0.6;
  c.beginPath();
  c.arc(821, 181, 133.5, 0.1, Math.PI * 1.92);
  c.stroke();

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

function drawHunter(g: G, p: FighterVisual, time: number, reduced: boolean) {
  const moving = p.action === "move",
    dodge = p.action === "dodge",
    attack = p.action === "attack",
    parry = p.action === "parry";
  const step = moving ? Math.sin(time * 13) : 0;
  const bob = reduced
    ? 0
    : moving
      ? Math.abs(step) * 2
      : Math.sin(time * 2) * 0.7;
  const swing = attack
    ? Math.sin(Math.min(1, p.actionTime / 0.34) * Math.PI)
    : 0;
  g.clear();
  g.setPosition(p.x, p.y + bob)
    .setScale(Math.cos(p.facing) >= 0 ? 1 : -1, 1)
    .setDepth(100 + p.y);
  g.setRotation(p.action === "dead" ? -1.2 : dodge ? 0.22 : 0);
  g.setAlpha(p.action === "dead" ? 0.6 : 1);
  const light = p.action === "hurt" ? 0xe9a292 : CHALK;
  if (dodge) {
    for (let i = 1; i < 4; i++) {
      const x = -i * 13;
      polygon(
        g,
        [
          [x - 8, -59],
          [x + 7, -54],
          [x + 11, -31],
          [x - 3, -9],
          [x - 13, -12],
          [x - 9, -36],
        ],
        light,
        0.04 + 0.035 * (3 - i),
        light,
        0,
      );
      line(
        g,
        [
          [x - 12, -44],
          [x - 29, -39],
        ],
        light,
        0.17 / i,
      );
    }
  }
  // Soft graphite silhouette of a narrow travelling coat, split at the hem.
  polygon(
    g,
    [
      [-9, -51],
      [6, -52],
      [12, -39],
      [8, -25],
      [16 + step * 2, -8],
      [0, -14],
      [-9, -7],
      [-18 - step * 2, -10],
      [-10, -31],
    ],
    0x222a28,
    1,
    light,
    0.72,
    1.1,
  );
  polygon(
    g,
    [
      [-9, -45],
      [-4, -36],
      [-3, -17],
      [-11, -9],
      [-13, -12],
    ],
    0x586056,
    0.35,
    light,
    0.22,
    0.7,
  );
  line(
    g,
    [
      [-6, -45],
      [-5, -32],
      [-10, -19],
    ],
    light,
    0.45,
    0.8,
  );
  line(
    g,
    [
      [3, -41],
      [2, -28],
      [8, -17],
    ],
    light,
    0.28,
    0.7,
  );
  line(
    g,
    [
      [-9, -47],
      [-1, -40],
      [7, -47],
    ],
    light,
    0.82,
    1,
  );
  bone(
    g,
    [
      [-5, -16],
      [-8 - step * 5, -5],
      [-6 - step * 7, 0],
    ],
    3.3,
    light,
  );
  bone(
    g,
    [
      [5, -17],
      [7 + step * 5, -6],
      [11 + step * 7, 0],
    ],
    3.3,
    light,
  );
  line(
    g,
    [
      [-10 - step * 7, 0],
      [-4 - step * 7, 0],
    ],
    light,
    0.72,
    2.2,
  );
  line(
    g,
    [
      [7 + step * 7, 0],
      [16 + step * 7, 0],
    ],
    light,
    0.72,
    2.2,
  );
  // Face is a sliver of paper under the broad, weather-worn hat.
  polygon(
    g,
    [
      [-5, -60],
      [6, -60],
      [8, -53],
      [3, -49],
      [-4, -51],
    ],
    0x111a1a,
    1,
    light,
    0.6,
    0.8,
  );
  line(
    g,
    [
      [5, -57],
      [8, -55],
      [5, -54],
    ],
    PAPER,
    0.8,
    0.8,
  );
  polygon(
    g,
    [
      [-10, -62],
      [-6, -70],
      [4, -72],
      [10, -62],
      [18, -60],
      [8, -58],
      [-16, -59],
    ],
    0x1b2422,
    1,
    light,
    0.82,
    1,
  );
  line(
    g,
    [
      [-7, -62],
      [9, -62],
    ],
    light,
    0.4,
    0.7,
  );
  // Scarf and hatching make the tiny figure legible without an outline glow.
  polygon(
    g,
    [
      [-5, -49],
      [-20, -44],
      [-27 - step * 2, -48],
      [-17, -49],
      [-9, -53],
    ],
    0x858573,
    0.65,
    light,
    0.3,
    0.6,
  );
  for (let i = 0; i < 5; i++)
    line(
      g,
      [
        [-9 + i * 3, -30],
        [-13 + i * 3, -20],
      ],
      light,
      0.14,
      0.65,
    );
  const hand: Point = parry
    ? [13, -53]
    : attack
      ? [22 + 16 * swing, -43 - 10 * swing]
      : [13, -32];
  bone(g, [[5, -47], [11, -40], hand], 3, light);
  bone(
    g,
    [
      [-9, -44],
      [-14, -33],
      [-9, -27],
    ],
    2.5,
    light,
  );
  const tip: Point = parry
    ? [24, -89]
    : attack
      ? [58 + 27 * swing, -64 + 70 * swing]
      : [49, -47];
  line(
    g,
    [
      [hand[0] - 4, hand[1] + 2],
      [tip[0], tip[1]],
    ],
    0x111718,
    1,
    4,
  );
  line(g, [hand, tip], PAPER, 0.95, 1.4);
  line(
    g,
    [
      [hand[0] - 3, hand[1] - 4],
      [hand[0] + 3, hand[1] + 5],
    ],
    CHALK,
    0.9,
    2,
  );
  if (attack) {
    const t = Math.min(1, p.actionTime / 0.34),
      a = -1.2 + t * 2.6;
    g.lineStyle(2, PAPER, Math.sin(t * Math.PI) * 0.8);
    g.beginPath();
    g.arc(9, -42, 61, a - 0.8, a + 0.25);
    g.strokePath();
    g.lineStyle(0.7, CHALK, Math.sin(t * Math.PI) * 0.4);
    g.beginPath();
    g.arc(9, -42, 68, a - 0.5, a + 0.22);
    g.strokePath();
    line(
      g,
      [
        [16, -41],
        [16 + Math.cos(a) * 68, -41 + Math.sin(a) * 61],
      ],
      PAPER,
      0.35,
      1,
    );
  }
  if (parry) {
    const a = Math.max(0.1, 1 - p.actionTime / 0.32);
    g.lineStyle(1.2, 0xe4d0a1, a * 0.8).strokeCircle(17, -56, 16 + a * 5);
    line(
      g,
      [
        [17, -84],
        [17, -29],
      ],
      0xf4e7c4,
      a,
      1,
    );
    line(
      g,
      [
        [-7, -56],
        [40, -56],
      ],
      0xf4e7c4,
      a,
      1,
    );
    line(
      g,
      [
        [5, -70],
        [29, -42],
      ],
      PAPER,
      a * 0.5,
      0.8,
    );
  }
}

function drawBoss(g: G, b: BossVisual, time: number, reduced: boolean) {
  const facing = Math.cos(b.facing) >= 0 ? 1 : -1;
  g.clear();
  g.setPosition(b.x, b.y)
    .setScale(facing, 1)
    .setDepth(100 + b.y);
  const phase = b.phase === 2,
    attack = b.action === "attack",
    moving = b.action === "move";
  const breathe = reduced ? 0 : Math.sin(time * (phase ? 3.3 : 1.65)) * 2.5;
  const step = moving ? Math.sin(time * 6) : 0;
  const reach = attack
    ? Math.sin(Math.min(1, b.actionTime / 0.3) * Math.PI) * 64
    : 0;
  const windup = b.action === "parry" ? Math.min(1, b.actionTime / 0.65) : 0;
  const rage = phase ? 8 : 0;
  const chalk = b.action === "hurt" ? 0xf5e8bf : phase ? 0xd7c3ae : CHALK;
  g.setAlpha(b.action === "dead" ? 0.55 : 1);
  if (b.action === "dead") g.setScale(facing * 0.95, 0.65);
  // Torn cloak and the hollow silhouette of a ruined, walking belfry.
  polygon(
    g,
    [
      [-25, -166 + breathe],
      [5, -175 + breathe],
      [35, -149],
      [46, -111],
      [38, -74],
      [49, -41],
      [31, -51],
      [29, -16],
      [12, -40],
      [3, -22],
      [-2, -48],
      [-24, -28],
      [-20, -52],
      [-43, -38],
      [-30, -81],
      [-53, -108],
      [-51, -140],
    ],
    0x141b1b,
    1,
    chalk,
    0.6,
    1.2,
  );
  polygon(
    g,
    [
      [-47, -137],
      [-25, -151],
      [-11, -103],
      [-14, -67],
      [-35, -43],
      [-26, -79],
      [-43, -94],
    ],
    0x313831,
    0.8,
    chalk,
    0.25,
    0.8,
  );
  for (let i = 0; i < 16; i++) {
    const x = -40 + i * 5;
    line(
      g,
      [
        [x, -115 + (i % 4) * 3],
        [x + 5, -80 + (i % 3) * 8],
        [x - 3, -48 + (i % 4) * 5],
      ],
      chalk,
      0.12,
      0.8,
    );
  }
  // Uneven digitigrade legs. Bone contours show through ragged cloth.
  bone(
    g,
    [
      [-27, -77],
      [-53, -44 - step * 6],
      [-40 - step * 9, -12],
      [-58 - step * 9, -2],
    ],
    7,
    chalk,
  );
  bone(
    g,
    [
      [24, -75],
      [42, -44 + step * 5],
      [30 + step * 8, -11],
      [52 + step * 8, -1],
    ],
    8,
    chalk,
  );
  for (let i = 0; i < 3; i++) {
    line(
      g,
      [
        [-57 - step * 9 + i * 5, -3],
        [-63 - step * 9 + i * 5, 2],
      ],
      chalk,
      0.7,
      1.4,
    );
    line(
      g,
      [
        [47 + step * 8 + i * 5, -2],
        [53 + step * 8 + i * 6, 2],
      ],
      chalk,
      0.7,
      1.4,
    );
  }
  // Long rear arm, supported by mismatched joints and five sharp fingers.
  bone(
    g,
    [
      [-37, -140 + breathe],
      [-76, -97 + breathe],
      [-72, -40],
      [-88, -19],
    ],
    7,
    chalk,
  );
  for (let i = 0; i < 4; i++)
    line(
      g,
      [
        [-88 + i * 4, -23],
        [-97 + i * 5, -11],
        [-94 + i * 5, -4],
      ],
      chalk,
      0.6,
      1.7,
    );
  g.fillStyle(0x55594c, 0.75).fillCircle(-76, -97 + breathe, 5);
  // A cracked bell hangs inside the rib cage. The negative space matters as
  // much as the bright bones; this isn't a solid suit of armour.
  polygon(
    g,
    [
      [-7, -149 + breathe],
      [9, -146 + breathe],
      [19, -122],
      [23, -93],
      [35, -83],
      [-24, -81],
      [-13, -95],
      [-12, -126],
    ],
    0x343b32,
    1,
    chalk,
    0.65,
    1.1,
  );
  line(
    g,
    [
      [-20, -84],
      [31, -85],
    ],
    chalk,
    0.8,
    2,
  );
  line(
    g,
    [
      [-6, -136],
      [-1, -121],
      [-7, -115],
      [3, -103],
      [-2, -84],
    ],
    0x0d1514,
    0.95,
    3,
  );
  line(
    g,
    [
      [-5, -136],
      [0, -122],
      [-5, -115],
      [5, -103],
      [0, -87],
    ],
    chalk,
    0.38,
    0.8,
  );
  line(
    g,
    [
      [3, -82],
      [3, -66],
    ],
    chalk,
    0.68,
    2.5,
  );
  polygon(
    g,
    [
      [-2, -66],
      [6, -68],
      [9, -61],
      [3, -56],
      [-3, -61],
    ],
    0x5d6353,
    1,
    chalk,
    0.65,
  );
  for (let i = 0; i < 5; i++) {
    const y = -143 + i * 11;
    line(
      g,
      [
        [-1, y],
        [-18 - i, y + 3],
        [-26 - i, y + 9],
      ],
      chalk,
      0.68,
      2.3,
    );
    line(
      g,
      [
        [8, y],
        [26 + i, y + 2],
        [32 + i, y + 8],
      ],
      chalk,
      0.64,
      2.4,
    );
  }
  line(
    g,
    [
      [3, -158],
      [1, -145],
      [4, -129],
      [2, -110],
    ],
    chalk,
    0.7,
    3,
  );
  // A bowed neck and avian stone skull, pierced by a broken crown of branches.
  bone(
    g,
    [
      [2, -156 + breathe],
      [16, -173 + breathe - rage],
      [31, -177 + breathe - rage],
    ],
    8,
    chalk,
  );
  polygon(
    g,
    [
      [13, -187 + breathe - rage],
      [28, -201 + breathe - rage],
      [47, -193 + breathe - rage],
      [59, -178 + breathe - rage],
      [49, -169 + breathe - rage],
      [39, -166 + breathe - rage],
      [31, -151 + breathe - rage],
      [19, -168 + breathe - rage],
    ],
    0x55594c,
    1,
    chalk,
    0.9,
    1.4,
  );
  polygon(
    g,
    [
      [29, -190 + breathe - rage],
      [48, -185 + breathe - rage],
      [44, -177 + breathe - rage],
      [30, -175 + breathe - rage],
    ],
    0x0c1514,
    1,
    chalk,
    0.25,
    0.7,
  );
  line(
    g,
    [
      [34, -179 + breathe - rage],
      [44, -181 + breathe - rage],
    ],
    phase ? 0xffad79 : 0xe4ddaa,
    0.95,
    phase ? 2 : 1.3,
  );
  line(
    g,
    [
      [29, -198 + breathe - rage],
      [26, -187 + breathe - rage],
      [30, -181 + breathe - rage],
    ],
    chalk,
    0.65,
    1.2,
  );
  line(
    g,
    [
      [44, -169 + breathe - rage],
      [34, -161 + breathe - rage],
      [32, -170 + breathe - rage],
    ],
    chalk,
    0.8,
    1.4,
  );
  for (let i = 0; i < 4; i++)
    line(
      g,
      [
        [36 + i * 3, -170 + breathe - rage],
        [34 + i * 3, -162 + breathe - rage],
      ],
      chalk,
      0.75,
      0.9,
    );
  const crown: Point[][] = [
    [
      [20, -192],
      [4, -213],
      [-7, -235],
      [-9, -256],
    ],
    [
      [5, -212],
      [-14, -220],
      [-25, -238],
    ],
    [
      [-7, -235],
      [-22, -248],
      [-28, -250],
    ],
    [
      [30, -200],
      [29, -222],
      [45, -242],
      [47, -258],
    ],
    [
      [29, -222],
      [18, -240],
      [20, -252],
    ],
    [
      [43, -239],
      [58, -244],
      [66, -257],
    ],
    [
      [22, -200],
      [12, -227],
      [10, -248],
    ],
  ];
  crown.forEach((p, i) =>
    bone(
      g,
      p.map(([x, y]) => [x, y + breathe - rage]),
      i === 0 || i === 3 ? 3.6 : 2,
      chalk,
    ),
  );
  // Attack arm pulls its enormous hook outward during a strike.
  const elbow: Point = [
    54 + reach * 0.3,
    -117 + breathe + reach * 0.4 - windup * 45,
  ];
  const wrist: Point = [70 + reach, -58 + breathe - reach * 0.1 - windup * 158];
  bone(g, [[31, -145 + breathe], elbow, wrist], 9, chalk);
  g.fillStyle(0x6a6b59, 0.7).fillCircle(elbow[0], elbow[1], 5);
  polygon(
    g,
    [
      [wrist[0] - 5, wrist[1] - 8],
      [wrist[0] + 10, wrist[1] - 5],
      [wrist[0] + 13, wrist[1] + 9],
      [wrist[0] + 2, wrist[1] + 16],
      [wrist[0] - 5, wrist[1] + 5],
    ],
    0x343b32,
    1,
    chalk,
    0.7,
    1,
  );
  for (let i = 0; i < 4; i++)
    line(
      g,
      [
        [wrist[0] + i * 4, wrist[1] + 8],
        [wrist[0] + 12 + i * 6, wrist[1] + 29],
        [wrist[0] + 7 + i * 7, wrist[1] + 41],
      ],
      chalk,
      0.85,
      2 - i * 0.2,
    );
  line(
    g,
    [
      [wrist[0] - 3, wrist[1]],
      [wrist[0] - 15, wrist[1] + 10],
      [wrist[0] - 10, wrist[1] + 24],
    ],
    chalk,
    0.7,
    2,
  );
  if (phase) {
    line(
      g,
      [
        [-8, -118],
        [0, -111],
        [-4, -98],
        [4, -89],
      ],
      0xce714f,
      0.85,
      1.4,
    );
    line(
      g,
      [
        [5, -148],
        [11, -139],
        [7, -124],
      ],
      0xe39c6c,
      0.7,
      1,
    );
    for (let i = 0; i < 5; i++)
      line(
        g,
        [
          [-31 + i * 14, -46],
          [-35 + i * 14, -65],
        ],
        0xc98158,
        0.22,
        1,
      );
  }
  if (attack && reach > 9) {
    g.lineStyle(1.5, phase ? 0xe4ac7e : CHALK, 0.42);
    g.beginPath();
    g.arc(30, -73, 93, -0.9, 0.7);
    g.strokePath();
    g.lineStyle(0.7, CHALK, 0.18);
    g.beginPath();
    g.arc(27, -72, 101, -0.85, 0.65);
    g.strokePath();
  }
}

function drawTelegraph(g: G, t: TelegraphVisual, time: number) {
  const color = t.parryable ? 0xd3bb80 : 0xc87462;
  const alpha = t.active ? 0.66 : 0.13 + t.progress * 0.3;
  const r = t.radius;
  const ellipse = (radius: number) =>
    g
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
    polygon(g, pts, color, 0.025 + t.progress * 0.035, color, alpha, 1);
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
    polygon(g, pts, color, 0.022 + t.progress * 0.028, color, alpha, 0.9);
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
    paintWorld(texture.context);
    texture.refresh();
  }
  const backdrop = scene.add.image(W / 2, H / 2, key).setDepth(0);
  const eclipse = scene.add.graphics().setDepth(1);
  const shadows = scene.add.graphics().setDepth(30);
  const marks = scene.add.graphics().setDepth(40);
  const hunter = scene.add.graphics();
  const boss = scene.add.graphics();
  const atmosphere = scene.add.graphics().setDepth(800);
  const flashes = scene.add.graphics().setDepth(900);
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
      eclipse.clear();
      if (phaseMix > 0) {
        eclipse.fillStyle(0x652817, 0.11 * phaseMix).fillRect(0, 0, W, H);
        eclipse.fillStyle(0x172021, 0.94 * phaseMix).fillCircle(793, 167, 126);
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
        const x = (i * 197.13 + t * (3 + (i % 5) * 1.4)) % W,
          y = (i * 113.47 - t * (1.5 + (i % 4)) + 7200) % H;
        const a = 0.08 + Math.sin(i * 2.7 + t * 0.7) * 0.055;
        atmosphere
          .lineStyle(i % 7 === 0 ? 1.5 : 0.7, CHALK, a)
          .lineBetween(x, y, x + 2 + (i % 3), y - 1);
      }
      if (phaseMix > 0.05)
        for (let i = 0; i < 23; i++) {
          const x = (i * 197.6 + Math.sin(t * 0.6 + i) * 17) % W,
            y = 720 - ((i * 71 + t * (12 + (i % 5) * 4)) % 550);
          atmosphere
            .lineStyle(0.9, 0xd59c70, (0.18 + (i % 3) * 0.07) * phaseMix)
            .lineBetween(x, y, x + 1, y - 3);
        }
      for (const p of v.particles) {
        atmosphere
          .fillStyle(p.color, p.alpha)
          .fillCircle(p.x, p.y, Math.max(0.5, p.size));
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
          .fillRect(0, 0, W, H);
      if (v.slow && !v.reducedMotion) {
        flashes.lineStyle(0.5, CHALK, 0.1).strokeRect(17, 17, W - 34, H - 34);
      }
    },
    destroy() {
      backdrop.destroy();
      eclipse.destroy();
      shadows.destroy();
      marks.destroy();
      hunter.destroy();
      boss.destroy();
      atmosphere.destroy();
      flashes.destroy();
      scene.textures.remove(key);
    },
  };
}
