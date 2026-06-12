// Generates the PWA PNG icons without any image dependencies by drawing
// a stylized gas pump into an RGBA buffer and encoding the PNG by hand
// (zlib comes with Node). Run with: node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

const BLUE = [37, 99, 235, 255] // #2563eb
const DARK = [30, 64, 175, 255] // #1e40af
const WHITE = [255, 255, 255, 255]

function fillRect(buf, size, x0, y0, x1, y1, [r, g, b, a]) {
  const px0 = Math.round(x0 * size)
  const py0 = Math.round(y0 * size)
  const px1 = Math.round(x1 * size)
  const py1 = Math.round(y1 * size)
  for (let y = py0; y < py1; y++) {
    for (let x = px0; x < px1; x++) {
      const i = (y * size + x) * 4
      buf[i] = r
      buf[i + 1] = g
      buf[i + 2] = b
      buf[i + 3] = a
    }
  }
}

function drawIcon(size) {
  const buf = Buffer.alloc(size * size * 4)
  fillRect(buf, size, 0, 0, 1, 1, BLUE) // full-bleed bg, maskable-safe
  fillRect(buf, size, 0.28, 0.2, 0.62, 0.8, WHITE) // pump body
  fillRect(buf, size, 0.34, 0.28, 0.56, 0.42, DARK) // screen
  fillRect(buf, size, 0.24, 0.8, 0.66, 0.86, WHITE) // base
  fillRect(buf, size, 0.62, 0.26, 0.74, 0.32, WHITE) // nozzle arm
  fillRect(buf, size, 0.68, 0.26, 0.74, 0.56, WHITE) // nozzle drop
  return buf
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePng(rgba, size) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public', { recursive: true })
for (const size of [192, 512]) {
  writeFileSync(`public/icon-${size}.png`, encodePng(drawIcon(size), size))
  console.log(`public/icon-${size}.png`)
}
