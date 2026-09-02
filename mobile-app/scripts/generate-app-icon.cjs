const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZE = 1024;
const output = path.join(__dirname, '..', 'assets', 'icon.png');

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const mix = (a, b, t) => a + (b - a) * t;
const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
const hex = (value) => [
  parseInt(value.slice(1, 3), 16),
  parseInt(value.slice(3, 5), 16),
  parseInt(value.slice(5, 7), 16),
];
const blend = (base, over, alpha) => [
  Math.round(mix(base[0], over[0], alpha)),
  Math.round(mix(base[1], over[1], alpha)),
  Math.round(mix(base[2], over[2], alpha)),
];

// Raster adaptation of Tidefall's existing app-icon.svg for native app stores.
// iOS applies its own icon mask, so the artwork fills the full square and has
// no transparent or pre-rounded corners.
const bgA = hex('#0a2633');
const bgB = hex('#041019');
const ring = hex('#7fdff0');
const waveA = hex('#78dff2');
const waveB = hex('#dffaff');
const wave2 = hex('#88e5f5');
const moon = hex('#e8fbff');

const pixels = Buffer.alloc(SIZE * SIZE * 3);

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const i = (y * SIZE + x) * 3;
    const bgT = clamp((x + y) / (2 * (SIZE - 1)));
    let color = [
      Math.round(mix(bgA[0], bgB[0], bgT)),
      Math.round(mix(bgA[1], bgB[1], bgT)),
      Math.round(mix(bgA[2], bgB[2], bgT)),
    ];

    const dx = x - 512;
    const dy = y - 512;
    const radius = Math.hypot(dx, dy);
    const ringDist = Math.abs(radius - 332);
    const ringAlpha = (1 - smoothstep(10, 14, ringDist)) * 0.22;
    if (ringAlpha > 0) color = blend(color, ring, ringAlpha);

    if (x >= 188 && x <= 836) {
      const t = (x - 188) / (836 - 188);
      const centerY = 542 - 104 * Math.sin(t * Math.PI * 2);
      const dist = Math.abs(y - centerY);
      const alpha = 1 - smoothstep(28, 34, dist);
      if (alpha > 0) {
        const tide = [
          Math.round(mix(waveA[0], waveB[0], t)),
          Math.round(mix(waveA[1], waveB[1], t)),
          Math.round(mix(waveA[2], waveB[2], t)),
        ];
        color = blend(color, tide, alpha);
      }
    }

    if (x >= 234 && x <= 790) {
      const t = (x - 234) / (790 - 234);
      const centerY = 674 - 70 * Math.sin(t * Math.PI * 2);
      const dist = Math.abs(y - centerY);
      const alpha = (1 - smoothstep(15, 20, dist)) * 0.58;
      if (alpha > 0) color = blend(color, wave2, alpha);
    }

    const moonDist = Math.hypot(x - 512, y - 362);
    const moonAlpha = 1 - smoothstep(66, 70, moonDist);
    if (moonAlpha > 0) color = blend(color, moon, moonAlpha);

    pixels[i] = color[0];
    pixels[i + 1] = color[1];
    pixels[i + 2] = color[2];
  }
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

const rows = [];
for (let y = 0; y < SIZE; y++) {
  rows.push(Buffer.from([0]));
  rows.push(pixels.subarray(y * SIZE * 3, (y + 1) * SIZE * 3));
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8;
ihdr[9] = 2;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, png);
console.log(`Generated Tidefall app icon: ${output}`);
