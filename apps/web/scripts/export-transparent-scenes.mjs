import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

const SCENE_MAPPINGS = [
  {
    name: 'appleForest',
    sourceJpg: '/Users/imam/.gemini/antigravity/brain/eb28a3a0-657e-4c45-9038-8d2634700254/diorama_apple_forest_1787298820352.jpg',
    outputPng: resolve(rootDir, 'public/assets/asmo-scenes/scene_apple_forest.png'),
  },
  {
    name: 'sweetBakery',
    sourceJpg: '/Users/imam/.gemini/antigravity/brain/eb28a3a0-657e-4c45-9038-8d2634700254/diorama_sweet_bakery_1787298845488.jpg',
    outputPng: resolve(rootDir, 'public/assets/asmo-scenes/scene_sweet_bakery.png'),
  },
  {
    name: 'pizzaOcean',
    sourceJpg: '/Users/imam/.gemini/antigravity/brain/eb28a3a0-657e-4c45-9038-8d2634700254/diorama_pizza_ocean_1787298877400.jpg',
    outputPng: resolve(rootDir, 'public/assets/asmo-scenes/scene_pizza_ocean.png'),
  },
  {
    name: 'clockMountain',
    sourceJpg: '/Users/imam/.gemini/antigravity/brain/eb28a3a0-657e-4c45-9038-8d2634700254/diorama_clock_mountain_1787298901584.jpg',
    outputPng: resolve(rootDir, 'public/assets/asmo-scenes/scene_clock_mountain.png'),
  },
  {
    name: 'crystalOlympic',
    sourceJpg: '/Users/imam/.gemini/antigravity/brain/eb28a3a0-657e-4c45-9038-8d2634700254/diorama_crystal_olympic_1787298922192.jpg',
    outputPng: resolve(rootDir, 'public/assets/asmo-scenes/scene_crystal_olympic.png'),
  },
]

function createPngChunk(typeStr, dataBuf) {
  const typeBuf = Buffer.from(typeStr, 'ascii')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(dataBuf.length, 0)
  const typeAndData = Buffer.concat([typeBuf, dataBuf])
  const crc = zlib.crc32(typeAndData)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc, 0)
  return Buffer.concat([lenBuf, typeAndData, crcBuf])
}

function encodeRgbaToPng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData.writeUInt8(8, 8) // 8 bit depth
  ihdrData.writeUInt8(6, 9) // RGBA color type
  ihdrData.writeUInt8(0, 10) // deflate compression
  ihdrData.writeUInt8(0, 11) // filter standard
  ihdrData.writeUInt8(0, 12) // no interlace

  const ihdrChunk = createPngChunk('IHDR', ihdrData)

  const rowLen = width * 4
  const scanlines = Buffer.alloc(height * (rowLen + 1))
  for (let y = 0; y < height; y++) {
    const scanlineOffset = y * (rowLen + 1)
    scanlines[scanlineOffset] = 0 // Filter 0 (None)
    rgbaBuffer.copy(scanlines, scanlineOffset + 1, y * rowLen, (y + 1) * rowLen)
  }

  const deflated = zlib.deflateSync(scanlines, { level: 9 })
  const idatChunk = createPngChunk('IDAT', deflated)
  const iendChunk = createPngChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
}

function convertJpgToTransparentPng(inputJpgPath, outputPngPath) {
  if (!existsSync(inputJpgPath)) {
    throw new Error(`Source image not found: ${inputJpgPath}`)
  }

  const tempBmp = resolve(rootDir, `.temp_diorama_${Date.now()}_${Math.random().toString(36).slice(2)}.bmp`)
  execSync(`sips -s format bmp "${inputJpgPath}" --out "${tempBmp}"`, { stdio: 'pipe' })
  const buf = readFileSync(tempBmp)
  unlinkSync(tempBmp)

  const offset = buf.readUInt32LE(10)
  const width = buf.readInt32LE(18)
  const rawHeight = buf.readInt32LE(22)
  const height = Math.abs(rawHeight)
  const topDown = rawHeight < 0
  const bpp = buf.readUInt16LE(28)
  const rowStride = Math.floor((bpp * width + 31) / 32) * 4

  const totalPixels = width * height
  const rArr = new Uint8Array(totalPixels)
  const gArr = new Uint8Array(totalPixels)
  const bArr = new Uint8Array(totalPixels)
  const alphaArr = new Uint8Array(totalPixels)

  for (let y = 0; y < height; y++) {
    const actualY = topDown ? y : (height - 1 - y)
    const rowOffset = offset + actualY * rowStride
    const yIdx = y * width
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + x * (bpp / 8)
      const idx = yIdx + x
      bArr[idx] = buf[pxOffset]
      gArr[idx] = buf[pxOffset + 1]
      rArr[idx] = buf[pxOffset + 2]
      alphaArr[idx] = 255
    }
  }

  // Flood fill (BFS) from all borders to isolate the outer background
  const visited = new Uint8Array(totalPixels)
  const queue = new Int32Array(totalPixels)
  let qHead = 0
  let qTail = 0

  function isBackgroundCandidate(idx) {
    const r = rArr[idx]
    const g = gArr[idx]
    const b = bArr[idx]
    // Near white with low saturation (neutral background)
    const maxVal = Math.max(r, g, b)
    const minVal = Math.min(r, g, b)
    return minVal >= 220 && (maxVal - minVal) <= 30
  }

  // Seed borders
  for (let x = 0; x < width; x++) {
    const topIdx = x
    const botIdx = (height - 1) * width + x
    if (isBackgroundCandidate(topIdx) && !visited[topIdx]) {
      visited[topIdx] = 1
      queue[qTail++] = topIdx
    }
    if (isBackgroundCandidate(botIdx) && !visited[botIdx]) {
      visited[botIdx] = 1
      queue[qTail++] = botIdx
    }
  }

  for (let y = 0; y < height; y++) {
    const leftIdx = y * width
    const rightIdx = y * width + (width - 1)
    if (isBackgroundCandidate(leftIdx) && !visited[leftIdx]) {
      visited[leftIdx] = 1
      queue[qTail++] = leftIdx
    }
    if (isBackgroundCandidate(rightIdx) && !visited[rightIdx]) {
      visited[rightIdx] = 1
      queue[qTail++] = rightIdx
    }
  }

  // BFS traversal for connected outer background
  while (qHead < qTail) {
    const curr = queue[qHead++]
    const cx = curr % width
    const cy = Math.floor(curr / width)

    if (cx > 0) {
      const n = curr - 1
      if (!visited[n] && isBackgroundCandidate(n)) {
        visited[n] = 1
        queue[qTail++] = n
      }
    }
    if (cx < width - 1) {
      const n = curr + 1
      if (!visited[n] && isBackgroundCandidate(n)) {
        visited[n] = 1
        queue[qTail++] = n
      }
    }
    if (cy > 0) {
      const n = curr - width
      if (!visited[n] && isBackgroundCandidate(n)) {
        visited[n] = 1
        queue[qTail++] = n
      }
    }
    if (cy < height - 1) {
      const n = curr + width
      if (!visited[n] && isBackgroundCandidate(n)) {
        visited[n] = 1
        queue[qTail++] = n
      }
    }
  }

  // Smooth edge alpha calculation + white defringing
  for (let i = 0; i < totalPixels; i++) {
    if (visited[i]) {
      const r = rArr[i]
      const g = gArr[i]
      const b = bArr[i]
      const minVal = Math.min(r, g, b)
      const diffFromWhite = 255 - minVal

      if (diffFromWhite <= 5) {
        alphaArr[i] = 0
        rArr[i] = 0
        gArr[i] = 0
        bArr[i] = 0
      } else {
        const a = Math.min(255, Math.max(0, Math.round(((diffFromWhite - 5) / 15) * 255)))
        alphaArr[i] = a
        if (a > 0) {
          const normA = a / 255
          rArr[i] = Math.min(255, Math.max(0, Math.round((r - 255 * (1 - normA)) / normA)))
          gArr[i] = Math.min(255, Math.max(0, Math.round((g - 255 * (1 - normA)) / normA)))
          bArr[i] = Math.min(255, Math.max(0, Math.round((b - 255 * (1 - normA)) / normA)))
        } else {
          rArr[i] = 0
          gArr[i] = 0
          bArr[i] = 0
        }
      }
    }
  }

  // Pack RGBA buffer
  const rgbaBuffer = Buffer.alloc(totalPixels * 4)
  for (let i = 0; i < totalPixels; i++) {
    const px = i * 4
    rgbaBuffer[px] = rArr[i]
    rgbaBuffer[px + 1] = gArr[i]
    rgbaBuffer[px + 2] = bArr[i]
    rgbaBuffer[px + 3] = alphaArr[i]
  }

  const pngBuf = encodeRgbaToPng(width, height, rgbaBuffer)
  mkdirSync(dirname(outputPngPath), { recursive: true })
  writeFileSync(outputPngPath, pngBuf)
  console.log(`✓ Exported transparent PNG: ${outputPngPath} (${(pngBuf.length / 1024).toFixed(1)} KB)`)
}

console.log('🚀 Converting 5 Soft Clay diorama scenes to transparent PNG cutouts...')
for (const scene of SCENE_MAPPINGS) {
  convertJpgToTransparentPng(scene.sourceJpg, scene.outputPng)
}
console.log('✨ All 5 transparent diorama scenes successfully created!')
