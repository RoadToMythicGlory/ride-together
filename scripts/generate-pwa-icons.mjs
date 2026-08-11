/**
 * Generates solid-brand PWA icons (no external deps).
 * Replace with designed assets before production App Store screenshots.
 */
import { deflateSync } from 'zlib';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../apps/web/public/icons');
const mobileResourcesDir = join(__dirname, '../apps/mobile/resources');
mkdirSync(outDir, { recursive: true });
mkdirSync(mobileResourcesDir, { recursive: true });

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

/** Solid #00A3A3 PNG */
function png(size, { inset = 0, insetColor = null } = {}) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const r = 0x00;
  const g = 0xa3;
  const b = 0xa3;
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x++) {
      const i = row + 1 + x * 4;
      const inSafe = inset > 0 && (x < inset || y < inset || x >= size - inset || y >= size - inset);
      if (inSafe && insetColor) {
        raw[i] = insetColor[0];
        raw[i + 1] = insetColor[1];
        raw[i + 2] = insetColor[2];
        raw[i + 3] = 255;
      } else {
        raw[i] = r;
        raw[i + 1] = g;
        raw[i + 2] = b;
        raw[i + 3] = 255;
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

writeFileSync(join(outDir, 'icon-192.png'), png(192));
writeFileSync(join(outDir, 'icon-512.png'), png(512));
writeFileSync(join(outDir, 'icon-512-maskable.png'), png(512, { inset: 64, insetColor: [0xf3, 0xf5, 0xf7] }));
writeFileSync(join(outDir, 'apple-touch-icon.png'), png(180));
writeFileSync(join(mobileResourcesDir, 'icon-1024.png'), png(1024));
console.log('PWA icons written to', outDir);
console.log('Capacitor master icon written to', join(mobileResourcesDir, 'icon-1024.png'));
